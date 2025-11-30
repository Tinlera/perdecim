import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Check } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function AccountSettings() {
  const { user, updateProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await updateProfile(data)
      toast.success('Profil güncellendi')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Güncellenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-xl font-semibold text-charcoal-700 mb-6">Profil Ayarları</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        {/* Email (readonly) */}
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="input bg-charcoal-50 cursor-not-allowed"
          />
          <p className="text-charcoal-400 text-xs mt-1">
            Email adresi değiştirilemez
          </p>
        </div>

        {/* Name */}
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

        {/* Phone */}
        <div>
          <label className="label">Telefon</label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="05XX XXX XX XX"
            className="input"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Kaydet
            </>
          )}
        </button>
      </form>
    </div>
  )
}
