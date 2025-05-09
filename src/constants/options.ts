export const GENDER = ["Male", "Female", "Other"];
export const YESNO = ["Yes", "No"];
export const LANGUAGES = ["English", "Hindi", "Assamese"];
import { TimeFormatOption } from "@/contexts/UserPreferencesContext";
export const TIME_FORMAT: TimeFormatOption[] = ["12-hour", "24-hour"];

export const UNITS = [
  // Crops & Produce
  "kilograms (kg)",
  "grams (g)",
  "quintal",
  "ton",
  "pounds (lbs)",
  "bushel",
  "bag",
  "crate",
  "box",
  "sack",
  "bale",
  "bundle",
  // Fertilizers, Pesticides, Chemicals
  "liter",
  "milliliter",
  "bottle",
  "can",
  "drum",
  "packet",
  // Seeds
  "tin",
  "sachet",
  // Tools & Equipment
  "unit",
  "set",
  "piece",
  "kit",
  "pair",
  // Safety Equipment
  "helmet",
  "goggle",
  "glove",
  "apron",
  // Water/Irrigation/Storage
  "gallon",
  "barrel",
  "tank",
  "roll",

  // Packaging Materials
  "carton",
  "strip",

  // General / Measurement
  "sheet",
  "dozen",
  "meter",
  "feet",
  "square meter",
  "hectare",
];

export const COMPANY_TYPES = ["Supplier", "Distributor", "Factories", "Buyer"];
export const CONTACT_TYPES = [
  "Regular Customer",
  "Wholesaler",
  "Industrial Unit",
  "Others",
];

export const CONTRACT_STATUS = [
  "Drafting",
  "Review & Discussion",
  "Approved",
  "Signed",
  "Amendments",
  "Terminated",
];

export const PAYMENT_STATUS = ["Pending", "Paid", "Overdue", "Cancelled"];

export const PAGINATION_ITEMS = ["25 per page", "50 per page", "100 per page"];

export const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
