export interface CreateUserI {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserResponseI {
  status: number;
  message: string;
  user_id?: number | undefined;
}

export interface LoginUserI {
  email: string;
  password: string;
}

export interface LoginUserResponseI {
  status: number;
  message: string;
  user_id?: number | undefined;
  access_token?: string | undefined | null | object;
}
