const { Banner, Page, Setting, Coupon, StockLog, SalesLog, User, Order, Product, PendingApproval, ActivityLog, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const slugify = require('slugify');
const { processImage, deleteImage } = require('../middleware/upload');
const { cacheFlush } = require('../config/redis');
const emailService = require('../services/emailService');

// ==================== BANNER/SLIDER ====================

// Banner listesi
exports.getBanners = async (req, res, next) => {
  try {
    const { active } = req.query;
    const where = {};
    
    if (active === 'true') {
      const now = new Date();
      where.isActive = true;
      where[Op.and] = [
        {
          [Op.or]: [
            { startDate: null },
            { startDate: { [Op.lte]: now } }
          ]
        },
        {
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: now } }
          ]
        }
      ];
    }

    const banners = await Banner.findAll({
      where,
      order: [['sortOrder', 'ASC']]
    });

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};

// Banner oluştur
exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, link, buttonText, sortOrder, startDate, endDate } = req.body;

    let image = null;
    let mobileImage = null;

    if (req.files?.image) {
      image = await processImage(req.files.image[0], 'banners', {
        width: 1920,
        height: 600
      });
    }

    if (req.files?.mobileImage) {
      mobileImage = await processImage(req.files.mobileImage[0], 'banners', {
        width: 768,
        height: 400
      });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      image,
      mobileImage,
      link,
      buttonText,
      sortOrder: sortOrder || 0,
      startDate,
      endDate
    });

    await cacheFlush('banners:*');

    res.status(201).json({
      success: true,
      message: 'Banner oluşturuldu',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

// Banner güncelle
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner bulunamadı'
      });
    }

    if (req.files?.image) {
      if (banner.image) deleteImage(banner.image);
      updateData.image = await processImage(req.files.image[0], 'banners', {
        width: 1920,
        height: 600
      });
    }

    if (req.files?.mobileImage) {
      if (banner.mobileImage) deleteImage(banner.mobileImage);
      updateData.mobileImage = await processImage(req.files.mobileImage[0], 'banners', {
        width: 768,
        height: 400
      });
    }

    await banner.update(updateData);
    await cacheFlush('banners:*');

    res.json({
      success: true,
      message: 'Banner güncellendi',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

// Banner sil
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner bulunamadı'
      });
    }

    if (banner.image) deleteImage(banner.image);
    if (banner.mobileImage) deleteImage(banner.mobileImage);

    await banner.destroy();
    await cacheFlush('banners:*');

    res.json({
      success: true,
      message: 'Banner silindi'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SAYFALAR ====================

// Sayfa listesi
exports.getPages = async (req, res, next) => {
  try {
    const pages = await Page.findAll({
      order: [['title', 'ASC']]
    });

    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    next(error);
  }
};

// Tek sayfa (Public)
exports.getPage = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const page = await Page.findOne({
      where: { slug, isActive: true }
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    next(error);
  }
};

// Sayfa oluştur (Admin only)
exports.createPage = async (req, res, next) => {
  try {
    const { title, content, metaTitle, metaDescription } = req.body;

    let slug = slugify(title, { lower: true, strict: true });
    const existing = await Page.findOne({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const page = await Page.create({
      title,
      slug,
      content,
      metaTitle: metaTitle || title,
      metaDescription
    });

    res.status(201).json({
      success: true,
      message: 'Sayfa oluşturuldu',
      data: page
    });
  } catch (error) {
    next(error);
  }
};

// Sayfa güncelle (Admin only)
exports.updatePage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    if (updateData.title && updateData.title !== page.title) {
      let slug = slugify(updateData.title, { lower: true, strict: true });
      const existing = await Page.findOne({
        where: { slug, id: { [Op.ne]: id } }
      });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }

    await page.update(updateData);

    res.json({
      success: true,
      message: 'Sayfa güncellendi',
      data: page
    });
  } catch (error) {
    next(error);
  }
};

// Sayfa sil (Admin only)
exports.deletePage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
      });
    }

    await page.destroy();

    res.json({
      success: true,
      message: 'Sayfa silindi'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== AYARLAR ====================

// Ayarları getir
exports.getSettings = async (req, res, next) => {
  try {
    const { group } = req.query;
    const where = {};
    if (group) where.group = group;

    const settings = await Setting.findAll({ where });

    // Key-value formatına çevir
    const settingsObj = {};
    settings.forEach(s => {
      let value = s.value;
      if (s.type === 'boolean') value = value === 'true';
      else if (s.type === 'number') value = parseFloat(value);
      else if (s.type === 'json') value = JSON.parse(value || '{}');
      settingsObj[s.key] = value;
    });

    res.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    next(error);
  }
};

// Ayar güncelle (Admin only)
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = req.body; // { key: value, ... }

    for (const [key, value] of Object.entries(settings)) {
      let setting = await Setting.findOne({ where: { key } });
      
      const stringValue = typeof value === 'object' 
        ? JSON.stringify(value) 
        : String(value);

      if (setting) {
        await setting.update({ value: stringValue });
      } else {
        await Setting.create({
          key,
          value: stringValue,
          type: typeof value === 'boolean' ? 'boolean' 
            : typeof value === 'number' ? 'number'
            : typeof value === 'object' ? 'json' : 'text'
        });
      }
    }

    await cacheFlush('settings:*');

    res.json({
      success: true,
      message: 'Ayarlar güncellendi'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== KUPONLAR ====================

// Kupon listesi
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

// Kupon oluştur
exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startDate,
      endDate
    } = req.body;

    const existing = await Coupon.findOne({
      where: { code: code.toUpperCase() }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Bu kupon kodu zaten mevcut'
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startDate,
      endDate
    });

    res.status(201).json({
      success: true,
      message: 'Kupon oluşturuldu',
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

// Kupon güncelle
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Kupon bulunamadı'
      });
    }

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
      const existing = await Coupon.findOne({
        where: { code: updateData.code, id: { [Op.ne]: id } }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Bu kupon kodu zaten mevcut'
        });
      }
    }

    await coupon.update(updateData);

    res.json({
      success: true,
      message: 'Kupon güncellendi',
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

// Kupon sil
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Kupon bulunamadı'
      });
    }

    await coupon.destroy();

    res.json({
      success: true,
      message: 'Kupon silindi'
    });
  } catch (error) {
    next(error);
  }
};

