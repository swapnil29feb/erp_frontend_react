// Type definitions for the ERP data model

export interface Project {
  id: string;
  name: string;
  project_code: string;
  client_name: string;
  location: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  start_date?: string;
  end_date?: string;
  description: string;
  created_at: string;
  areas: Area[];

  // Legacy/UI fields
  client?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'available' | 'busy' | 'away';
  workload: number; // percentage
}

export interface ProjectPhase {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface ProjectDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url?: string;
}

export interface Area {
  id: string;
  project: string; // Project ID
  name: string;
  area_code: string;
  floor?: string;
  area_type?: string;
  description: string;
  created_at: string;
  products: Product[];

  // Legacy/UI fields
  projectId?: string;
  dimension?: string;
}

export interface Product {
  id: string;
  areaId: string;
  name: string;
  category: string;
  specification: string;
  quantity: number;
  unit: string;
  drivers: Driver[];
  accessories: Accessory[];
  masterProductId?: number;
}

export interface Driver {
  id: string;
  productId: string;
  name: string;
  model: string;
  wattage: string;
  voltage: string;
  quantity: number;
  masterDriverId?: number;
}

export interface Accessory {
  id: string;
  productId: string;
  name: string;
  type: string;
  specification: string;
  quantity: number;
  masterAccessoryId?: number;
}

export interface BOQ {
  id: string;
  projectId: string;
  version: string;
  revision: number;
  createdAt: string;
  status: 'draft' | 'approved' | 'final';
  items: BOQItem[];
}

export interface BOQItem {
  id: string;
  areaName: string;
  productName: string;
  productQuantity: number;
  driverName?: string;
  driverQuantity?: number;
  accessoryName?: string;
  accessoryQuantity?: number;
  unitPrice: number;
  totalPrice: number;
}

// Specification Library Types
export interface MasterDriver {
  id: number;
  driver_id?: number;
  driver_code: string;
  driver_make: string;
  driver_type: string;
  input_voltage_range?: string;
  max_wattage?: number;
  dimmable: 'YES' | 'NO';
  driver_integration?: 'INTEGRATED' | 'EXTERNAL';


  // Legacy/UI fields
  name?: string;
  code?: string;
  brand?: string;
}

export interface MasterAccessory {
  id: number;
  accessory_id?: number;
  accessory_name: string;
  accessory_type: string;
  description?: string;

  // Legacy/UI fields
  name?: string;
  code?: string;
  type?: string;
}

export interface MasterProduct {
  // Primary Key
  id: number; // prod_id
  prod_id?: number;

  // Basic Info
  make: string;
  order_code: string;
  luminaire_color_ral?: string;
  characteristics?: string;

  // Dimensions
  diameter_mm?: number;
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  linear: 'YES' | 'NO';

  // Mounting & Technical
  mounting_style: string;
  beam_angle_degree?: number;
  ip_class?: number;

  // Electrical & Optical
  wattage?: number;
  op_voltage?: number;
  op_current?: number;
  lumen_output?: number;
  cct_kelvin?: number;
  cri_cci?: number;
  lumen_efficency?: number;

  // Physical & Warranty
  weight_kg?: number;
  warranty_years?: number;

  // Media & Links
  website_link?: string;
  visual_image?: string; // URL to image

  // Legacy/UI fields (to be maintained or refactored)
  name?: string; // Mapped to make + order_code or similar?
  compatibleDrivers?: number[];
  compatibleAccessories?: number[];
}

// API Response types for future Django integration
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
