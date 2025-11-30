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
  Tag,
  Percent,
  DollarSign,
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import { formatPrice, formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

const couponSchema = z.object({
  code: z.string().min(1, 'Kupon kodu gerekli'),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.string().min(1, 'İndirim değeri gerekli'),
  minOrderAmount: z.string().optional(),
  maxDiscount: z.string().optional(),
  usageLimit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
})

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discountType: 'percentage',
      isActive: true,
    },
  })

  const discountType = watch('discountType')

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getCoupons()
      setCoupons(response.data.data || [])
    } catch (error) {
      toast.error('Kuponlar yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon)
      reset({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: String(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
        maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
        usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
        startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
        endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
        isActive: coupon.isActive,
      })
    } else {
      setEditingCoupon(null)
      reset({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCoupon(null)
    reset()
  }

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      const couponData = {
        ...data,
        discountValue: parseFloat(data.discountValue),
        minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : null,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      }

      if (editingCoupon) {
        await adminAPI.updateCoupon(editingCoupon.id, couponData)
        toast.success('Kupon güncellendi')
      } else {
        await adminAPI.createCoupon(couponData)
        toast.success('Kupon oluşturuldu')
      }

      closeModal()
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return

    try {
      await adminAPI.deleteCoupon(id)
      toast.success('Kupon silindi')
      fetchCoupons()
    } catch (error) {
      toast.error('Kupon silinemedi')
    }
  }

  const isExpired = (endDate) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal-700">Kupon Yönetimi</h1>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Yeni Kupon
        </button>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
            <p className="text-charcoal-500">Henüz kupon yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-charcoal-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Kupon Kodu</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">İndirim</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Kullanım</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Tarih Aralığı</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Durum</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-charcoal-500">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-charcoal-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center mr-3">
                          <Tag className="w-5 h-5 text-gold-600" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-charcoal-700">{coupon.code}</p>
                          {coupon.description && (
                            <p className="text-sm text-charcoal-400">{coupon.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {coupon.discountType === 'percentage' ? (
                          <>
                            <Percent className="w-4 h-4 mr-1 text-green-500" />
                            <span className="font-medium text-green-600">%{coupon.discountValue}</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                            <span className="font-medium text-green-600">{formatPrice(coupon.discountValue)}</span>
                          </>
                        )}
                      </div>
                      {coupon.minOrderAmount && (
                        <p className="text-xs text-charcoal-400">Min: {formatPrice(coupon.minOrderAmount)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-charcoal-700">
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-500">
                      {coupon.startDate || coupon.endDate ? (
                        <>
                          {coupon.startDate && formatDate(coupon.startDate)}
                          {coupon.startDate && coupon.endDate && ' - '}
                          {coupon.endDate && formatDate(coupon.endDate)}
                        </>
                      ) : (
                        'Süresiz'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isExpired(coupon.endDate) ? (
                        <span className="badge badge-error">Süresi Dolmuş</span>
                      ) : (
                        <span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-warning'}`}>
                          {coupon.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(coupon)}
                        className="p-2 hover:bg-charcoal-100 rounded-lg mr-2"
                      >
                        <Edit2 className="w-4 h-4 text-charcoal-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
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

      {/* Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-charcoal-700">
                {editingCoupon ? 'Kupon Düzenle' : 'Yeni Kupon'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <label className="label">Kupon Kodu *</label>
                <input
                  {...register('code')}
                  className="input font-mono uppercase"
                  placeholder="YENI2024"
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
              </div>

              <div>
                <label className="label">Açıklama</label>
                <input {...register('description')} className="input" placeholder="Yeni yıl indirimi" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">İndirim Tipi *</label>
                  <select {...register('discountType')} className="input">
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="label">İndirim Değeri *</label>
                  <input
                    {...register('discountValue')}
                    type="number"
                    step="0.01"
                    className="input"
                    placeholder={discountType === 'percentage' ? '10' : '50'}
                  />
                  {errors.discountValue && (
                    <p className="text-red-500 text-sm mt-1">{errors.discountValue.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Min. Sipariş Tutarı (₺)</label>
                  <input {...register('minOrderAmount')} type="number" className="input" placeholder="100" />
                </div>
                <div>
                  <label className="label">Max. İndirim (₺)</label>
                  <input {...register('maxDiscount')} type="number" className="input" placeholder="50" />
                </div>
              </div>

              <div>
                <label className="label">Kullanım Limiti</label>
                <input {...register('usageLimit')} type="number" className="input" placeholder="Sınırsız için boş bırakın" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Başlangıç Tarihi</label>
                  <input {...register('startDate')} type="date" className="input" />
                </div>
                <div>
                  <label className="label">Bitiş Tarihi</label>
                  <input {...register('endDate')} type="date" className="input" />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4" />
                <span>Aktif</span>
              </label>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-ghost">
                  İptal
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingCoupon ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