// Kupon doğrula (Public)
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
        isActive: true
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Kupon bulunamadı'
      });
    }

    // Tarih kontrolü
    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return res.status(400).json({
        success: false,
        message: 'Bu kupon henüz aktif değil'
      });
    }

    if (coupon.endDate && coupon.endDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Bu kuponun süresi dolmuş'
      });
    }

    // Kullanım limiti
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Bu kuponun kullanım limiti dolmuş'
      });
    }

    // Minimum tutar
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum sipariş tutarı ${coupon.minOrderAmount} TL`
      });
    }

    // İndirim hesapla
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: discount
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== STOK LOGLARI ====================

// Stok logları (Manager/Admin)
exports.getStockLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, productId, status, type } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (productId) where.productId = productId;
    if (status) where.status = status;
    if (type) where.type = type;

    const { count, rows: logs } = await StockLog.findAndCountAll({
      where,
      include: [
        { model: Product, attributes: ['id', 'name', 'sku'] },
        { model: User, attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        logs,
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

// Stok onaylama (Manager/Admin)
exports.approveStockLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' veya 'rejected'
    const approverId = req.user.id;

    const log = await StockLog.findByPk(id, {
      include: [{ model: Product }]
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Stok logu bulunamadı'
      });
    }

    if (log.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bu log zaten işlenmiş'
      });
    }

    if (status === 'approved') {
      // Stok güncelle
      const product = log.product;
      if (log.type === 'out') {
        await product.decrement('stock', { by: log.quantity });
      } else if (log.type === 'in') {
        await product.increment('stock', { by: log.quantity });
      } else {
        await product.update({ stock: log.newStock });
      }
    }

    await log.update({
      status,
      approvedBy: approverId
    });

    res.json({
      success: true,
      message: status === 'approved' ? 'Stok hareketi onaylandı' : 'Stok hareketi reddedildi'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SATIŞ LOGLARI ====================

// Satış logları (Manager/Admin)
exports.getSalesLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, staffId, orderId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    // Personel sadece kendi loglarını görebilir
    if (req.user.role === 'staff') {
      where.staffId = req.user.id;
    } else if (staffId) {
      where.staffId = staffId;
    }

    if (orderId) where.orderId = orderId;

    const { count, rows: logs } = await SalesLog.findAndCountAll({
      where,
      include: [
        { model: Order, attributes: ['id', 'orderNumber', 'total'] },
        { model: User, as: 'staff', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        logs,
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

// ==================== DASHBOARD ====================

// Dashboard istatistikleri (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Bugünkü siparişler
    const todayOrders = await Order.count({
      where: { createdAt: { [Op.gte]: today } }
    });

    // Bu ayki siparişler
    const monthlyOrders = await Order.count({
      where: { createdAt: { [Op.gte]: thisMonth } }
    });

    // Bugünkü gelir
    const todayRevenue = await Order.sum('total', {
      where: {
        createdAt: { [Op.gte]: today },
        paymentStatus: 'paid'
      }
    });

    // Bu ayki gelir
    const monthlyRevenue = await Order.sum('total', {
      where: {
        createdAt: { [Op.gte]: thisMonth },
        paymentStatus: 'paid'
      }
    });

    // Toplam kullanıcı
    const totalUsers = await User.count({
      where: { role: 'customer' }
    });

    // Toplam ürün
    const totalProducts = await Product.count();

    // Düşük stoklu ürünler
    const lowStockProducts = await Product.count({
      where: {
        trackStock: true,
        stock: { [Op.lte]: sequelize.col('low_stock_threshold') }
      }
    });

    // Bekleyen siparişler
    const pendingOrders = await Order.count({
      where: { status: 'pending' }
    });

    // Onay bekleyen işlemler
    const pendingApprovals = await PendingApproval.count({
      where: { status: 'pending' }
    });

    res.json({
      success: true,
      data: {
        todayOrders,
        monthlyOrders,
        todayRevenue: todayRevenue || 0,
        monthlyRevenue: monthlyRevenue || 0,
        totalUsers,
        totalProducts,
        lowStockProducts,
        pendingOrders,
        pendingApprovals
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PENDING APPROVALS ====================

// Onay bekleyen işlemleri listele
exports.getPendingApprovals = async (req, res, next) => {
  try {
    const { status = 'pending', type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const { count, rows } = await PendingApproval.findAndCountAll({
      where,
      include: [
        { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] },
        { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // İlgili entity bilgilerini getir
    for (const approval of rows) {
      if (approval.entityType === 'product') {
        approval.dataValues.entity = await Product.findByPk(approval.entityId, {
          attributes: ['id', 'name', 'slug', 'price', 'featuredImage']
        });
      }
    }

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Onay ver
exports.approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const approval = await PendingApproval.findByPk(id, {
      include: [{ model: User, as: 'requester' }]
    });

    if (!approval) {
      return res.status(404).json({ success: false, message: 'Onay talebi bulunamadı' });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Bu talep zaten işlenmiş' });
    }

    // Yetki kontrolü - sadece manager ve admin onaylayabilir
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok' });
    }

    // İşlemi uygula
    if (approval.type === 'price_change' && approval.entityType === 'product') {
      await Product.update(
        { price: approval.newValue.price, comparePrice: approval.newValue.comparePrice },
        { where: { id: approval.entityId } }
      );
    } else if (approval.type === 'product_visibility' && approval.entityType === 'product') {
      await Product.update(
        { 
          isRemovedFromSale: approval.newValue.isRemovedFromSale,
          removedAt: approval.newValue.isRemovedFromSale ? new Date() : null,
          removedBy: approval.newValue.isRemovedFromSale ? req.user.id : null,
          removalReason: approval.newValue.removalReason || null
        },
        { where: { id: approval.entityId } }
      );
    }

    // Onayı güncelle
    await approval.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    // Talep edene bildirim gönder
    await Notification.create({
      userId: approval.requestedBy,
      type: 'approval_approved',
      title: 'Talebiniz Onaylandı',
      message: `${approval.type} talebiniz onaylandı.`,
      data: { approvalId: approval.id }
    });

    await cacheFlush('products:*');

    res.json({ success: true, message: 'Talep onaylandı' });
  } catch (error) {
    next(error);
  }
};

// Reddet
exports.rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const approval = await PendingApproval.findByPk(id);

    if (!approval) {
      return res.status(404).json({ success: false, message: 'Onay talebi bulunamadı' });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Bu talep zaten işlenmiş' });
    }

    // Yetki kontrolü
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok' });
    }

    await approval.update({
      status: 'rejected',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      rejectionReason: reason
    });

    // Talep edene bildirim gönder
    await Notification.create({
      userId: approval.requestedBy,
      type: 'approval_rejected',
      title: 'Talebiniz Reddedildi',
      message: `${approval.type} talebiniz reddedildi. Sebep: ${reason || 'Belirtilmedi'}`,
      data: { approvalId: approval.id }
    });

    res.json({ success: true, message: 'Talep reddedildi' });
  } catch (error) {
    next(error);
  }
};

// Fiyat değişikliği talebi oluştur (Staff için)
exports.requestPriceChange = async (req, res, next) => {
  try {
    const { productId, newPrice, newComparePrice, notes } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    }

    // Onay gerekiyor mu kontrol et
    const requireApproval = await Setting.findOne({ where: { key: 'require_price_approval' } });
    
    if (requireApproval?.value === 'true' && req.user.role === 'staff') {
      // Onay talebi oluştur
      const approval = await PendingApproval.create({
        type: 'price_change',
        entityType: 'product',
        entityId: productId,
        oldValue: { price: product.price, comparePrice: product.comparePrice },
        newValue: { price: newPrice, comparePrice: newComparePrice },
        requestedBy: req.user.id,
        notes
      });

      // Admin/Manager'lara bildirim gönder
      const managers = await User.findAll({
        where: { role: { [Op.in]: ['admin', 'manager'] }, isActive: true }
      });

      for (const manager of managers) {
        await Notification.create({
          userId: manager.id,
          type: 'approval_request',
          title: 'Yeni Onay Talebi',
          message: `${req.user.firstName} ${req.user.lastName} bir fiyat değişikliği talebi oluşturdu.`,
          data: { approvalId: approval.id }
        });
      }

      // Email bildirimi
      const adminEmail = await Setting.findOne({ where: { key: 'admin_notification_email' } });
      if (adminEmail?.value) {
        await emailService.sendApprovalRequestNotification({
          ...approval.toJSON(),
          requester: req.user
        }, adminEmail.value);
      }

      return res.json({
        success: true,
        message: 'Fiyat değişikliği talebi oluşturuldu. Onay bekleniyor.',
        data: { approvalId: approval.id }
      });
    }

    // Onay gerekmiyorsa direkt uygula
    await product.update({
      price: newPrice,
      comparePrice: newComparePrice
    });

    await cacheFlush('products:*');

    res.json({ success: true, message: 'Fiyat güncellendi' });
  } catch (error) {
    next(error);
  }
};

// ==================== PRODUCT VISIBILITY ====================

// Ürünü satıştan kaldır
exports.removeFromSale = async (req, res, next) => {
  try {
    const { productId, reason } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    }

    // Staff için onay gerekiyor
    const requireApproval = await Setting.findOne({ where: { key: 'require_visibility_approval' } });

    if (requireApproval?.value === 'true' && req.user.role === 'staff') {
      const approval = await PendingApproval.create({
        type: 'product_visibility',
        entityType: 'product',
        entityId: productId,
        oldValue: { isRemovedFromSale: product.isRemovedFromSale },
        newValue: { isRemovedFromSale: true, removalReason: reason },
        requestedBy: req.user.id,
        notes: reason
      });

      return res.json({
        success: true,
        message: 'Satıştan kaldırma talebi oluşturuldu. Onay bekleniyor.',
        data: { approvalId: approval.id }
      });
    }

    // Direkt uygula
    await product.update({
      isRemovedFromSale: true,
      removedAt: new Date(),
      removedBy: req.user.id,
      removalReason: reason
    });

    await cacheFlush('products:*');

    res.json({ success: true, message: 'Ürün satıştan kaldırıldı' });
  } catch (error) {
    next(error);
  }
};

// Ürünü tekrar satışa al
exports.returnToSale = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    }

    await product.update({
      isRemovedFromSale: false,
      removedAt: null,
      removedBy: null,
      removalReason: null
    });

    await cacheFlush('products:*');

    res.json({ success: true, message: 'Ürün tekrar satışa alındı' });
  } catch (error) {
    next(error);
  }
};

// Satıştan kaldırılan ürünleri listele
exports.getRemovedProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: { isRemovedFromSale: true },
      include: [
        { model: User, as: 'remover', attributes: ['id', 'firstName', 'lastName'], foreignKey: 'removedBy' }
      ],
      order: [['removedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== NOTIFICATIONS ====================

// Kullanıcının bildirimlerini getir
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (unreadOnly === 'true') where.isRead = false;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({
      success: true,
      data: rows,
      unreadCount,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Bildirimi okundu işaretle
exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { id, userId: req.user.id } }
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Tüm bildirimleri okundu işaretle
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ==================== ACTIVITY LOG ====================

// Aktivite loglarını getir
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, userId, entityType } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
