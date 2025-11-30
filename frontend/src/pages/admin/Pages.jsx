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
  FileText,
  ExternalLink,
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import { formatDateTime } from '../../lib/utils'
import toast from 'react-hot-toast'

const pageSchema = z.object({
  title: z.string().min(1, 'Sayfa başlığı gerekli'),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().optional(),
})

export default function AdminPages() {
  const [pages, setPages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pageSchema),
    defaultValues: { isActive: true },
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getPages()
      setPages(response.data.data || [])
    } catch (error) {
      toast.error('Sayfalar yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (page = null) => {
    if (page) {
      setEditingPage(page)
      reset({
        title: page.title,
        content: page.content || '',
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        isActive: page.isActive,
      })
    } else {
      setEditingPage(null)
      reset({
        title: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPage(null)
    reset()
  }

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      if (editingPage) {
        await adminAPI.updatePage(editingPage.id, data)
        toast.success('Sayfa güncellendi')
      } else {
        await adminAPI.createPage(data)
        toast.success('Sayfa oluşturuldu')
      }

      closeModal()
      fetchPages()
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) return

    try {
      await adminAPI.deletePage(id)
      toast.success('Sayfa silindi')
      fetchPages()
    } catch (error) {
      toast.error('Sayfa silinemedi')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal-700">Sayfa Yönetimi</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Yeni Sayfa
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
            <p className="text-charcoal-500">Henüz sayfa yok</p>
            <p className="text-sm text-charcoal-400 mt-2">
              Hakkımızda, İletişim gibi sabit sayfalar oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-charcoal-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Sayfa</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">URL</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Güncelleme</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Durum</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-charcoal-500">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {pages.map(page => (
                  <tr key={page.id} className="hover:bg-charcoal-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center mr-3">
                          <FileText className="w-5 h-5 text-gold-600" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-700">{page.title}</p>
                          {page.metaTitle && page.metaTitle !== page.title && (
                            <p className="text-sm text-charcoal-400">{page.metaTitle}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/page/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gold-500 hover:text-gold-600"
                      >
                        <span className="font-mono text-sm">/{page.slug}</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-500">
                      {formatDateTime(page.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${page.isActive ? 'badge-success' : 'badge-warning'}`}>
                        {page.isActive ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(page)}
                        className="p-2 hover:bg-charcoal-100 rounded-lg mr-2"
                      >
                        <Edit2 className="w-4 h-4 text-charcoal-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
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
        )}
      </div>

      {/* Page Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-charcoal-700">
                {editingPage ? 'Sayfa Düzenle' : 'Yeni Sayfa'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <label className="label">Sayfa Başlığı *</label>
                <input {...register('title')} className="input" placeholder="Hakkımızda" />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">İçerik</label>
                <textarea
                  {...register('content')}
                  rows={10}
                  className="input font-mono text-sm"
                  placeholder="HTML içerik yazabilirsiniz..."
                />
                <p className="text-xs text-charcoal-400 mt-1">HTML desteklenir</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-charcoal-700 mb-4">SEO Ayarları</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Meta Başlık</label>
                    <input {...register('metaTitle')} className="input" placeholder="Hakkımızda - Perdecim" />
                    <p className="text-xs text-charcoal-400 mt-1">Boş bırakılırsa sayfa başlığı kullanılır</p>
                  </div>

                  <div>
                    <label className="label">Meta Açıklama</label>
                    <textarea
                      {...register('metaDescription')}
                      rows={2}
                      className="input"
                      placeholder="Sayfa açıklaması (160 karakter önerilir)"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4" />
                <span>Yayınla</span>
              </label>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-ghost">
                  İptal
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingPage ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

