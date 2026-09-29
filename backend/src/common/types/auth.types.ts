export enum RoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_BIDANG = 'ADMIN_BIDANG',
  EKSEKUTIF = 'EKSEKUTIF',
  OPERATOR_BUJK = 'OPERATOR_BUJK',
  PESERTA_TKK = 'PESERTA_TKK',
}

export interface JwtPayload {
  sub: string;            // user.id
  username: string;       // user.username
  email: string;          // user.email
  role: RoleCode;         // user.role.code
  bujkId: string | null;  // non-null hanya untuk OPERATOR_BUJK
  permissions: string[];  // ['bujk:create', 'supervision:audit', ...]
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: {
    id: string;
    code: RoleCode;
    name: string;
  };
  bujkId: string | null;
  permissions: string[];
}
