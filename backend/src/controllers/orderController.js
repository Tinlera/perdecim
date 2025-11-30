const { Order, OrderItem, Cart, CartItem, Product, ProductVariant, Coupon, User, StockLog, SalesLog } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Sipariş numarası oluştur
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PRD${year}${month}${day}${random}`;
};

// Sipariş oluşturma
exports.createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { shippingAddress, billingAddress, couponCode, notes, paymentMethod } = req.body;

    // Sepeti getir
    const cart = await Cart.findOne({
      where: { userId },
      include: [{
        model: CartItem,
        as: 'items',
        include: [
          { model: Product },
          { model: ProductVariant }
        ]
      }]
    });

    if (!cart || !cart.items?.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Sepetiniz boş'
      });
    }

    // Stok kontrolü ve toplam hesaplama
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;
      const availableStock = variant ? variant.stock : product.stock;

      if (product.trackStock && availableStock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `"${product.name}" için yeterli stok yok`
        });
      }

      const price = variant?.price || product.price;
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        productId: product.id,
        variantId: variant?.id || null,
        productName: product.name,
        variantName: variant?.name || null,
        sku: variant?.sku || product.sku,
        quantity: item.quantity,
        price,
        total
      });
    }

    // Kupon kontrolü
    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          [Op.or]: [
            { startDate: null },
            { startDate: { [Op.lte]: new Date() } }
          ],
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: new Date() } }
          ],
          [Op.or]: [
            { usageLimit: null },
            { usedCount: { [Op.lt]: sequelize.col('usage_limit') } }
          ]
        }
      });

      if (!coupon) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Geçersiz veya süresi dolmuş kupon'
        });
      }

      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Bu kupon için minimum sipariş tutarı ${coupon.minOrderAmount} TL`
        });
      }

      // İndirim hesapla
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }
    }

    // Kargo ücreti (örnek: 500 TL üzeri ücretsiz)
    const shippingCost = subtotal >= 500 ? 0 : 29.90;

    // Toplam
    const total = subtotal - discount + shippingCost;

    // Sipariş oluştur
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'credit_card',
      subtotal,
      discount,
      shippingCost,
      total,
      couponId: coupon?.id || null,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes
    }, { transaction });

    // Sipariş öğelerini oluştur
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      }, { transaction });
    }

    // Stok güncelle
    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;

      if (product.trackStock) {
        const previousStock = variant ? variant.stock : product.stock;
        const newStock = previousStock - item.quantity;

        if (variant) {
          await variant.update({ stock: newStock }, { transaction });
        } else {
          await product.update({ stock: newStock }, { transaction });
        }

        // Stok logu
        await StockLog.create({
          productId: product.id,
          variantId: variant?.id || null,
          type: 'out',
          quantity: item.quantity,
          previousStock,
          newStock,
          reason: 'Sipariş',
          orderId: order.id,
          userId,
          status: 'approved'
        }, { transaction });
      }
    }

    // Kupon kullanım sayısını artır
    if (coupon) {
      await coupon.increment('usedCount', { transaction });
    }

    // Sepeti temizle
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    await transaction.commit();

    // Siparişi detaylarıyla getir
    const createdOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    res.status(201).json({
      success: true,
      message: 'Sipariş oluşturuldu',
      data: createdOrder
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Kullanıcı siparişleri
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Sipariş detayı
exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const where = { id };
    
    // Sadece admin/staff/manager tüm siparişleri görebilir
    if (!['admin', 'manager', 'staff'].includes(userRole)) {
      where.userId = userId;
    }

    const order = await Order.findOne({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: Coupon, attributes: ['code', 'discountType', 'discountValue'] }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Sipariş durumu güncelleme (Admin/Staff)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const staffId = req.user.id;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    const previousStatus = order.status;
    await order.update({ status });

    // Satış logu
    await SalesLog.create({
      orderId: order.id,
      staffId,
      action: 'status_update',
      details: {
        previousStatus,
        newStatus: status,
        notes
      }
    });

    res.json({
      success: true,
      message: 'Sipariş durumu güncellendi',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Sipariş iptal (Kullanıcı)
exports.cancelOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    // Sadece bekleyen siparişler iptal edilebilir
    if (!['pending', 'processing'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Bu sipariş iptal edilemez'
      });
    }

    // Stokları geri yükle
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId);
      
      if (product && product.trackStock) {
        if (item.variantId) {
          const variant = await ProductVariant.findByPk(item.variantId);
          if (variant) {
            const previousStock = variant.stock;
            await variant.increment('stock', { by: item.quantity, transaction });
            
            await StockLog.create({
              productId: item.productId,
              variantId: item.variantId,
              type: 'in',
              quantity: item.quantity,
              previousStock,
              newStock: previousStock + item.quantity,
              reason: 'Sipariş iptali',
              orderId: order.id,
              userId,
              status: 'approved'
            }, { transaction });
          }
        } else {
          const previousStock = product.stock;
          await product.increment('stock', { by: item.quantity, transaction });
          
          await StockLog.create({
            productId: item.productId,
            type: 'in',
            quantity: item.quantity,
            previousStock,
            newStock: previousStock + item.quantity,
            reason: 'Sipariş iptali',
            orderId: order.id,
            userId,
            status: 'approved'
          }, { transaction });
        }
      }
    }

    // Kupon kullanımını geri al
    if (order.couponId) {
      await Coupon.decrement('usedCount', {
        where: { id: order.couponId },
        transaction
      });
    }

    await order.update({
      status: 'cancelled',
      paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : 'failed'
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Sipariş iptal edildi'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Tüm siparişler (Admin/Staff)
exports.getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (search) {
      where[Op.or] = [
        { orderNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Sipariş istatistikleri (Admin)
exports.getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Toplam sipariş sayısı
    const totalOrders = await Order.count({ where });

    // Durumlara göre sipariş sayıları
    const ordersByStatus = await Order.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Toplam gelir
    const totalRevenue = await Order.sum('total', {
      where: {
        ...where,
        paymentStatus: 'paid'
      }
    });

    // Ortalama sipariş tutarı
    const avgOrderValue = await Order.findOne({
      where: {
        ...where,
        paymentStatus: 'paid'
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('total')), 'avg']
      ]
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
        totalRevenue: totalRevenue || 0,
        avgOrderValue: parseFloat(avgOrderValue?.dataValues?.avg || 0).toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};
