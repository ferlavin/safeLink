import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import client from '../api/client'

const emptyForm = {
  full_name: '',
  email: '',
  password: '',
  role: 'usuario',
  is_active: true,
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestion de usuarios</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Administra las cuentas de SafeLink: crea nuevos usuarios, asigna rol
              administrador o estandar, activa o desactiva cuentas y restablece
              contrasenas.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            + Nuevo usuario
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No hay usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800/60 last:border-0"
                  >
                    <td className="px-4 py-3 text-white">{user.email}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {user.full_name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-sky-500/15 text-sky-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.is_active
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-slate-600/30 text-slate-400'
                        }`}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(user)}
                        className="mr-2 rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition hover:border-emerald-500 hover:text-emerald-400"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition hover:border-rose-500 hover:text-rose-400"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-white">
              {editingId ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Nombre completo
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Contrasena {editingId && '(dejar vacio para mantener)'}
              </label>
              <input
                type="password"
                required={!editingId}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm text-slate-300">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="h-4 w-4 accent-emerald-500"
                />
                Activo
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
