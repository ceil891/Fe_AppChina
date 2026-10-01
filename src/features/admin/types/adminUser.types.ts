export interface ManagedUser {
  id: string; email: string; displayName: string; role: string; enabled: boolean; createdAt: string; learningRecordCount: number
}
export interface UserPage { items: ManagedUser[]; total: number; page: number; size: number }
export interface CreateUser { email: string; displayName: string; password: string; role: string }
export interface UpdateUser { displayName: string; role: string; enabled: boolean }
