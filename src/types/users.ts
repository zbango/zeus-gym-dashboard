export interface User {
  id: number;
  name: string;
  avatar: string;
  email: string;
  status: string;
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
}

export const UserRoleLabels = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.STAFF]: 'Encargado',
};

export const UserRoleColors = {
  [UserRole.ADMIN]: 'primary',
  [UserRole.STAFF]: 'secondary',
};

export const UserRoleOptions = [
  {
    label: UserRoleLabels[UserRole.ADMIN],
    value: UserRole.ADMIN,
  },
  {
    label: UserRoleLabels[UserRole.STAFF],
    value: UserRole.STAFF,
  },
];
