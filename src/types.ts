/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LineItem {
  id: string;
  name: string;
  quantity: number | "";
  unitPrice: number;
  description?: string;
  itemType?: string;
  revenueClassification?: string;
  servingUnit?: string;
  soldByUnit?: string;
  serviceStart?: string;
  serviceEnd?: string;
  adminPercent?: number;
  gratuityPercent?: number;
  sortOrder?: number;
}

export interface EventRequirements {
  food: LineItem[];
  beverage: LineItem[];
  setup: LineItem[];
  av: LineItem[];
  other: LineItem[];
}

export interface BardoEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // e.g. "12:00 PM"
  endTime: string; // e.g. "1:00 PM"
  status: "Definite" | "Tentative" | "Pending Approval";
  room: string;
  setupStyle: string;
  expectedAttendance: number;
  guaranteedAttendance: number;
  requirements: EventRequirements;
}

export interface Booking {
  title: string;
  propertyName: string;
  account: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  taxExempt: boolean;
  masterAccountNum: string;
  paymentMethod: string;
  bookedBy: string;
  serviceManager: string;
  revenueType: string;
  expectedAttendanceGlobal: number;
  foodCutoffDate: string; // YYYY-MM-DD
  finalGuaranteeDate: string; // YYYY-MM-DD
}

export interface CatalogItem {
  id: string;
  name: string;
  unitPrice: number;
  category: "food" | "beverage" | "setup" | "av" | "other";
  description?: string;
  revenueClassification?: string;
}

export interface ChatMessage {
  id: string;
  sender: "client" | " Larissa Szynski (CSM)";
  text: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventName: string;
  category: string;
  action: "added" | "updated" | "deleted";
  itemName: string;
  details: string;
}
