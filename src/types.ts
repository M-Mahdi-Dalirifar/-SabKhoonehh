export interface UserProfile {
  email: string;
  name: string;
  role: "Mayor" | "Citizen";
  suiteCode: string;
  points: number;
  completedCount: number;
  transferCount: number;
}

export interface Announcement {
  id: string;
  text: string;
  date: string;
  author: string;
}

export interface CartableRequest {
  id: string;
  name: string;
  email: string;
  type: "travel" | "extra_task";
  details: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

export interface HistoryItem {
  id: string;
  name: string;
  action: string;
  type: "chore" | "travel" | "extra_task" | "system" | "points";
  date: string;
}

export const DEFAULT_USERS: UserProfile[] = [];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [];

export const DEFAULT_REQUESTS: CartableRequest[] = [];

export const DEFAULT_HISTORY: HistoryItem[] = [];

export function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "SAB";
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getTodayJalaliDate(): string {
  // Simple Jalali date representation for academic year 1405
  return "شنبه ۱۴ تیر ۱۴۰۵";
}
