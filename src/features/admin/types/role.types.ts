export interface ManagedRole {
  code: string; name: string; description: string; systemRole: boolean; userCount: number; permissions: string[]
}
export interface PermissionDefinition { code: string; name: string; module: string }
