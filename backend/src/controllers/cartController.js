const { Cart, CartItem, Product, ProductVariant } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Sepet getir veya oluştur
const getOrCreateCart = async (userId, sessionId) => {
  let cart;

  if (userId) {
    cart = await Cart.findOne({
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

    if (!cart) {
      // Session sepeti varsa kullanıcıya bağla
      if (sessionId) {
        cart = await Cart.findOne({ where: { sessionId } });
        if (cart) {
          await cart.update({ userId, sessionId: null });
        }
      }
    }
  } else if (sessionId) {
    cart = await Cart.findOne({
      where: { sessionId },
      include: [{
        model: CartItem,
        as: 'items',
        include: [
          { model: Product },
          { model: ProductVariant }
        ]
      }]
    });
  }

  if (!cart) {
    cart = await Cart.create({
      userId: userId || null,
      sessionId: userId ? null : sessionId
    });
    cart.items = [];
  }

  return cart;
};

// Sepet görüntüleme
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: {
          items: [],
          subtotal: 0,
          itemCount: 0
        }
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Sepet toplamlarını hesapla
    let subtotal = 0;
    let itemCount = 0;

    const items = cart.items?.map(item => {
      const price = item.variant?.price || item.product?.price || item.price;
      const total = price * item.quantity;
      subtotal += total;
      itemCount += item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: parseFloat(price),
        total: parseFloat(total),
        product: {
          id: item.product?.id,
          name: item.product?.name,
          slug: item.product?.slug,
          featuredImage: item.product?.featuredImage,
          stock: item.product?.stock
        },
        variant: item.variant ? {
          id: item.variant.id,
          name: item.variant.name,
          stock: item.variant.stock
        } : null
      };
    }) || [];

    res.json({
      success: true,
      data: {
        id: cart.id,
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        itemCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Sepete ürün ekleme
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user?.id;
    let sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    // Session ID yoksa oluştur
    if (!userId && !sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 gün
      });
    }

    // Ürün kontrolü
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Varyant kontrolü
    let variant = null;
    if (variantId) {
      variant = await ProductVariant.findOne({
        where: { id: variantId, productId, isActive: true }
      });
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Varyant bulunamadı'
        });
      }
    }

    // Stok kontrolü
    const availableStock = variant ? variant.stock : product.stock;
    if (product.trackStock && availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Yeterli stok yok'
      });
    }

    // Sepet getir veya oluştur
    const cart = await getOrCreateCart(userId, sessionId);

    // Sepette aynı ürün var mı?
    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null
      }
    });

    const price = variant?.price || product.price;

    if (cartItem) {
      // Miktarı güncelle
      const newQuantity = cartItem.quantity + quantity;
      
      if (product.trackStock && availableStock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Yeterli stok yok'
        });
      }

      await cartItem.update({
        quantity: newQuantity,
        price
      });
    } else {
      // Yeni ürün ekle
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
        price
      });
    }

    // Güncel sepeti getir
    const updatedCart = await getOrCreateCart(userId, sessionId);

    res.json({
      success: true,
      message: 'Ürün sepete eklendi',
      data: {
        sessionId: !userId ? sessionId : undefined,
        cartItemId: cartItem.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Sepet öğesi güncelleme
exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Sepet bulunamadı'
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
      include: [{ model: Product }, { model: ProductVariant }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Sepet öğesi bulunamadı'
      });
    }

    // Miktar 0 veya altıysa sil
    if (quantity <= 0) {
      await cartItem.destroy();
      return res.json({
        success: true,
        message: 'Ürün sepetten kaldırıldı'
      });
    }

    // Stok kontrolü
    const product = cartItem.product;
    const variant = cartItem.variant;
    const availableStock = variant ? variant.stock : product.stock;

    if (product.trackStock && availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Maksimum ${availableStock} adet ekleyebilirsiniz`
      });
    }

    await cartItem.update({ quantity });

    res.json({
      success: true,
      message: 'Sepet güncellendi'
    });
  } catch (error) {
    next(error);
  }
};

// Sepetten ürün kaldırma
exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Sepet bulunamadı'
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Sepet öğesi bulunamadı'
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Ürün sepetten kaldırıldı'
    });
  } catch (error) {
    next(error);
  }
};

// Sepeti temizle
exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Sepet bulunamadı'
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    await CartItem.destroy({ where: { cartId: cart.id } });

    res.json({
      success: true,
      message: 'Sepet temizlendi'
    });
  } catch (error) {
    next(error);
  }
};

// Sepeti kullanıcıya bağla (giriş sonrası)
exports.mergeCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!sessionId) {
      return res.json({
        success: true,
        message: 'Birleştirilecek sepet yok'
      });
    }

    // Session sepetini bul
    const sessionCart = await Cart.findOne({
      where: { sessionId },
      include: [{ model: CartItem, as: 'items' }]
    });

    if (!sessionCart || !sessionCart.items?.length) {
      return res.json({
        success: true,
        message: 'Birleştirilecek sepet yok'
      });
    }

    // Kullanıcı sepetini bul veya oluştur
    let userCart = await Cart.findOne({ where: { userId } });
    if (!userCart) {
      userCart = await Cart.create({ userId });
    }

    // Session sepetindeki ürünleri kullanıcı sepetine taşı
    for (const item of sessionCart.items) {
      const existingItem = await CartItem.findOne({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId
        }
      });

      if (existingItem) {
        await existingItem.update({
          quantity: existingItem.quantity + item.quantity
        });
      } else {
        await CartItem.create({
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price
        });
      }
    }

    // Session sepetini sil
    await CartItem.destroy({ where: { cartId: sessionCart.id } });
    await sessionCart.destroy();

    res.json({
      success: true,
      message: 'Sepetler birleştirildi'
    });
  } catch (error) {
    next(error);
  }
};
