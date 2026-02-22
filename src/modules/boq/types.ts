export interface BOQVersion {
  id: number;
  version: number;
  status: string;
  created_at: string;
}

export interface BOQItem {
  id: number;
  item_type: "PRODUCT" | "DRIVER" | "ACCESSORY";
  quantity: number;
  unit_price: string;
  final_price: string;

  product_details?: {
    name: string;
    order_code: string;
    wattage?: number;
  } | null;

  driver_details?: {
    driver_code: string;
    driver_make?: string;
  } | null;

  accessory_details?: {
    name: string;
    type?: string;
  } | null;
}

export interface BOQSummary {
  subtotal: number;
  margin_percent: number;
  grand_total: number;
}
