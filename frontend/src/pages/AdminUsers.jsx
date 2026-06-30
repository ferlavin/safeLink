import { useEffect, useRef, useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

const emptyForm = {
  full_name: '',
  email: '',
  password: '',
  role: 'usuario',
  is_active: true,
}

function getAccountStatus(user) {
  if (user.is_banned) {
    return {
      label: 'Baneado',
      className: 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30',
    }
  }
  if (!user.is_active) {
    return {
      label: 'Suspendido',
      className: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
    }
  }
  return {
    label: 'Activo',
    className: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  }
}

function canModerate(user, currentUser) {
  if (!currentUser) return false
  if (user.id === currentUser.id) return false
  if (user.role === 'admin') return false
  return true
}

function buildMenuItems(user, moderatable) {
  const items = [{ id: 'edit', label: 'Editar', tone: 'default' }]

  if (moderatable) {
    if (!user.is_banned && user.is_active) {
      items.push({ id: 'suspend', label: 'Suspender', tone: 'warn' })
    }
    if (!user.is_banned && !user.is_active) {
      items.push({ id: 'reactivate', label: 'Reactivar', tone: 'success' })
    }
    if (!user.is_banned) {
      items.push({ id: 'ban', label: 'Banear', tone: 'danger' })
    }
    if (user.is_banned) {
      items.push({ id: 'unban', label: 'Quitar ban', tone: 'info' })
    }
    items.push({ id: 'delete', label: 'Eliminar', tone: 'danger' })
  }

  return items
}

const toneClasses = {
  default: 'app-dropdown-item',
  success: 'app-dropdown-item app-dropdown-item--success',
  warn: 'app-dropdown-item app-dropdown-item--warn',
  danger: 'app-dropdown-item app-dropdown-item--danger',
  info: 'app-dropdown-item',
}

function UserActionsMenu({
  user,
  currentUser,
  actionLoading,
  onEdit,
  onAction,
  onDelete,
  isOpen,
  onToggle,
  onClose,
}) {
  const menuRef = useRef(null)
  const moderatable = canModerate(user, currentUser)
  const items = buildMenuItems(user, moderatable)
  const busy = actionLoading?.startsWith(`${user.id}-`)

  useEffect(() => {
    if (!isOpen) return undefined
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  const handleSelect = (itemId) => {
    onClose()
    if (itemId === 'edit') {
      onEdit(user)
      return
    }
    if (itemId === 'delete') {
      onDelete(user)
      return
    }
    onAction(user, itemId)
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        disabled={busy}
        className="app-dropdown-trigger"
      >
        {busy ? 'Procesando...' : 'Acción'}
        <CaretDown
          size={12}
          weight="bold"
          className={`transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="app-dropdown-menu">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={toneClasses[item.tone]}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [openMenuUserId, setOpenMenuUserId] = useState(null)

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await client.get('/users')
      setUsers(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const runAction = async (user, action) => {
    const confirmMessages = {
      suspend: `Suspender a ${user.email}? No podra iniciar sesion hasta reactivar la cuenta.`,
      ban: `Banear a ${user.email}? Esta accion restringe el acceso por incumplimiento de las normas.`,
    }
    const confirmMessage = confirmMessages[action]
    if (confirmMessage && !window.confirm(confirmMessage)) return

    setActionLoading(`${user.id}-${action}`)
    setError('')
    try {
      await client.post(`/users/${user.id}/${action}`)
      await loadUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo completar la accion')
    } finally {
      setActionLoading(null)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditingId(user.id)
    setForm({
      full_name: user.full_name || '',
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await client.put(`/users/${editingId}`, payload)
      } else {
        await client.post('/users', form)
      }
      setShowModal(false)
      await loadUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo guardar el usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Eliminar al usuario ${user.email}?`)) return
    try {
      await client.delete(`/users/${user.id}`)
      await loadUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo eliminar el usuario')
    }
  }

  return (
    <AppShell>
      <div className="app-page-top">
        <div className="app-page-header">
          <span className="section-tag">Admin</span>
          <h1>Gestión de usuarios</h1>
          <p>
            Administra cuentas, suspende acceso temporal o banea usuarios por incumplimiento. No
            podés moderar administradores ni tu propia cuenta.
          </p>
        </div>
        <button onClick={openCreate} className="btn-gradient shrink-0 text-sm px-4 py-2">
          + Nuevo usuario
        </button>
      </div>

      {error && <div className="app-alert app-alert--error">{error}</div>}

      <div className="app-table-wrap">
        <table className="app-table min-w-[640px]">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="app-table-empty">
                  Cargando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="app-table-empty">
                  No hay usuarios
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const status = getAccountStatus(user)

                return (
                  <tr key={user.id}>
                    <td className="cell-main">{user.email}</td>
                    <td>{user.full_name || '—'}</td>
                    <td>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-[rgba(0,255,135,0.12)] text-neon-ice'
                            : 'bg-[rgba(0,229,255,0.1)] text-ocean-twilight'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="text-right">
                        <UserActionsMenu
                          user={user}
                          currentUser={currentUser}
                          actionLoading={actionLoading}
                          isOpen={openMenuUserId === user.id}
                          onToggle={() =>
                            setOpenMenuUserId((prev) =>
                              prev === user.id ? null : user.id,
                            )
                          }
                          onClose={() => setOpenMenuUserId(null)}
                          onEdit={openEdit}
                          onAction={runAction}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  )
                })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="app-modal-overlay">
          <form onSubmit={handleSubmit} className="app-modal space-y-4">
            <h2>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <div className="auth-field">
              <label htmlFor="full_name">Nombre completo</label>
              <input
                id="full_name"
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="app-input"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="app-input"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">
                Contraseña {editingId && '(dejar vacío para mantener)'}
              </label>
              <input
                id="password"
                type="password"
                required={!editingId}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="app-input"
              />
            </div>
            <div className="flex gap-4">
              <div className="auth-field flex-1">
                <label htmlFor="role">Rol</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="app-input"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="accent-[var(--accent-green)]"
                />
                Activo
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline-gradient text-sm px-4 py-2">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-gradient text-sm px-4 py-2 disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  )
}
