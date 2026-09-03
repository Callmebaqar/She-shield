// SheShield configurable safety constants (Pakistan-focused by default).
// These are returned via the /api/config endpoint so the frontend stays in sync.

export const EMERGENCY_NUMBERS = [
  { label: 'Emergency Rescue (Rescue 1122)', number: '1122', type: 'phone' },
  { label: 'Police (Pakistan)', number: '15', type: 'phone' },
  { label: 'Women Helpline (Madadgar 1098)', number: '1098', type: 'phone' },
  { label: 'FIA Cyber Crime Reporting', number: '991', type: 'phone' },
  { label: 'Tourist Police / General Emergency', number: '112', type: 'phone' },
  { label: 'PTA Cyber Complaints Helpline', number: '0800-95913', type: 'phone' },
];

// WhatsApp number the Emergency/Report buttons open a chat with (country code, no '+')
export const WHATSAPP_NUMBER = '1122';

export const REPORT_CATEGORIES = [
  { value: 'UNSAFE_AREA', label: 'Unsafe Area' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity' },
  { value: 'ROAD_TRAVEL_SAFETY', label: 'Road / Travel Safety' },
  { value: 'OTHER', label: 'Other' },
];

export const REPORT_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];
export const ALERT_TYPES = ['SOS', 'PANIC', 'HELP', 'SAFE'] as const;
