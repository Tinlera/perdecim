const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('customer', 'staff', 'manager', 'admin'),
    defaultValue: 'customer'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  twoFactorSecret: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'two_factor_secret'
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'two_factor_enabled'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refresh_token'
  },
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'password_reset_token'
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'password_reset_expires'
  },
  googleId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    field: 'google_id'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  canChangePassword: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'can_change_password'
  }
});

// Category Model
const Category = sequelize.define('categories', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'parent_id'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  metaTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_description'
  }
});

// Product Model
const Product = sequelize.define('products', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(280),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'short_description'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  comparePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'compare_price'
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'cost_price'
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'low_stock_threshold'
  },
  trackStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'track_stock'
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'category_id'
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  featuredImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'featured_image'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  metaTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_description'
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  attributes: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isRemovedFromSale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_removed_from_sale'
  },
  removedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'removed_at'
  },
  removedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'removed_by'
  },
  removalReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'removal_reason'
  }
});

// Product Variant Model
const ProductVariant = sequelize.define('product_variants', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  attributes: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
});

// Address Model
const Address = sequelize.define('addresses', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  neighborhood: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  addressLine: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'address_line'
  },
  postalCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'postal_code'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default'
  }
});

// Cart Model
const Cart = sequelize.define('carts', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  },
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'session_id'
  }
});

// Cart Item Model
const CartItem = sequelize.define('cart_items', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cartId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'cart_id'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id'
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'variant_id'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

// Favorite Model
const Favorite = sequelize.define('favorites', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id'
  }
});

// Order Model
const Order = sequelize.define('orders', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'order_number'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
    field: 'payment_status'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_method'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'shipping_cost'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  couponId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'coupon_id'
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'shipping_address'
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'billing_address'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  staffId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'staff_id'
  },
  iyzicoPaymentId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'iyzico_payment_id'
  },
  iyzicoConversationId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'iyzico_conversation_id'
  }
});

// Order Item Model
const OrderItem = sequelize.define('order_items', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id'
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'variant_id'
  },
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'product_name'
  },
  variantName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'variant_name'
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

// Coupon Model
const Coupon = sequelize.define('coupons', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    field: 'discount_type'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'discount_value'
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'min_order_amount'
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'max_discount'
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'usage_limit'
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'used_count'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
});

// Banner/Slider Model
const Banner = sequelize.define('banners', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  subtitle: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  mobileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'mobile_image'
  },
  link: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  buttonText: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'button_text'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  }
});

// Page Model (Hakkımızda, İletişim vs.)
const Page = sequelize.define('pages', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(280),
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metaTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_description'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
});

// Site Settings Model
const Setting = sequelize.define('settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('text', 'number', 'boolean', 'json', 'image'),
    defaultValue: 'text'
  },
  group: {
    type: DataTypes.STRING(50),
    defaultValue: 'general'
  }
});

// Pending Approval Model (Fiyat değişikliği, ürün güncelleme vb.)
const PendingApproval = sequelize.define('pending_approvals', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('price_change', 'product_update', 'product_visibility', 'stock_change'),
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'entity_type'
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'entity_id'
  },
  oldValue: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'old_value'
  },
  newValue: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'new_value'
  },
  requestedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'requested_by'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'approved_by'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Activity Log Model
const ActivityLog = sequelize.define('activity_logs', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'entity_type'
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'entity_id'
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  }
});

// Notification Model
const Notification = sequelize.define('notifications', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  }
});

// Stock Log Model (Stok hareketleri)
const StockLog = sequelize.define('stock_logs', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id'
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'variant_id'
  },
  type: {
    type: DataTypes.ENUM('in', 'out', 'adjustment'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previousStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'previous_stock'
  },
  newStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'new_stock'
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'order_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'approved_by'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
});

// Sales Log Model (Satış logları)
const SalesLog = sequelize.define('sales_logs', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id'
  },
  staffId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'staff_id'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

// Role Permissions Model
const RolePermission = sequelize.define('role_permissions', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  role: {
    type: DataTypes.ENUM('customer', 'staff', 'manager', 'admin'),
    allowNull: false
  },
  module: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  canView: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_view'
  },
  canCreate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_create'
  },
  canEdit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_edit'
  },
  canDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_delete'
  }
});

// Associations
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

CartItem.belongsTo(Product, { foreignKey: 'productId' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variantId' });

User.hasMany(Favorite, { foreignKey: 'userId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Favorite, { foreignKey: 'productId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.belongsTo(User, { as: 'staff', foreignKey: 'staffId' });
Order.belongsTo(Coupon, { foreignKey: 'couponId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId' });

Product.hasMany(StockLog, { foreignKey: 'productId' });
StockLog.belongsTo(Product, { foreignKey: 'productId' });
StockLog.belongsTo(User, { foreignKey: 'userId' });
StockLog.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });

Order.hasMany(SalesLog, { foreignKey: 'orderId' });
SalesLog.belongsTo(Order, { foreignKey: 'orderId' });
SalesLog.belongsTo(User, { as: 'staff', foreignKey: 'staffId' });

// PendingApproval associations
PendingApproval.belongsTo(User, { as: 'requester', foreignKey: 'requestedBy' });
PendingApproval.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });

// ActivityLog associations
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductVariant,
  Address,
  Cart,
  CartItem,
  Favorite,
  Order,
  OrderItem,
  Coupon,
  Banner,
  Page,
  Setting,
  StockLog,
  SalesLog,
  RolePermission,
  PendingApproval,
  ActivityLog,
  Notification
};
