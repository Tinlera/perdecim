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
  Eye,
  EyeOff,
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const bannerSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  subtitle: z.string().optional(),
  link: z.string().optional(),
  buttonText: z.string().optional(),
  sortOrder: z.string().optional(),
  isActive: z.boolean().optional(),
})

export default function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: { isActive: true },
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getBanners()
      setBanners(response.data.data || [])
    } catch (error) {
      toast.error('Bannerlar yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner)
      reset({
        title: banner.title,
        subtitle: banner.subtitle || '',
        link: banner.link || '',
        buttonText: banner.buttonText || '',
        sortOrder: String(banner.sortOrder || 0),
        isActive: banner.isActive,
      })
    } else {
      setEditingBanner(null)
      reset({
        title: '',
        subtitle: '',
        link: '',
        buttonText: '',
        sortOrder: '0',
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBanner(null)
    reset()
  }

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      const bannerData = {
        ...data,
        sortOrder: parseInt(data.sortOrder || '0'),
      }

      if (editingBanner) {
        await adminAPI.updateBanner(editingBanner.id, bannerData)
        toast.success('Banner güncellendi')
      } else {
        await adminAPI.createBanner(bannerData)
        toast.success('Banner oluşturuldu')
      }

      closeModal()
      fetchBanners()
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu banner\'ı silmek istediğinizden emin misiniz?')) return

    try {
      await adminAPI.deleteBanner(id)
      toast.success('Banner silindi')
      fetchBanners()
    } catch (error) {
      toast.error('Banner silinemedi')
    }
  }

  const toggleStatus = async (banner) => {
    try {
      await adminAPI.updateBanner(banner.id, { isActive: !banner.isActive })
      toast.success(banner.isActive ? 'Banner gizlendi' : 'Banner aktifleştirildi')
      fetchBanners()
    } catch (error) {
      toast.error('İşlem başarısız')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal-700">Banner/Slider Yönetimi</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Yeni Banner
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
            <p className="text-charcoal-500">Henüz banner yok</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {banners.map(banner => (
              <div key={banner.id} className="flex items-center p-4 hover:bg-charcoal-50">
                <GripVertical className="w-5 h-5 text-charcoal-300 mr-3 cursor-move" />
                
                {/* Preview */}
                <div className="w-32 h-20 bg-charcoal-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-charcoal-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-700 truncate">{banner.title}</p>
                  {banner.subtitle && (
                    <p className="text-sm text-charcoal-400 truncate">{banner.subtitle}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-charcoal-400">Sıra: {banner.sortOrder}</span>
                    {banner.link && (
                      <span className="text-xs text-charcoal-400">Link: {banner.link}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(banner)}
                    className={`p-2 rounded-lg ${banner.isActive ? 'hover:bg-green-50 text-green-500' : 'hover:bg-charcoal-100 text-charcoal-400'}`}
                    title={banner.isActive ? 'Gizle' : 'Aktifleştir'}
                  >
                    {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openModal(banner)}
                    className="p-2 hover:bg-charcoal-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 text-charcoal-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-charcoal-400 mt-4">
        * Banner görselleri için önerilen boyut: 1920x600 piksel (Desktop), 768x400 piksel (Mobil)
      </p>

      {/* Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-charcoal-700">
                {editingBanner ? 'Banner Düzenle' : 'Yeni Banner'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <label className="label">Başlık *</label>
                <input {...register('title')} className="input" placeholder="Yeni Koleksiyon" />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">Alt Başlık</label>
                <input {...register('subtitle')} className="input" placeholder="2024 İlkbahar/Yaz" />
              </div>

              <div>
                <label className="label">Link URL</label>
                <input {...register('link')} className="input" placeholder="/products" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Buton Yazısı</label>
                  <input {...register('buttonText')} className="input" placeholder="İncele" />
                </div>
                <div>
                  <label className="label">Sıralama</label>
                  <input {...register('sortOrder')} type="number" className="input" />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4" />
                <span>Aktif</span>
              </label>

              <div className="p-4 bg-charcoal-50 rounded-lg">
                <p className="text-sm text-charcoal-500">
                  Not: Görsel yükleme özelliği için dosya yükleme alanı eklenecektir.
                  Şimdilik görseller backend tarafından yönetilebilir.
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-ghost">
                  İptal
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingBanner ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

