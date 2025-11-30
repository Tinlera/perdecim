import { useState, useEffect } from 'react'
import {
  Search,
  Edit2,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Shield,
} from 'lucide-react'
import { usersAPI } from '../../services/api'
import { formatDateTime, getRoleText } from '../../lib/utils'
import toast from 'react-hot-toast'

const roleOptions = [
  { value: 'customer', label: 'Müşteri' },
  { value: 'staff', label: 'Personel' },
  { value: 'manager', label: 'Müdür' },
  { value: 'admin', label: 'Yönetici' },
]

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, searchQuery, roleFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await usersAPI.getAll({
        page: pagination.page,
        limit: 10,
        search: searchQuery,
        role: roleFilter,
      })
      setUsers(response.data.data.users || [])
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.data.pagination?.totalPages || 1,
      }))
    } catch (error) {
      toast.error('Kullanıcılar yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const openUserModal = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleRoleChange = async (userId, newRole) => {
    setIsSaving(true)
    try {
      await usersAPI.changeRole(userId, newRole)
      toast.success('Kullanıcı rolü güncellendi')
      fetchUsers()
      setIsModalOpen(false)
    } catch (error) {
      toast.error('Rol güncellenemedi')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await usersAPI.update(userId, { isActive: !currentStatus })
      toast.success(currentStatus ? 'Kullanıcı devre dışı bırakıldı' : 'Kullanıcı aktifleştirildi')
      fetchUsers()
    } catch (error) {
      toast.error('İşlem başarısız')
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'manager': return 'bg-blue-100 text-blue-700'
      case 'staff': return 'bg-green-100 text-green-700'
      default: return 'bg-charcoal-100 text-charcoal-700'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal-700">Kullanıcı Yönetimi</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="İsim veya email ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="">Tüm Roller</option>
          {roleOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-charcoal-500">Kullanıcı bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-charcoal-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Kullanıcı</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Rol</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Kayıt Tarihi</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Son Giriş</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Durum</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-charcoal-500">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-charcoal-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gold-400 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-medium">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-700">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-charcoal-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-charcoal-500">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-charcoal-500">
                        {user.lastLogin ? formatDateTime(user.lastLogin) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`badge cursor-pointer ${user.isActive ? 'badge-success' : 'badge-error'}`}
                        >
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openUserModal(user)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4 text-charcoal-500" />
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

      {/* User Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-charcoal-700">Kullanıcı Düzenle</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gold-400 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl font-medium">
                    {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-lg">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-charcoal-500">{selectedUser.email}</p>
                  <p className="text-charcoal-500">{selectedUser.phone || 'Telefon yok'}</p>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="label flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Kullanıcı Rolü
                </label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {roleOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleRoleChange(selectedUser.id, opt.value)}
                      disabled={isSaving}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedUser.role === opt.value
                          ? 'border-gold-400 bg-gold-50 text-gold-700'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2FA Status */}
              <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                <span className="text-charcoal-700">2FA Durumu</span>
                <span className={`badge ${selectedUser.twoFactorEnabled ? 'badge-success' : 'badge-warning'}`}>
                  {selectedUser.twoFactorEnabled ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              {/* Account Status */}
              <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                <span className="text-charcoal-700">Hesap Durumu</span>
                <button
                  onClick={() => {
                    toggleUserStatus(selectedUser.id, selectedUser.isActive)
                    setSelectedUser(prev => ({ ...prev, isActive: !prev.isActive }))
                  }}
                  className={`badge cursor-pointer ${selectedUser.isActive ? 'badge-success' : 'badge-error'}`}
                >
                  {selectedUser.isActive ? 'Aktif' : 'Pasif'}
                </button>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t">
              <button onClick={() => setIsModalOpen(false)} className="btn-ghost">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

