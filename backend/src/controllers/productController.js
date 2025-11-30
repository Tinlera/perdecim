const { Product, ProductVariant, Category } = require('../models');
const { Op } = require('sequelize');
const slugify = require('slugify');
const { cacheGet, cacheSet, cacheDel, cacheFlush } = require('../config/redis');
const { processImage, processMultipleImages, deleteImage, deleteMultipleImages } = require('../middleware/upload');

// Ürün listesi (Public)
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      featured
    } = req.query;

    const offset = (page - 1) * limit;

    // Cache key
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    // Where koşulları
    const where = { isActive: true };

    if (category) {
      const categoryRecord = await Category.findOne({
        where: { slug: category, isActive: true }
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search.toLowerCase()] } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Sıralama
    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { isActive: true },
          required: false
        }
      ],
      order,
      limit: parseInt(limit),
      offset
    });

    const result = {
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };

    // Cache'e kaydet (5 dakika)
    await cacheSet(cacheKey, result, 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Tek ürün detayı (Public)
exports.getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const cacheKey = `product:${slug}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const product = await Product.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    await cacheSet(cacheKey, product, 600);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Ürün oluşturma (Admin)
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      comparePrice,
      costPrice,
      sku,
      stock,
      lowStockThreshold,
      trackStock,
      categoryId,
      isFeatured,
      metaTitle,
      metaDescription,
      tags,
      attributes,
      variants
    } = req.body;

    // Slug oluştur
    let slug = slugify(name, { lower: true, strict: true });
    
    // Slug benzersizliği kontrol
    const existingProduct = await Product.findOne({ where: { slug } });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    // Resimleri işle
    let featuredImage = null;
    let images = [];

    if (req.files) {
      if (req.files.featuredImage) {
        featuredImage = await processImage(req.files.featuredImage[0], 'products', {
          width: 800,
          height: 800
        });
      }
      if (req.files.images) {
        images = await processMultipleImages(req.files.images, 'products', {
          width: 800,
          height: 800
        });
      }
    }

    // Ürün oluştur
    const product = await Product.create({
      name,
      slug,
      description,
      shortDescription,
      price,
      comparePrice,
      costPrice,
      sku,
      stock: stock || 0,
      lowStockThreshold: lowStockThreshold || 5,
      trackStock: trackStock !== false,
      categoryId,
      featuredImage,
      images,
      isFeatured: isFeatured || false,
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || shortDescription,
      tags: tags || [],
      attributes: attributes || {}
    });

    // Varyantları oluştur
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        await ProductVariant.create({
          productId: product.id,
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock || 0,
          attributes: variant.attributes || {}
        });
      }
    }

    // Cache temizle
    await cacheFlush('products:*');

    // Ürünü varyantlarıyla birlikte getir
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category },
        { model: ProductVariant, as: 'variants' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Ürün başarıyla oluşturuldu',
      data: createdProduct
    });
  } catch (error) {
    next(error);
  }
};

// Ürün güncelleme (Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Slug güncelleme
    if (updateData.name && updateData.name !== product.name) {
      let slug = slugify(updateData.name, { lower: true, strict: true });
      const existingProduct = await Product.findOne({
        where: { slug, id: { [Op.ne]: id } }
      });
      if (existingProduct) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }

    // Resimleri işle
    if (req.files) {
      if (req.files.featuredImage) {
        // Eski resmi sil
        if (product.featuredImage) {
          deleteImage(product.featuredImage);
        }
        updateData.featuredImage = await processImage(
          req.files.featuredImage[0],
          'products',
          { width: 800, height: 800 }
        );
      }
      if (req.files.images) {
        const newImages = await processMultipleImages(
          req.files.images,
          'products',
          { width: 800, height: 800 }
        );
        updateData.images = [...(product.images || []), ...newImages];
      }
    }

    await product.update(updateData);

    // Cache temizle
    await cacheFlush('products:*');
    await cacheDel(`product:${product.slug}`);

    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category },
        { model: ProductVariant, as: 'variants' }
      ]
    });

    res.json({
      success: true,
      message: 'Ürün güncellendi',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// Ürün silme (Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Resimleri sil
    if (product.featuredImage) {
      deleteImage(product.featuredImage);
    }
    if (product.images && product.images.length > 0) {
      deleteMultipleImages(product.images);
    }

    // Varyantları sil
    await ProductVariant.destroy({ where: { productId: id } });

    // Ürünü sil
    await product.destroy();

    // Cache temizle
    await cacheFlush('products:*');
    await cacheDel(`product:${product.slug}`);

    res.json({
      success: true,
      message: 'Ürün silindi'
    });
  } catch (error) {
    next(error);
  }
};

// Ürün resmi yükleme (Admin)
exports.uploadProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası gerekli'
      });
    }

    // Resmi işle
    const imageUrl = await processImage(req.files.image[0], 'products', {
      width: 800,
      height: 800
    });

    // Mevcut resimlere ekle
    const images = product.images || [];
    const newImage = {
      id: require('crypto').randomUUID(),
      url: imageUrl,
      isFeatured: images.length === 0 // İlk resimse featured yap
    };
    images.push(newImage);

    // Eğer ilk resimse featuredImage olarak da ayarla
    const updateData = { images };
    if (!product.featuredImage) {
      updateData.featuredImage = imageUrl;
    }

    await product.update(updateData);

    // Cache temizle
    await cacheDel(`product:${product.slug}`);
    await cacheFlush('products:*');

    res.status(201).json({
      success: true,
      message: 'Resim yüklendi',
      data: newImage
    });
  } catch (error) {
    next(error);
  }
};

// Ürün resmi silme (Admin)
exports.deleteProductImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    let images = product.images || [];
    
    // imageId string olabilir (UUID) veya index olabilir
    let imageToDelete = null;
    let newImages = [];

    // UUID formatında mı kontrol et
    if (imageId.includes('-')) {
      // UUID - obje array'ı varsay
      imageToDelete = images.find(img => img.id === imageId);
      newImages = images.filter(img => img.id !== imageId);
    } else {
      // Index - eski string array formatı
      const index = parseInt(imageId);
      if (index >= 0 && index < images.length) {
        imageToDelete = images[index];
        newImages = images.filter((_, i) => i !== index);
      }
    }

    if (!imageToDelete) {
      return res.status(400).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    // Dosyayı sil
    const imageUrl = typeof imageToDelete === 'string' ? imageToDelete : imageToDelete.url;
    deleteImage(imageUrl);

    // Eğer silinen resim featuredImage ise, ilk resmi featured yap
    let featuredImage = product.featuredImage;
    if (featuredImage === imageUrl && newImages.length > 0) {
      const firstImage = typeof newImages[0] === 'string' ? newImages[0] : newImages[0].url;
      featuredImage = firstImage;
      if (typeof newImages[0] === 'object') {
        newImages[0].isFeatured = true;
      }
    } else if (newImages.length === 0) {
      featuredImage = null;
    }

    await product.update({ images: newImages, featuredImage });

    // Cache temizle
    await cacheDel(`product:${product.slug}`);
    await cacheFlush('products:*');

    res.json({
      success: true,
      message: 'Resim silindi',
      data: { images: newImages }
    });
  } catch (error) {
    next(error);
  }
};

// Ana resim ayarlama (Admin)
exports.setFeaturedImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    let images = product.images || [];
    let featuredImage = null;

    // imageId'ye göre resmi bul
    const newImages = images.map(img => {
      if (typeof img === 'object') {
        const isFeatured = img.id === imageId;
        if (isFeatured) featuredImage = img.url;
        return { ...img, isFeatured };
      } else {
        // Eski string array formatı - index kullan
        return img;
      }
    });

    // Eğer string array ise
    if (typeof images[0] === 'string') {
      const index = parseInt(imageId);
      if (index >= 0 && index < images.length) {
        featuredImage = images[index];
      }
    }

    if (!featuredImage) {
      return res.status(400).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    await product.update({ images: newImages, featuredImage });

    // Cache temizle
    await cacheDel(`product:${product.slug}`);
    await cacheFlush('products:*');

    res.json({
      success: true,
      message: 'Ana resim ayarlandı',
      data: { featuredImage, images: newImages }
    });
  } catch (error) {
    next(error);
  }
};

// Varyant ekleme (Admin)
exports.addVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, price, stock, attributes } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    const variant = await ProductVariant.create({
      productId: id,
      name,
      sku,
      price,
      stock: stock || 0,
      attributes: attributes || {}
    });

    // Cache temizle
    await cacheDel(`product:${product.slug}`);

    res.status(201).json({
      success: true,
      message: 'Varyant eklendi',
      data: variant
    });
  } catch (error) {
    next(error);
  }
};

// Varyant güncelleme (Admin)
exports.updateVariant = async (req, res, next) => {
  try {
    const { id, variantId } = req.params;
    const updateData = req.body;

    const variant = await ProductVariant.findOne({
      where: { id: variantId, productId: id }
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Varyant bulunamadı'
      });
    }

    await variant.update(updateData);

    const product = await Product.findByPk(id);
    await cacheDel(`product:${product.slug}`);

    res.json({
      success: true,
      message: 'Varyant güncellendi',
      data: variant
    });
  } catch (error) {
    next(error);
  }
};

// Varyant silme (Admin)
exports.deleteVariant = async (req, res, next) => {
  try {
    const { id, variantId } = req.params;

    const variant = await ProductVariant.findOne({
      where: { id: variantId, productId: id }
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Varyant bulunamadı'
      });
    }

    await variant.destroy();

    const product = await Product.findByPk(id);
    await cacheDel(`product:${product.slug}`);

    res.json({
      success: true,
      message: 'Varyant silindi'
    });
  } catch (error) {
    next(error);
  }
};

// Admin için tüm ürünler (aktif/pasif dahil)
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: ProductVariant, as: 'variants' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        products,
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
