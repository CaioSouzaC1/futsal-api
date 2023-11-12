export interface storeTokenI {
  userId: number;
  token: string;
  type: string;
}
export interface storeTokenResponseI {
  id: number;
  userId: number;
  token: string;
  expiresIn: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}
