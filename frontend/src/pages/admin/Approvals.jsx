import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Eye, 
  EyeOff,
  Package,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import { formatPrice } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [rejectModal, setRejectModal] = useState({ open: false, id: null })
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchApprovals()
  }, [filter])

  const fetchApprovals = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getPendingApprovals({ status: filter })
      setApprovals(response.data.data)
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveRequest(id)
      toast.success('Talep onaylandı')
      fetchApprovals()
    } catch (error) {
      toast.error('İşlem başarısız')
    }
  }

  const handleReject = async () => {
    try {
      await adminAPI.rejectRequest(rejectModal.id, rejectReason)
      toast.success('Talep reddedildi')
      setRejectModal({ open: false, id: null })
      setRejectReason('')
      fetchApprovals()
    } catch (error) {
      toast.error('İşlem başarısız')
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      price_change: 'Fiyat Değişikliği',
      product_visibility: 'Ürün Görünürlük',
      product_update: 'Ürün Güncelleme',
      stock_change: 'Stok Değişikliği'
    }
    return labels[type] || type
  }

  const getTypeIcon = (type) => {
    const icons = {
      price_change: DollarSign,
      product_visibility: EyeOff,
      product_update: Package,
      stock_change: Package
    }
    return icons[type] || Clock
  }

  const getTypeColor = (type) => {
    const colors = {
      price_change: 'from-emerald-500 to-emerald-600',
      product_visibility: 'from-violet-500 to-violet-600',
      product_update: 'from-blue-500 to-blue-600',
      stock_change: 'from-orange-500 to-orange-600'
    }
    return colors[type] || 'from-gray-500 to-gray-600'
  }

  const formatValue = (type, value) => {
    if (type === 'price_change') {
      return (
        <div>
          <p>Fiyat: <span className="font-bold text-amber-600">{formatPrice(value.price)}</span></p>
          {value.comparePrice && (
            <p className="text-sm text-gray-500">Karşılaştırma: {formatPrice(value.comparePrice)}</p>
          )}
        </div>
      )
    }
    if (type === 'product_visibility') {
      return value.isRemovedFromSale ? (
        <span className="text-red-600 font-medium">Satıştan Kaldır</span>
      ) : (
        <span className="text-green-600 font-medium">Satışa Al</span>
      )
    }
    return JSON.stringify(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onay Bekleyen İşlemler</h1>
          <p className="text-gray-500 mt-1">Personel taleplerini inceleyin ve onaylayın</p>
        </div>

        {/* Filter */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === status
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status === 'pending' && 'Bekleyen'}
              {status === 'approved' && 'Onaylanan'}
              {status === 'rejected' && 'Reddedilen'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
              <div className="h-24 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'pending' ? 'Onay bekleyen işlem yok' : 'Kayıt bulunamadı'}
          </h3>
          <p className="text-gray-500">
            {filter === 'pending' && 'Personel talepleri burada görünecek'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval, index) => {
            const TypeIcon = getTypeIcon(approval.type)
            
            return (
              <motion.div
                key={approval.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(approval.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{getTypeLabel(approval.type)}</h3>
                          {approval.entity && (
                            <p className="text-gray-600 mt-1">
                              Ürün: <span className="font-medium">{approval.entity.name}</span>
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          approval.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          approval.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {approval.status === 'pending' && 'Bekliyor'}
                          {approval.status === 'approved' && 'Onaylandı'}
                          {approval.status === 'rejected' && 'Reddedildi'}
                        </span>
                      </div>

                      {/* Values */}
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 mb-2">Eski Değer</p>
                          {formatValue(approval.type, approval.oldValue)}
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4">
                          <p className="text-xs text-amber-600 mb-2">Yeni Değer</p>
                          {formatValue(approval.type, approval.newValue)}
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{approval.requester?.firstName} {approval.requester?.lastName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(approval.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        {approval.notes && (
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            <span>{approval.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Rejection reason */}
                      {approval.status === 'rejected' && approval.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                          <strong>Red Sebebi:</strong> {approval.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {approval.status === 'pending' && (
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                      <button
                        onClick={() => setRejectModal({ open: true, id: approval.id })}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reddet
                      </button>
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Onayla
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Talebi Reddet</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Bu talebi reddetmek istediğinize emin misiniz? Red sebebini belirtmeniz önerilir.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Red sebebi (opsiyonel)"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              rows={3}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModal({ open: false, id: null })
                  setRejectReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Reddet
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

