export interface JwtPayload {
  userId: string;
  email: string;
  isTwoFactorEnabled: boolean;
}
