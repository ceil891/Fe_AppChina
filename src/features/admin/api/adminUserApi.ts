import { get, mutate } from '../../../services/api'
import type { ManagedUser, CreateUser, UpdateUser } from '../types/adminUser.types'
export const adminUserApi={
  get:(id:string)=>get<ManagedUser>('/admin/users/'+id),
  create:(body:CreateUser)=>mutate<ManagedUser>('POST','/admin/users',body),
  update:(id:string,body:UpdateUser)=>mutate<ManagedUser>('PUT','/admin/users/'+id,body),
  password:(id:string,password:string)=>mutate<void>('POST',`/admin/users/${id}/password`,{password}),
  status:(id:string,enabled:boolean)=>mutate<ManagedUser>('PATCH',`/admin/users/${id}/status`,{enabled}),
  delete:(id:string)=>mutate<void>('DELETE','/admin/users/'+id),
}
