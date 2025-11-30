import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react'
import { usersAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AccountAddresses() {
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await usersAPI.getAddresses()
      setAddresses(response.data.data)
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (address) => {
    setEditingId(address.id)
    setShowForm(true)
    Object.keys(address).forEach((key) => {
      setValue(key, address[key])
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return

    try {
      await usersAPI.deleteAddress(id)
      setAddresses(addresses.filter((a) => a.id !== id))
      toast.success('Adres silindi')
    } catch (error) {
      toast.error('Adres silinemedi')
    }
  }

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      if (editingId) {
        await usersAPI.updateAddress(editingId, data)
        toast.success('Adres güncellendi')
      } else {
        await usersAPI.addAddress(data)
        toast.success('Adres eklendi')
      }
      await fetchAddresses()
      setShowForm(false)
      setEditingId(null)
      reset()
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    reset()
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-charcoal-700">Adreslerim</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Adres
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Adres Başlığı</label>
              <input
                {...register('title', { required: 'Başlık gerekli' })}
                placeholder="Ev, İş vb."
                className={`input ${errors.title ? 'input-error' : ''}`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="label">Telefon</label>
              <input
                {...register('phone', { required: 'Telefon gerekli' })}
                placeholder="05XX XXX XX XX"
                className={`input ${errors.phone ? 'input-error' : ''}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ad</label>
              <input
                {...register('firstName', { required: 'Ad gerekli' })}
                className={`input ${errors.firstName ? 'input-error' : ''}`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Soyad</label>
              <input
                {...register('lastName', { required: 'Soyad gerekli' })}
                className={`input ${errors.lastName ? 'input-error' : ''}`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">İl</label>
              <input
                {...register('city', { required: 'İl gerekli' })}
                className={`input ${errors.city ? 'input-error' : ''}`}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <label className="label">İlçe</label>
              <input
                {...register('district', { required: 'İlçe gerekli' })}
                className={`input ${errors.district ? 'input-error' : ''}`}
              />
              {errors.district && (
                <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Adres</label>
            <textarea
              {...register('addressLine', { required: 'Adres gerekli' })}
              rows={3}
              placeholder="Mahalle, sokak, bina no, daire no..."
              className={`input ${errors.addressLine ? 'input-error' : ''}`}
            />
            {errors.addressLine && (
              <p className="text-red-500 text-xs mt-1">{errors.addressLine.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                {...register('isDefault')}
                type="checkbox"
                className="w-4 h-4 text-gold-400 border-charcoal-300 rounded focus:ring-gold-400"
              />
              <span className="text-sm text-charcoal-600">Varsayılan adres olarak ayarla</span>
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-outline"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : editingId ? (
                'Güncelle'
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </form>
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-charcoal-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
          <p className="text-charcoal-500">Kayıtlı adresiniz yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="p-4 border border-charcoal-100 rounded-lg relative"
            >
              {address.isDefault && (
                <span className="absolute top-4 right-4 badge-gold">
                  <Check className="w-3 h-3 mr-1" />
                  Varsayılan
                </span>
              )}
              <h3 className="font-medium text-charcoal-700">{address.title}</h3>
              <p className="text-charcoal-600 mt-1">
                {address.firstName} {address.lastName}
              </p>
              <p className="text-charcoal-500 text-sm mt-1">
                {address.addressLine}
              </p>
              <p className="text-charcoal-500 text-sm">
                {address.district}, {address.city}
              </p>
              <p className="text-charcoal-500 text-sm">{address.phone}</p>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleEdit(address)}
                  className="text-charcoal-500 hover:text-gold-500 text-sm flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-charcoal-500 hover:text-red-500 text-sm flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
