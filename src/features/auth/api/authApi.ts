import { get, mutate } from '../../../services/api'
import type { Credentials, Profile } from '../types/auth.types'
export const authApi = {
  me: () => get<Profile>('/auth/me'),
  login: (body: Credentials) => mutate<Profile>('POST', '/auth/login', body),
  register: (body: Credentials & { displayName: string }) => mutate<Profile>('POST', '/auth/register', body),
  logout: () => mutate<void>('POST', '/auth/logout'),
  changePassword: (body: { currentPassword: string; newPassword: string }) => mutate<void>('POST', '/auth/password', body),
  updateProfile: (displayName: string) => mutate<Profile>('PATCH', '/profile', { displayName }),
}
