// Database Schema Types

// Enums based on schema notes
export type EmployeeRole = 'Driver' | 'Helper' | 'Encoder';
export type TruckStatus = 'Available' | 'In Use' | 'Maintenance';
export type TripStatus = 'Scheduled' | 'In Transit' | 'Completed' | 'Cancelled' | 'Rescue' | 'Backload';
export type LoadType = 'Dry' | 'Chilled' | 'Ref' | 'Combi';
export type EventType = 'Loading_Arrival' | 'Loading_Start' | 'Unloading_Finish';

// Auth & System Types
export type UserRole = 'SuperAdmin' | 'Admin' | 'User';
export type AppModule = 'inventory' | 'trip_scheduling' | 'billing';
export type Theme = 'light' | 'dark';

export interface SystemUser {
  id: number;
  username: string;
  password?: string; // Optional for UI display, required for auth check
  role: UserRole;
  permissions: AppModule[];
}

// Table: Employees
export interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  role: EmployeeRole;
  license_number?: string; // Only for drivers
}

// Table: Customers
export interface Customer {
  customer_id: number;
  name: string;
  contact_name: string;
  contact_phone: string;
}

// Table: Locations
export interface Location {
  location_id: number;
  name: string;
  address_line_1: string;
  city: string;
  latitude: number;
  longitude: number;
  is_hub: boolean;
}

// Table: Trucks
export interface Truck {
  truck_id: number;
  license_plate: string;
  vin: string;
  tonner_capacity: number;
  status: TruckStatus;
}

// Table: Trips
export interface Trip {
  trip_id: number;
  trip_code: string; // Trip Advice/Code
  customer_id: number; // FK -> Customers
  truck_id: number; // FK -> Trucks
  driver_id: number; // FK -> Employees (Driver)
  helper1_id?: number; // FK -> Employees (Helper)
  helper2_id?: number; // FK -> Employees (Helper)
  origin_location_id: number; // FK -> Locations
  destination_location_id: number; // FK -> Locations
  scheduled_start_time: string; // ISO Date string
  status: TripStatus;
  load_type: LoadType;
  loading_ref_no?: string;
  net_weight?: number;
}

// Table: Trip_Events
export interface TripEvent {
  event_id: number;
  trip_id: number; // FK -> Trips
  encoder_id: number; // FK -> Employees (Encoder)
  event_type: EventType;
  event_timestamp: string;
  document_no?: string;
}

// Table: Trip_Fuels
export interface TripFuel {
  fuel_id: number;
  trip_id: number; // FK -> Trips
  encoder_id: number; // FK -> Employees
  fuel_ref_no: string;
  liters: number;
  total_amount: number;
}

// Helper interface for resolving Foreign Keys in UI
export interface EnrichedTrip extends Trip {
  customer_name: string;
  driver_name: string;
  truck_plate: string;
  origin_name: string;
  destination_name: string;
}