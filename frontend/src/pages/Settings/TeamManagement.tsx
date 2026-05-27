import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUsers } from '@/hooks/useUsers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { ChevronDown, Loader2 } from 'lucide-react'

const ROLES = ['admin', 'manager', 'employee', 'guest', 'viewer'] as const
const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
  guest: 'Guest',
  viewer: 'Viewer',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  employee: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  guest: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

export function TeamManagement() {
  const { t } = useTranslation()
  const { users, loading, fetch, updateRole } = useUsers()
  const [updating, setUpdating] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    fetch()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      await updateRole(userId, newRole)
      setOpenDropdown(null)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading team members...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage user roles and permissions across your organization
        </p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.full_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === user.id ? null : user.id)
                      }
                      disabled={updating === user.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 text-xs font-medium"
                    >
                      {updating === user.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          {ROLE_LABELS[user.role]}
                          <ChevronDown size={12} />
                        </>
                      )}
                    </button>

                    {openDropdown === user.id && (
                      <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded shadow-lg z-50 min-w-32">
                        {ROLES.map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(user.id, role)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-muted first:rounded-t last:rounded-b"
                          >
                            {ROLE_LABELS[role]}
                            {user.role === role && (
                              <span className="float-right">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={user.is_active ? 'success' : 'secondary'}
                    className="capitalize text-xs"
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">No team members found.</p>
        </div>
      )}
    </div>
  )
}
