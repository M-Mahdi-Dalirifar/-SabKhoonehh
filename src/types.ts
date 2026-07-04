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

export const DEFAULT_USERS: UserProfile[] = [
  { email: "shahrdar@sabkhooneh.ir", name: "امیررضا علوی", role: "Mayor", suiteCode: "SAB402", points: 210, completedCount: 18, transferCount: 2 },
  { email: "alavi@sabkhooneh.ir", name: "امیررضا علوی", role: "Mayor", suiteCode: "SAB402", points: 210, completedCount: 18, transferCount: 2 },
  { email: "mahdi@sabkhooneh.ir", name: "محمد دلیری", role: "Citizen", suiteCode: "SAB402", points: 185, completedCount: 15, transferCount: 1 },
  { email: "hosseini@sabkhooneh.ir", name: "پوریا حسینی", role: "Citizen", suiteCode: "SAB402", points: 160, completedCount: 13, transferCount: 3 },
  { email: "bahrami@sabkhooneh.ir", name: "سهیل بهرامی", role: "Citizen", suiteCode: "SAB402", points: 145, completedCount: 11, transferCount: 4 },
  { email: "asadi@sabkhooneh.ir", name: "عرفان اسدی", role: "Citizen", suiteCode: "SAB402", points: 120, completedCount: 9, transferCount: 5 },
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: "1", text: "هم‌اتاقی‌های عزیز، لطفاً نسبت به تخلیه سطل‌های تفکیک زباله تا امشب اقدام نمایید. با تشکر.", date: "۱۴۰۵/۰۴/۰۲", author: "امیررضا علوی" },
  { id: "2", text: "جلسه ماهانه هماهنگی کارهای سوئیت روز دوشنبه ساعت ۲۰ در سالن مطالعه برگزار می‌شود.", date: "۱۴۰۵/۰۳/۲۸", author: "امیررضا علوی" },
];

export const DEFAULT_REQUESTS: CartableRequest[] = [
  { id: "req-1", name: "پوریا حسینی", email: "hosseini@sabkhooneh.ir", type: "travel", details: "مرخصی سفر از ۱۴۰۵/۰۴/۱۵ تا ۱۴۰۵/۰۴/۲۲", status: "pending", date: "۱۴۰۵/۰۴/۰۳" },
  { id: "req-2", name: "سهیل بهرامی", email: "bahrami@sabkhooneh.ir", type: "extra_task", details: "درخواست کار داوطلبانه اضافه: جاروی کل سوئیت", status: "pending", date: "۱۴۰۵/۰۴/۰۴" },
];

export const DEFAULT_HISTORY: HistoryItem[] = [
  { id: "h-1", name: "محمد دلیری", action: "نظافت زباله‌ها و راهرو را انجام داد و تایید شد.", type: "chore", date: "۱۴۰۵/۰۴/۰۳" },
  { id: "h-2", name: "عرفان اسدی", action: "نوبت نظافت خود را به پوریا حسینی انتقال داد.", type: "chore", date: "۱۴۰۵/۰۴/۰۲" },
  { id: "h-3", name: "امیررضا علوی", action: "به علت فعالیت داوطلبانه ۱۰ امتیاز به سهیل بهرامی اضافه کرد.", type: "points", date: "۱۴۰۵/۰۴/۰۱" },
];

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
