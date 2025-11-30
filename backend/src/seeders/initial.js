/**
 * Initial Database Seeder
 * Varsayılan admin kullanıcısı ve örnek veriler oluşturur
 */

const bcrypt = require('bcryptjs');
const { 
  User, 
  Category, 
  Product, 
  ProductVariant, 
  Banner, 
  Page, 
  Setting,
  RolePermission 
} = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // 1. Admin Kullanıcısı
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@perdecim.com' },
      defaults: {
        email: 'admin@perdecim.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+905001234567',
        role: 'admin',
        isActive: true
      }
    });
    console.log('✅ Admin user created');

    // 2. Kategoriler
    const categories = [
      { name: 'Tül Perdeler', slug: 'tul-perdeler', description: 'Şık ve zarif tül perde modelleri', sortOrder: 1 },
      { name: 'Fon Perdeler', slug: 'fon-perdeler', description: 'Kaliteli fon perde çeşitleri', sortOrder: 2 },
      { name: 'Blackout Perdeler', slug: 'blackout-perdeler', description: 'Işık geçirmeyen karartma perdeler', sortOrder: 3 },
      { name: 'Stor Perdeler', slug: 'stor-perdeler', description: 'Modern stor perde modelleri', sortOrder: 4 },
      { name: 'Zebra Perdeler', slug: 'zebra-perdeler', description: 'Şık zebra perde çeşitleri', sortOrder: 5 },
    ];

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat
      });
    }
    console.log('✅ Categories created');

    // 3. Örnek Ürünler
    const tulCategory = await Category.findOne({ where: { slug: 'tul-perdeler' } });
    const fonCategory = await Category.findOne({ where: { slug: 'fon-perdeler' } });
    const blackoutCategory = await Category.findOne({ where: { slug: 'blackout-perdeler' } });

    const products = [
      {
        name: 'Elegant Beyaz Tül Perde',
        slug: 'elegant-beyaz-tul-perde',
        description: '<p>Yüksek kaliteli kumaştan üretilmiş, zarif beyaz tül perde. Evinize şıklık katacak.</p><ul><li>%100 Polyester</li><li>Makinede yıkanabilir</li><li>Ütü gerektirmez</li></ul>',
        shortDescription: 'Zarif ve şık beyaz tül perde',
        price: 299.90,
        comparePrice: 399.90,
        sku: 'TUL-001',
        stock: 50,
        categoryId: tulCategory?.id,
        isFeatured: true,
        tags: ['beyaz', 'tül', 'elegant'],
        attributes: { 'Kumaş': 'Polyester', 'Yıkama': 'Makinede' }
      },
      {
        name: 'Premium Krem Fon Perde',
        slug: 'premium-krem-fon-perde',
        description: '<p>Premium kalite krem rengi fon perde. Işığı yumuşak bir şekilde filtreler.</p>',
        shortDescription: 'Premium kalite krem fon perde',
        price: 549.90,
        comparePrice: 699.90,
        sku: 'FON-001',
        stock: 30,
        categoryId: fonCategory?.id,
        isFeatured: true,
        tags: ['krem', 'fon', 'premium'],
        attributes: { 'Kumaş': 'Kadife', 'Yıkama': 'Kuru temizleme' }
      },
      {
        name: 'Blackout Lacivert Perde',
        slug: 'blackout-lacivert-perde',
        description: '<p>%100 karartma özellikli lacivert blackout perde. Yatak odaları için ideal.</p>',
        shortDescription: 'Tam karartma lacivert perde',
        price: 449.90,
        sku: 'BLK-001',
        stock: 25,
        categoryId: blackoutCategory?.id,
        isFeatured: true,
        tags: ['lacivert', 'blackout', 'karartma'],
        attributes: { 'Karartma': '%100', 'Kumaş': 'Blackout' }
      },
      {
        name: 'Dantel Detaylı Tül Perde',
        slug: 'dantel-detayli-tul-perde',
        description: '<p>El işçiliği dantel detayları ile süslenmiş özel tül perde.</p>',
        shortDescription: 'Dantel detaylı özel tül perde',
        price: 399.90,
        sku: 'TUL-002',
        stock: 20,
        categoryId: tulCategory?.id,
        isFeatured: false,
        tags: ['dantel', 'tül', 'el işi'],
      },
      {
        name: 'Kadife Bordo Fon Perde',
        slug: 'kadife-bordo-fon-perde',
        description: '<p>Lüks kadife kumaştan üretilmiş bordo fon perde. Şık ve gösterişli.</p>',
        shortDescription: 'Lüks kadife bordo fon perde',
        price: 749.90,
        comparePrice: 899.90,
        sku: 'FON-002',
        stock: 15,
        categoryId: fonCategory?.id,
        isFeatured: true,
        tags: ['kadife', 'bordo', 'lüks'],
      },
    ];

    for (const prod of products) {
      const [product] = await Product.findOrCreate({
        where: { slug: prod.slug },
        defaults: prod
      });

      // Varyantlar ekle
      if (product && prod.slug === 'elegant-beyaz-tul-perde') {
        await ProductVariant.findOrCreate({
          where: { productId: product.id, name: '150x250 cm' },
          defaults: { productId: product.id, name: '150x250 cm', price: 299.90, stock: 20, sku: 'TUL-001-150' }
        });
        await ProductVariant.findOrCreate({
          where: { productId: product.id, name: '200x250 cm' },
          defaults: { productId: product.id, name: '200x250 cm', price: 349.90, stock: 15, sku: 'TUL-001-200' }
        });
        await ProductVariant.findOrCreate({
          where: { productId: product.id, name: '250x250 cm' },
          defaults: { productId: product.id, name: '250x250 cm', price: 399.90, stock: 15, sku: 'TUL-001-250' }
        });
      }
    }
    console.log('✅ Products created');

    // 4. Bannerlar
    const banners = [
      {
        title: 'Yeni Sezon Perdeler',
        subtitle: 'Evinize şıklık katın',
        image: '/images/banners/banner1.jpg',
        link: '/products?category=yeni-sezon',
        buttonText: 'Koleksiyonu Keşfet',
        sortOrder: 1
      },
      {
        title: 'Premium Tül Perdeler',
        subtitle: 'Işığı içeri davet edin',
        image: '/images/banners/banner2.jpg',
        link: '/products?category=tul-perdeler',
        buttonText: 'İncele',
        sortOrder: 2
      },
    ];

    for (const banner of banners) {
      await Banner.findOrCreate({
        where: { title: banner.title },
        defaults: banner
      });
    }
    console.log('✅ Banners created');

    // 5. Sayfalar
    const pages = [
      {
        title: 'Hakkımızda',
        slug: 'hakkimizda',
        content: `
          <h2>Perdecim Hakkında</h2>
          <p>2010 yılından bu yana ev tekstili sektöründe hizmet vermekteyiz. Kaliteli ürünler ve müşteri memnuniyeti odaklı çalışma anlayışımızla binlerce eve perde taşıdık.</p>
          <h3>Misyonumuz</h3>
          <p>Müşterilerimize en kaliteli perde ve ev tekstili ürünlerini uygun fiyatlarla sunmak.</p>
          <h3>Vizyonumuz</h3>
          <p>Türkiye'nin lider online perde mağazası olmak.</p>
        `,
        metaTitle: 'Hakkımızda - Perdecim',
        metaDescription: 'Perdecim hakkında bilgi edinin. 2010\'dan beri kaliteli perde ve ev tekstili ürünleri.'
      },
      {
        title: 'İletişim',
        slug: 'iletisim',
        content: `
          <h2>Bize Ulaşın</h2>
          <p><strong>Adres:</strong> Örnek Mahallesi, Perde Sokak No:1, Kadıköy/İstanbul</p>
          <p><strong>Telefon:</strong> +90 (212) 123 45 67</p>
          <p><strong>E-posta:</strong> info@perdecim.com</p>
          <p><strong>Çalışma Saatleri:</strong> Pazartesi - Cumartesi: 09:00 - 18:00</p>
        `,
        metaTitle: 'İletişim - Perdecim',
        metaDescription: 'Perdecim iletişim bilgileri. Bize ulaşın.'
      },
      {
        title: 'Gizlilik Politikası',
        slug: 'gizlilik-politikasi',
        content: '<h2>Gizlilik Politikası</h2><p>Kişisel verilerinizin korunması bizim için önemlidir...</p>',
        metaTitle: 'Gizlilik Politikası - Perdecim'
      },
      {
        title: 'Kullanım Koşulları',
        slug: 'kullanim-kosullari',
        content: '<h2>Kullanım Koşulları</h2><p>Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş olursunuz...</p>',
        metaTitle: 'Kullanım Koşulları - Perdecim'
      },
    ];

    for (const page of pages) {
      await Page.findOrCreate({
        where: { slug: page.slug },
        defaults: page
      });
    }
    console.log('✅ Pages created');

    // 6. Site Ayarları
    const settings = [
      { key: 'site_name', value: 'Perdecim', type: 'text', group: 'general' },
      { key: 'site_description', value: 'Premium Perde & Ev Tekstili', type: 'text', group: 'general' },
      { key: 'contact_email', value: 'info@perdecim.com', type: 'text', group: 'contact' },
      { key: 'contact_phone', value: '+90 (212) 123 45 67', type: 'text', group: 'contact' },
      { key: 'contact_address', value: 'Örnek Mahallesi, Perde Sokak No:1, Kadıköy/İstanbul', type: 'text', group: 'contact' },
      { key: 'free_shipping_threshold', value: '500', type: 'number', group: 'shipping' },
      { key: 'shipping_cost', value: '29.90', type: 'number', group: 'shipping' },
      { key: 'curtain_animation_enabled', value: 'true', type: 'boolean', group: 'animation' },
      { key: 'social_facebook', value: 'https://facebook.com/perdecim', type: 'text', group: 'social' },
      { key: 'social_instagram', value: 'https://instagram.com/perdecim', type: 'text', group: 'social' },
      { key: 'social_twitter', value: 'https://twitter.com/perdecim', type: 'text', group: 'social' },
    ];

    for (const setting of settings) {
      await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
    }
    console.log('✅ Settings created');

    // 7. Rol İzinleri
    const permissions = [
      // Customer
      { role: 'customer', module: 'products', canView: true, canCreate: false, canEdit: false, canDelete: false },
      { role: 'customer', module: 'orders', canView: true, canCreate: true, canEdit: false, canDelete: false },
      { role: 'customer', module: 'cart', canView: true, canCreate: true, canEdit: true, canDelete: true },
      
      // Staff
      { role: 'staff', module: 'orders', canView: true, canCreate: false, canEdit: true, canDelete: false },
      { role: 'staff', module: 'sales_logs', canView: true, canCreate: true, canEdit: false, canDelete: false },
      
      // Manager
      { role: 'manager', module: 'orders', canView: true, canCreate: false, canEdit: true, canDelete: false },
      { role: 'manager', module: 'stock', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { role: 'manager', module: 'sales_logs', canView: true, canCreate: true, canEdit: false, canDelete: false },
      { role: 'manager', module: 'staff', canView: true, canCreate: true, canEdit: true, canDelete: false },
      
      // Admin - full access
      { role: 'admin', module: 'all', canView: true, canCreate: true, canEdit: true, canDelete: true },
    ];

    for (const perm of permissions) {
      await RolePermission.findOrCreate({
        where: { role: perm.role, module: perm.module },
        defaults: perm
      });
    }
    console.log('✅ Role permissions created');

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📧 Admin Login:');
    console.log('   Email: admin@perdecim.com');
    console.log('   Password: Admin123!\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// CLI'dan çalıştırılırsa
if (require.main === module) {
  const { connectDB } = require('../config/database');
  
  connectDB()
    .then(() => seedDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
