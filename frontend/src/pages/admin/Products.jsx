import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Upload,
  Star,
} from 'lucide-react'
import { productsAPI, categoriesAPI } from '../../services/api'
import { formatPrice } from '../../lib/utils'
import toast from 'react-hot-toast'

const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gerekli'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().min(1, 'Fiyat gerekli'),
  comparePrice: z.string().optional(),
  sku: z.string().optional(),
  stock: z.string().optional(),
  categoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  // Perde özellikleri
  curtainType: z.string().optional(),
  fabricType: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  lightPermeability: z.string().optional(),
  roomType: z.string().optional(),
  mountingType: z.string().optional(),
  washable: z.boolean().optional(),
  thermalInsulation: z.boolean().optional(),
})

// Perde seçenekleri
const curtainTypes = ['Tül', 'Fon', 'Blackout', 'Stor', 'Zebra', 'Jaluzi', 'Perde Takımı']
const fabricTypes = ['Polyester', 'Pamuk', 'Kadife', 'Keten', 'Organze', 'Şifon', 'Saten', 'Brode']
const lightOptions = ['Işık Geçiren', 'Yarı Karartma', 'Tam Karartma']
const roomTypes = ['Salon', 'Yatak Odası', 'Çocuk Odası', 'Mutfak', 'Banyo', 'Ofis', 'Otel']
const mountingTypes = ['Ray Sistemi', 'Korniz', 'Perde Askısı', 'Bant Sistem']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [isSaving, setIsSaving] = useState(false)
  
  // Image states
  const [productImages, setProductImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      isFeatured: false,
    },
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [pagination.page, searchQuery])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await productsAPI.getAllAdmin({
        page: pagination.page,
        limit: 10,
        search: searchQuery,
      })
      setProducts(response.data.data.products)
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.data.pagination.totalPages,
      }))
    } catch (error) {
      toast.error('Ürünler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAllAdmin()
      setCategories(response.data.data || [])
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error)
    }
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setProductImages(product.images || [])
      const attrs = product.attributes || {}
      reset({
        name: product.name,
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: String(product.price),
        comparePrice: product.comparePrice ? String(product.comparePrice) : '',
        sku: product.sku || '',
        stock: String(product.stock || 0),
        categoryId: product.categoryId || '',
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        // Perde özellikleri
        curtainType: attrs.curtainType || '',
        fabricType: attrs.fabricType || '',
        width: attrs.width || '',
        height: attrs.height || '',
        lightPermeability: attrs.lightPermeability || '',
        roomType: attrs.roomType || '',
        mountingType: attrs.mountingType || '',
        washable: attrs.washable || false,
        thermalInsulation: attrs.thermalInsulation || false,
      })
    } else {
      setEditingProduct(null)
      setProductImages([])
      setPreviewImages([])
      reset({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        comparePrice: '',
        sku: '',
        stock: '0',
        categoryId: '',
        isFeatured: false,
        isActive: true,
        metaTitle: '',
        metaDescription: '',
        // Perde özellikleri
        curtainType: '',
        fabricType: '',
        width: '',
        height: '',
        lightPermeability: '',
        roomType: '',
        mountingType: '',
        washable: false,
        thermalInsulation: false,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setProductImages([])
    setPreviewImages([])
    reset()
  }

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Create previews
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }))

    setPreviewImages(prev => [...prev, ...newPreviews])
  }

  // Remove preview image
  const removePreviewImage = (index) => {
    setPreviewImages(prev => {
      const newPreviews = [...prev]
      URL.revokeObjectURL(newPreviews[index].preview)
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }

  // Remove existing image
  const removeExistingImage = async (imageId) => {
    if (!editingProduct) return
    
    try {
      await productsAPI.deleteImage(editingProduct.id, imageId)
      setProductImages(prev => prev.filter(img => img.id !== imageId))
      toast.success('Resim silindi')
    } catch (error) {
      toast.error('Resim silinemedi')
    }
  }

  // Set featured image
  const setFeaturedImage = async (imageId) => {
    if (!editingProduct) return
    
    try {
      await productsAPI.setFeaturedImage(editingProduct.id, imageId)
      setProductImages(prev => prev.map(img => ({
        ...img,
        isFeatured: img.id === imageId
      })))
      toast.success('Ana resim ayarlandı')
    } catch (error) {
      toast.error('Ana resim ayarlanamadı')
    }
  }

  // Upload images
  const uploadImages = async (productId) => {
    if (previewImages.length === 0) return

    setUploadingImages(true)
    try {
      for (const preview of previewImages) {
        const formData = new FormData()
        formData.append('image', preview.file)
        await productsAPI.uploadImage(productId, formData)
      }
      setPreviewImages([])
      toast.success('Resimler yüklendi')
    } catch (error) {
      console.error('Resim yükleme hatası:', error)
      toast.error('Bazı resimler yüklenemedi')
    } finally {
      setUploadingImages(false)
    }
  }

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      // Perde özelliklerini attributes olarak grupla
      const attributes = {
        curtainType: data.curtainType || null,
        fabricType: data.fabricType || null,
        width: data.width || null,
        height: data.height || null,
        lightPermeability: data.lightPermeability || null,
        roomType: data.roomType || null,
        mountingType: data.mountingType || null,
        washable: data.washable || false,
        thermalInsulation: data.thermalInsulation || false,
      }

      const productData = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        stock: parseInt(data.stock || '0'),
        categoryId: data.categoryId || null,
        sku: data.sku,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        attributes,
      }

      let productId = editingProduct?.id

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData)
        toast.success('Ürün güncellendi')
      } else {
        const response = await productsAPI.create(productData)
        productId = response.data.data.id
        toast.success('Ürün oluşturuldu')
      }

      // Upload new images
      if (previewImages.length > 0 && productId) {
        await uploadImages(productId)
      }

      closeModal()
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

    try {
      await productsAPI.delete(id)
      toast.success('Ürün silindi')
      fetchProducts()
    } catch (error) {
      toast.error('Ürün silinemedi')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal-700">Ürün Yönetimi</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Yeni Ürün
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-charcoal-500">Ürün bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-charcoal-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Ürün</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Kategori</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Fiyat</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Stok</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Durum</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-charcoal-500">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-charcoal-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-charcoal-100 rounded-lg overflow-hidden mr-4">
                            {product.featuredImage ? (
                              <img
                                src={product.featuredImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-charcoal-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-700">{product.name}</p>
                            <p className="text-sm text-charcoal-400">SKU: {product.sku || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-charcoal-500">
                        {product.category?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-charcoal-700">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-charcoal-400 line-through ml-2">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${product.stock <= (product.lowStockThreshold || 5) ? 'badge-error' : 'badge-success'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                          {product.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openModal(product)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg mr-2"
                        >
                          <Edit2 className="w-4 h-4 text-charcoal-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-charcoal-100">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 hover:bg-charcoal-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-charcoal-500">
                  Sayfa {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 hover:bg-charcoal-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-charcoal-700">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="label">Ürün Görselleri</label>
                
                {/* Existing Images */}
                {productImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {productImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-charcoal-100">
                          <img
                            src={image.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFeaturedImage(image.id)}
                            className={`p-2 rounded-full ${image.isFeatured ? 'bg-gold-400 text-white' : 'bg-white text-charcoal-600 hover:bg-gold-100'}`}
                            title="Ana resim yap"
                          >
                            <Star className="w-4 h-4" fill={image.isFeatured ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {image.isFeatured && (
                          <span className="absolute top-2 left-2 bg-gold-400 text-white text-xs px-2 py-0.5 rounded">
                            Ana
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview Images */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-charcoal-100 border-2 border-dashed border-gold-400">
                          <img
                            src={preview.preview}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePreviewImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                          Yeni
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-charcoal-300 rounded-xl p-8 text-center cursor-pointer hover:border-gold-400 hover:bg-gold-50/50 transition-colors"
                >
                  <Upload className="w-10 h-10 text-charcoal-400 mx-auto mb-3" />
                  <p className="text-charcoal-600 font-medium">Resim Yükle</p>
                  <p className="text-sm text-charcoal-400 mt-1">PNG, JPG, WEBP - Max 5MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="label">Ürün Adı *</label>
                  <input {...register('name')} className="input" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                {/* Price */}
                <div>
                  <label className="label">Fiyat (₺) *</label>
                  <input {...register('price')} type="number" step="0.01" className="input" />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>

                {/* Compare Price */}
                <div>
                  <label className="label">Karşılaştırma Fiyatı (₺)</label>
                  <input {...register('comparePrice')} type="number" step="0.01" className="input" />
                </div>

                {/* Stock */}
                <div>
                  <label className="label">Stok</label>
                  <input {...register('stock')} type="number" className="input" />
                </div>

                {/* Category */}
                <div>
                  <label className="label">Kategori</label>
                  <select {...register('categoryId')} className="input">
                    <option value="">Kategori Seçin</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('isActive')} className="w-4 h-4" />
                    <span className="text-sm">Aktif</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('isFeatured')} className="w-4 h-4" />
                    <span className="text-sm">Öne Çıkan</span>
                  </label>
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="label">Kısa Açıklama</label>
                  <textarea {...register('shortDescription')} rows={2} className="input" />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="label">Açıklama</label>
                  <textarea {...register('description')} rows={4} className="input" />
                </div>

                {/* Perde Özellikleri */}
                <div className="md:col-span-2 pt-4 border-t">
                  <h3 className="font-semibold text-charcoal-700 mb-4">Perde Özellikleri</h3>
                </div>

                {/* Perde Tipi */}
                <div>
                  <label className="label">Perde Tipi</label>
                  <select {...register('curtainType')} className="input">
                    <option value="">Seçiniz</option>
                    {curtainTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Kumaş Türü */}
                <div>
                  <label className="label">Kumaş Türü</label>
                  <select {...register('fabricType')} className="input">
                    <option value="">Seçiniz</option>
                    {fabricTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Ölçüler */}
                <div>
                  <label className="label">En (cm)</label>
                  <input {...register('width')} type="number" placeholder="Örn: 150" className="input" />
                </div>

                <div>
                  <label className="label">Boy (cm)</label>
                  <input {...register('height')} type="number" placeholder="Örn: 260" className="input" />
                </div>

                {/* Işık Geçirgenliği */}
                <div>
                  <label className="label">Işık Geçirgenliği</label>
                  <select {...register('lightPermeability')} className="input">
                    <option value="">Seçiniz</option>
                    {lightOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Oda Tipi */}
                <div>
                  <label className="label">Uygun Oda Tipi</label>
                  <select {...register('roomType')} className="input">
                    <option value="">Seçiniz</option>
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Montaj Tipi */}
                <div>
                  <label className="label">Montaj Tipi</label>
                  <select {...register('mountingType')} className="input">
                    <option value="">Seçiniz</option>
                    {mountingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Özellikler */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('washable')} className="w-4 h-4" />
                    <span className="text-sm">Yıkanabilir</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('thermalInsulation')} className="w-4 h-4" />
                    <span className="text-sm">Termal Yalıtım</span>
                  </label>
                </div>

                {/* SEO */}
                <div className="md:col-span-2 pt-4 border-t">
                  <h3 className="font-semibold text-charcoal-700 mb-4">SEO Ayarları</h3>
                </div>

                <div className="md:col-span-2">
                  <label className="label">Meta Başlık</label>
                  <input {...register('metaTitle')} className="input" />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Meta Açıklama</label>
                  <textarea {...register('metaDescription')} rows={2} className="input" />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-ghost">
                  İptal
                </button>
                <button type="submit" disabled={isSaving || uploadingImages} className="btn-primary">
                  {(isSaving || uploadingImages) ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {uploadingImages ? 'Resimler Yükleniyor...' : 'Kaydediliyor...'}
                    </>
                  ) : (
                    editingProduct ? 'Güncelle' : 'Oluştur'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
