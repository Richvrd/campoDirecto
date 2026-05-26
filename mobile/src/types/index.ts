export interface User {
  id: number;
  name: string;
  email: string;
  role: 'agricultor' | 'comprador' | 'admin';
  phone?: string;
  avatar_url?: string;
  expo_push_token?: string;
  location?: Location;
}

export interface Location {
  id: number;
  commune: string;
  region: string;
  latitude?: number;
  longitude?: number;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  products_count?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stock: number;
  image_url?: string;
  status: 'disponible' | 'agotado' | 'pausado';
  category: Category;
  user: User;
}

export interface Reservation {
  id: number;
  quantity: number;
  status: 'pendiente' | 'confirmada' | 'rechazada' | 'completada';
  notes?: string;
  created_at: string;
  product: Product;
  buyer: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type RootStackParamList = {
  Auth: undefined;
  BuyerTabs: undefined;
  FarmerTabs: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type BuyerTabParamList = {
  Home: undefined;
  MyReservations: undefined;
  Profile: undefined;
};

export type FarmerTabParamList = {
  MyProducts: undefined;
  IncomingReservations: undefined;
  Profile: undefined;
};
