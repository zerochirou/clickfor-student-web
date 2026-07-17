// lib/role-access.ts

export type WorkspaceRole = 'staff' | 'manager' | 'admin' | 'owner';

const roleLevel: Record<WorkspaceRole, number> = {
  staff: 1,
  manager: 2,
  admin: 3,
  owner: 4,
};

export function canAccessRole(
  userRole: WorkspaceRole | null | undefined,
  requiredRole: WorkspaceRole,
) {
  if (!userRole) return false;

  return roleLevel[userRole] >= roleLevel[requiredRole];
}
