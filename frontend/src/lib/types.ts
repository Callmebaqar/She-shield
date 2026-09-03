export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone?: string | null;
  physicalDescription?: string | null;
  profilePhoto?: string | null;
  emailVerified: boolean;
  isActive?: boolean;
  createdAt?: string;
  _count?: { emergencyAlerts?: number; safetyReports?: number };
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation?: string | null;
  isPrimary: boolean;
}

export interface EmergencyAlert {
  id: string;
  status: string;
  alertType: string;
  message?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  activatedAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}

export interface SafetyReport {
  id: string;
  category: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  occurredAt?: string | null;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface EmergencyNumber {
  label: string;
  number: string;
  type: string;
}

export interface AppConfig {
  appName: string;
  emergencyNumbers: EmergencyNumber[];
  whatsappNumber: string;
  reportCategories: { value: string; label: string }[];
  alertTypes: string[];
}

export interface LocationUpdate {
  id: string;
  alertId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  activeAlerts: number;
  totalReports: number;
  pendingReports: number;
  recentActivity: {
    id: string;
    action: string;
    createdAt: string;
    user?: { name: string; email: string } | null;
  }[];
}
