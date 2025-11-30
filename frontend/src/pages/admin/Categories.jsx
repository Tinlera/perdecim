import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Image as ImageIcon,
  GripVertical,
} from 'lucide-react'
import { categoriesAPI } from '../../services/api'
import toast from 'react-hot-toast'

const categorySchema = z.object({
  name: z.string().min(1, 'Kategori adı gerekli'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.string().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { isActive: true },
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await categoriesAPI.getAllAdmin()
      setCategories(response.data.data || [])
    } catch (error) {
      toast.error('Kategoriler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      reset({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || '',
        sortOrder: String(category.sortOrder || 0),
        isActive: category.isActive,
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
      })
    } else {
      setEditingCategory(null)
      reset({
        name: '',
        description: '',
        parentId: '',
        sortOrder: '0',
        isActive: true,
        metaTitle: '',
        metaDescription: '',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    reset()
  }

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      const categoryData = {
        ...data,
        sortOrder: parseInt(data.sortOrder || '0'),
        parentId: data.parentId || null,
      }

      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, categoryData)
        toast.success('Kategori güncellendi')
      } else {
        await categoriesAPI.create(categoryData)
        toast.success('Kategori oluşturuldu')
      }

      closeModal()
      fetchCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return

    try {
      await categoriesAPI.delete(id)
      toast.success('Kategori silindi')
      fetchCategories()
    } catch (error) {
      toast.error('Kategori silinemedi')
    }
  }

  const parentCategories = categories.filter(c => !c.parentId)
  const getChildren = (parentId) => categories.filter(c => c.parentId === parentId)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal-700">Kategori Yönetimi</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Yeni Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-charcoal-500">Kategori bulunamadı</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {parentCategories.map(category => (
              <div key={category.id}>
                {/* Parent Category */}
                <div className="flex items-center justify-between p-4 hover:bg-charcoal-50">
                  <div className="flex items-center">
                    <GripVertical className="w-5 h-5 text-charcoal-300 mr-3 cursor-move" />
                    <div className="w-12 h-12 bg-charcoal-100 rounded-lg overflow-hidden mr-4">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-charcoal-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-700">{category.name}</p>
                      <p className="text-sm text-charcoal-400">
                        Sıra: {category.sortOrder} · {category.isActive ? 'Aktif' : 'Pasif'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => openModal(category)}
                      className="p-2 hover:bg-charcoal-100 rounded-lg mr-2"
                    >
                      <Edit2 className="w-4 h-4 text-charcoal-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Sub Categories */}
                {getChildren(category.id).map(child => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 pl-16 bg-charcoal-50/50 hover:bg-charcoal-50"
                  >
                    <div className="flex items-center">
                      <GripVertical className="w-5 h-5 text-charcoal-300 mr-3 cursor-move" />
                      <div>
                        <p className="font-medium text-charcoal-600">{child.name}</p>
                        <p className="text-sm text-charcoal-400">
                          Sıra: {child.sortOrder} · {child.isActive ? 'Aktif' : 'Pasif'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => openModal(child)}
                        className="p-2 hover:bg-charcoal-100 rounded-lg mr-2"
                      >
                        <Edit2 className="w-4 h-4 text-charcoal-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-charcoal-700">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <label className="label">Kategori Adı *</label>
                <input {...register('name')} className="input" />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Üst Kategori</label>
                <select {...register('parentId')} className="input">
                  <option value="">Ana Kategori</option>
                  {parentCategories
                    .filter(c => c.id !== editingCategory?.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="label">Açıklama</label>
                <textarea {...register('description')} rows={3} className="input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Sıralama</label>
                  <input {...register('sortOrder')} type="number" className="input" />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register('isActive')} className="w-4 h-4" />
                    <span>Aktif</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="label">Meta Başlık (SEO)</label>
                <input {...register('metaTitle')} className="input" />
              </div>

              <div>
                <label className="label">Meta Açıklama (SEO)</label>
                <textarea {...register('metaDescription')} rows={2} className="input" />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-ghost">
                  İptal
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingCategory ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

