const { Category, Product } = require('../models');
const { Op } = require('sequelize');
const slugify = require('slugify');
const { cacheGet, cacheSet, cacheFlush } = require('../config/redis');
const { processImage, deleteImage } = require('../middleware/upload');

// Kategori listesi (Public)
exports.getCategories = async (req, res, next) => {
  try {
    const { tree = 'false' } = req.query;

    const cacheKey = `categories:${tree}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      include: tree === 'true' ? [{
        model: Category,
        as: 'children',
        where: { isActive: true },
        required: false,
        order: [['sortOrder', 'ASC']]
      }] : []
    });

    let result;
    if (tree === 'true') {
      // Sadece üst kategorileri döndür (alt kategoriler include'da)
      result = categories.filter(cat => !cat.parentId);
    } else {
      result = categories;
    }

    await cacheSet(cacheKey, result, 3600);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Tek kategori (Public)
exports.getCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Category,
          as: 'children',
          where: { isActive: true },
          required: false
        },
        {
          model: Category,
          as: 'parent',
          required: false
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Kategori oluşturma (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const {
      name,
      description,
      parentId,
      sortOrder,
      metaTitle,
      metaDescription
    } = req.body;

    // Slug oluştur
    let slug = slugify(name, { lower: true, strict: true });
    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      slug = `${slug}-${Date.now()}`;
    }

    // Resim işle
    let image = null;
    if (req.file) {
      image = await processImage(req.file, 'categories', {
        width: 600,
        height: 400
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentId: parentId || null,
      sortOrder: sortOrder || 0,
      metaTitle: metaTitle || name,
      metaDescription
    });

    await cacheFlush('categories:*');

    res.status(201).json({
      success: true,
      message: 'Kategori oluşturuldu',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Kategori güncelleme (Admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    // Slug güncelleme
    if (updateData.name && updateData.name !== category.name) {
      let slug = slugify(updateData.name, { lower: true, strict: true });
      const existingCategory = await Category.findOne({
        where: { slug, id: { [Op.ne]: id } }
      });
      if (existingCategory) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }

    // Resim işle
    if (req.file) {
      if (category.image) {
        deleteImage(category.image);
      }
      updateData.image = await processImage(req.file, 'categories', {
        width: 600,
        height: 400
      });
    }

    await category.update(updateData);
    await cacheFlush('categories:*');

    res.json({
      success: true,
      message: 'Kategori güncellendi',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Kategori silme (Admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    // Alt kategorileri kontrol et
    const childCount = await Category.count({ where: { parentId: id } });
    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kategorinin alt kategorileri var, önce onları silin'
      });
    }

    // Ürünleri kontrol et
    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kategoride ürünler var, önce ürünleri başka kategoriye taşıyın'
      });
    }

    // Resmi sil
    if (category.image) {
      deleteImage(category.image);
    }

    await category.destroy();
    await cacheFlush('categories:*');

    res.json({
      success: true,
      message: 'Kategori silindi'
    });
  } catch (error) {
    next(error);
  }
};

// Admin için tüm kategoriler
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      include: [{
        model: Category,
        as: 'parent',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Kategori sıralamasını güncelle (Admin)
exports.updateCategoryOrder = async (req, res, next) => {
  try {
    const { categories } = req.body; // [{ id, sortOrder }]

    for (const cat of categories) {
      await Category.update(
        { sortOrder: cat.sortOrder },
        { where: { id: cat.id } }
      );
    }

    await cacheFlush('categories:*');

    res.json({
      success: true,
      message: 'Sıralama güncellendi'
    });
  } catch (error) {
    next(error);
  }
};
