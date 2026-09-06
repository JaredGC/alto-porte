export const RolesMap = {
  super_admin: 1,
  admin: 2,
  agent: 3,
} as const;

export type RoleKey = keyof typeof RolesMap;