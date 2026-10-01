import { mutate } from '../../../services/api'
import type { ManagedRole } from '../types/role.types'
type RoleInput = { name: string; description: string; permissions: string[] }
export const adminRoleApi = {
  create: (body: RoleInput & { code: string }) => mutate<ManagedRole>('POST', '/admin/roles', body),
  update: (code: string, body: RoleInput) => mutate<ManagedRole>('PUT', '/admin/roles/' + encodeURIComponent(code), body),
  delete: (code: string) => mutate<void>('DELETE', '/admin/roles/' + encodeURIComponent(code)),
}
