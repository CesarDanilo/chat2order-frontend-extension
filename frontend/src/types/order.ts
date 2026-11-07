export type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: string;
  status: string;
  total: number;
  source: string;
  rawMessage: string;
  createdAt: string;
  items: OrderItem[];
};
