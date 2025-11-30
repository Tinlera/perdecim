import { useState, useEffect } from 'react'
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
})

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
      })
    } else {
      setEditingProduct(null)
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
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    reset()
  }

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        stock: parseInt(data.stock || '0'),
        categoryId: data.categoryId || null,
      }

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData)
        toast.success('Ürün güncellendi')
      } else {
        await productsAPI.create(productData)
        toast.success('Ürün oluşturuldu')
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
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-charcoal-700">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
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

                {/* SKU */}
                <div>
                  <label className="label">SKU</label>
                  <input {...register('sku')} className="input" />
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

                {/* SEO */}
                <div className="md:col-span-2">
                  <label className="label">Meta Başlık (SEO)</label>
                  <input {...register('metaTitle')} className="input" />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Meta Açıklama (SEO)</label>
                  <textarea {...register('metaDescription')} rows={2} className="input" />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-ghost">
                  İptal
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingProduct ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

