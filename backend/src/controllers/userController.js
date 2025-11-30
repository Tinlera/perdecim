const bcrypt = require('bcryptjs');
const { User, Order, Address, Favorite, Product } = require('../models');
const { Op } = require('sequelize');

// Kullanıcı listesi (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'twoFactorSecret', 'refreshToken'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        users,
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

// Tek kullanıcı detayı (Admin)
exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'twoFactorSecret', 'refreshToken'] },
      include: [
        { model: Address },
        {
          model: Order,
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Kullanıcı oluşturma (Admin - Personel/Müdür ekleme)
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    const currentUserRole = req.user.role;

    // Yetki kontrolü
    if (role === 'admin' && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin oluşturma yetkiniz yok'
      });
    }

    if (role === 'manager' && !['admin'].includes(currentUserRole)) {
      return res.status(403).json({
        success: false,
        message: 'Müdür oluşturma yetkiniz yok'
      });
    }

    // Email kontrolü
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'staff'
    });

    res.status(201).json({
      success: true,
      message: 'Kullanıcı oluşturuldu',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Kullanıcı güncelleme (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, isActive } = req.body;
    const currentUser = req.user;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kendi rolünü değiştiremez
    if (id === currentUser.id && role && role !== currentUser.role) {
      return res.status(403).json({
        success: false,
        message: 'Kendi rolünüzü değiştiremezsiniz'
      });
    }

    // Admin rolü sadece admin verebilir
    if (role === 'admin' && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin rolü verme yetkiniz yok'
      });
    }

    // Müdür rolü sadece admin verebilir
    if (role === 'manager' && currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Müdür rolü verme yetkiniz yok'
      });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role && currentUser.role === 'admin') updateData.role = role;
    if (isActive !== undefined && currentUser.role === 'admin') updateData.isActive = isActive;

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Kullanıcı güncellendi',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// Kullanıcı silme (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Kendinizi silemezsiniz'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Admin silinemez
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin kullanıcı silinemez'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Kullanıcı silindi'
    });
  } catch (error) {
    next(error);
  }
};

// Rol değiştirme (Admin/Manager)
exports.changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = req.user;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Yetki kontrolleri
    if (currentUser.role === 'manager') {
      // Müdür sadece customer -> staff yapabilir
      if (user.role !== 'customer' || role !== 'staff') {
        return res.status(403).json({
          success: false,
          message: 'Bu rol değişikliği için yetkiniz yok'
        });
      }
    } else if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Rol değiştirme yetkiniz yok'
      });
    }

    await user.update({ role });

    res.json({
      success: true,
      message: 'Kullanıcı rolü güncellendi',
      data: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Personel listesi (Manager/Admin)
exports.getStaffList = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: {
        role: { [Op.in]: ['staff', 'manager'] }
      },
      attributes: { exclude: ['password', 'twoFactorSecret', 'refreshToken'] },
      order: [['role', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Favoriler
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [{
        model: Product,
        where: { isActive: true },
        required: true
      }]
    });

    res.json({
      success: true,
      data: favorites.map(f => f.product)
    });
  } catch (error) {
    next(error);
  }
};

// Favorilere ekle
exports.addToFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    const existing = await Favorite.findOne({
      where: { userId, productId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ürün zaten favorilerde'
      });
    }

    await Favorite.create({ userId, productId });

    res.json({
      success: true,
      message: 'Favorilere eklendi'
    });
  } catch (error) {
    next(error);
  }
};

// Favorilerden kaldır
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId, productId }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favori bulunamadı'
      });
    }

    await favorite.destroy();

    res.json({
      success: true,
      message: 'Favorilerden kaldırıldı'
    });
  } catch (error) {
    next(error);
  }
};

// Adresler
exports.getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const addresses = await Address.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

// Adres ekle
exports.addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressData = req.body;

    // İlk adres varsayılan olsun
    const addressCount = await Address.count({ where: { userId } });
    if (addressCount === 0) {
      addressData.isDefault = true;
    }

    // Varsayılan yapılıyorsa diğerlerini kaldır
    if (addressData.isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    const address = await Address.create({
      userId,
      ...addressData
    });

    res.status(201).json({
      success: true,
      message: 'Adres eklendi',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// Adres güncelle
exports.updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    const address = await Address.findOne({
      where: { id, userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
    }

    // Varsayılan yapılıyorsa diğerlerini kaldır
    if (updateData.isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId, id: { [Op.ne]: id } } }
      );
    }

    await address.update(updateData);

    res.json({
      success: true,
      message: 'Adres güncellendi',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

// Adres sil
exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: { id, userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
    }

    await address.destroy();

    res.json({
      success: true,
      message: 'Adres silindi'
    });
  } catch (error) {
    next(error);
  }
};
