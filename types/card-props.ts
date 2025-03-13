// Card Props section here
export type PriceCardProps = {
  label: string;
  description: string;
  price: string;
  priceSuffix: string;
  points: string[];
  href: string;
  popular?: boolean;
  isSelected: boolean;
  onClick: () => void;
};

export type ProgressCardProps = {
  steps: string[];
  currentStep?: number;
  onStepChange?: (event: { step: number }) => void;
};

export type ScheduleCardProps = {
  title: string;
  description: string;
  imageSrc: string;
};

export type StatusCardProps = {
  steps: string[];
  currentStep: number;
};

// UI Component Prop section here
export type DropdownFilter = {
  items: string[];
  direction?: "up" | "down";
  placeholder?: string;
  selectedItems: string[];
  onChange: (selected: string[]) => void;
};

export type MapProps = {
  apiKey: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onStateChange?: (state: {
    center: google.maps.LatLngLiteral;
    zoom: number;
  }) => void;
};

// Weather Prop section here
export type Coordinates = {
  lat?: number;
  lon?: number;
  fahrenheit: boolean;
};

// Layout component Props

export type DataFormProps = {
  view: string;
  onClose: () => void;
  onSubmit?: (values: Record<string, string>) => void;
  formTitle?: string;
};

// Left sidebar
export type SidebarProps = {
  isOpen: boolean;
  userId?: string;
  onSectionChange?: (section: string) => void;
};

// Notification Props
type Notification = {
  title: string;
  description: string;
};

export type NotificationBarProps = {
  notifications: Notification[];
  isOpen: boolean;
  closeNotificationBar: () => void;
  userId: string;
};

export type NavbarProps = {
  imageSrc?: string;
  userId: string;
};

// Modal Props
export type OTPModalProps = {
  isOpen: boolean;
  email: string;
  onValidate: (otp: string) => void;
  onClose: () => void;
};
