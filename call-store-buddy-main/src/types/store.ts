export interface Store {
  id: string;
  created_at: string;
  phone_number: number;
  created: string;
  last_called: string;
  location: string;
  store_name: string;
  transcript?: string;
}

export interface StoreFormData {
  phone_number: string;
  location: string;
  store_name: string;
}