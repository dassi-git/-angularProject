export interface User {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}