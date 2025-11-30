const Iyzipay = require('iyzipay');
const { Order, OrderItem, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

// İyzico yapılandırması
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
});

// Ödeme başlatma (3D Secure)
exports.initializePayment = async (req, res, next) => {
  try {
    const { orderId, cardHolderName, cardNumber, expireMonth, expireYear, cvc } = req.body;
    const userId = req.user.id;

    // Siparişi getir
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [
        { model: OrderItem, as: 'items' },
        { model: User }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Bu sipariş zaten ödenmiş'
      });
    }

    const user = order.user;
    const conversationId = uuidv4();

    // Sepet öğeleri
    const basketItems = order.items.map((item, index) => ({
      id: item.id,
      name: item.productName,
      category1: 'Perde',
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
      price: parseFloat(item.total).toFixed(2)
    }));

    // Ödeme isteği
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: parseFloat(order.subtotal).toFixed(2),
      paidPrice: parseFloat(order.total).toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      installment: '1',
      basketId: order.orderNumber,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
      paymentCard: {
        cardHolderName,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expireMonth,
        expireYear,
        cvc,
        registerCard: '0'
      },
      buyer: {
        id: user.id,
        name: user.firstName,
        surname: user.lastName,
        gsmNumber: user.phone || '+905350000000',
        email: user.email,
        identityNumber: order.shippingAddress.identityNumber || '11111111111',
        registrationAddress: order.shippingAddress.addressLine,
        ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
        city: order.shippingAddress.city,
        country: 'Turkey'
      },
      shippingAddress: {
        contactName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        city: order.shippingAddress.city,
        country: 'Turkey',
        address: order.shippingAddress.addressLine
      },
      billingAddress: {
        contactName: order.billingAddress 
          ? `${order.billingAddress.firstName} ${order.billingAddress.lastName}`
          : `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        city: order.billingAddress?.city || order.shippingAddress.city,
        country: 'Turkey',
        address: order.billingAddress?.addressLine || order.shippingAddress.addressLine
      },
      basketItems
    };

    // Conversation ID'yi kaydet
    await order.update({ iyzicoConversationId: conversationId });

    // 3D Secure ödeme başlat
    iyzipay.threedsInitialize.create(request, async (err, result) => {
      if (err) {
        console.error('İyzico hatası:', err);
        return res.status(500).json({
          success: false,
          message: 'Ödeme başlatılamadı'
        });
      }

      if (result.status !== 'success') {
        return res.status(400).json({
          success: false,
          message: result.errorMessage || 'Ödeme başlatılamadı'
        });
      }

      res.json({
        success: true,
        data: {
          threeDSHtmlContent: result.threeDSHtmlContent,
          conversationId
        }
      });
    });
  } catch (error) {
    next(error);
  }
};

// 3D Secure callback
exports.paymentCallback = async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=missing_payment_id`);
    }

    // Ödeme sonucunu al
    const request = {
      locale: Iyzipay.LOCALE.TR,
      paymentId
    };

    iyzipay.threedsPayment.retrieve(request, async (err, result) => {
      if (err) {
        console.error('İyzico callback hatası:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=callback_error`);
      }

      // Siparişi bul
      const order = await Order.findOne({
        where: { iyzicoConversationId: result.conversationId }
      });

      if (!order) {
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=order_not_found`);
      }

      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        // Ödeme başarılı
        await order.update({
          paymentStatus: 'paid',
          status: 'processing',
          iyzicoPaymentId: result.paymentId
        });

        return res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${order.id}`);
      } else {
        // Ödeme başarısız
        await order.update({
          paymentStatus: 'failed'
        });

        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=${result.errorMessage || 'payment_failed'}`);
      }
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=server_error`);
  }
};

// Ödeme durumu kontrol
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id: orderId, userId },
      attributes: ['id', 'orderNumber', 'paymentStatus', 'status', 'total']
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        total: order.total
      }
    });
  } catch (error) {
    next(error);
  }
};

// İade işlemi (Admin)
exports.refundPayment = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Bu sipariş için iade yapılamaz'
      });
    }

    if (!order.iyzicoPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Ödeme bilgisi bulunamadı'
      });
    }

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: uuidv4(),
      paymentTransactionId: order.iyzicoPaymentId,
      price: parseFloat(order.total).toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      ip: req.ip || '127.0.0.1'
    };

    iyzipay.refund.create(request, async (err, result) => {
      if (err) {
        console.error('İyzico iade hatası:', err);
        return res.status(500).json({
          success: false,
          message: 'İade işlemi başarısız'
        });
      }

      if (result.status === 'success') {
        await order.update({
          paymentStatus: 'refunded',
          status: 'refunded'
        });

        return res.json({
          success: true,
          message: 'İade işlemi başarılı'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.errorMessage || 'İade işlemi başarısız'
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

// Test ödeme (Sandbox) - SADECE DEVELOPMENT ORTAMINDA ÇALIŞIR
exports.testPayment = async (req, res, next) => {
  try {
    // Production ortamında bu endpoint'i devre dışı bırak
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test ödeme sadece geliştirme ortamında kullanılabilir'
      });
    }

    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id: orderId, userId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Bu sipariş zaten ödenmiş'
      });
    }

    // Test modunda direkt başarılı yap
    await order.update({
      paymentStatus: 'paid',
      status: 'processing',
      iyzicoPaymentId: `TEST_${Date.now()}`
    });

    res.json({
      success: true,
      message: 'Test ödeme başarılı',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    next(error);
  }
};
