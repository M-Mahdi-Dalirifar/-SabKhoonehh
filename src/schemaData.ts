export interface UserDoc {
  username: string; // نام کاربری کاربر
  email: string; // آدرس ایمیل کاربر
  points: number; // امتیازات
  role: "Mayor" | "Citizen"; // نقش کاربر (شهردار یا شهروند)
}

export interface RoomDoc {
  room_number: string; // شماره اتاق / آپارتمان
  invited_emails: string[]; // ایمیل‌های دعوت شده
  garbage_days: number; // بازه زمانی بیرون بردن زباله (روز)
  vacuum_days: number; // بازه زمانی جاروبرقی کشیدن (روز)
}

export interface RotationQueueDoc {
  room_number: string; // شماره اتاق مربوطه
  task_type: "garbage" | "vacuum"; // نوع کار نوبتی
  sequence: string[]; // ترتیب دستی اعضا بر اساس ایمیل
  current_turn_index: number; // شاخص عضو دارای نوبت فعلی
  owed_turns: Record<string, number>; // نوبت‌های طلبکار یا بدهکار هر کاربر (ایمیل -> عدد)
}

export interface TravelModeDoc {
  email: string; // ایمیل کاربر متقاضی مرخصی
  from_date: string; // تاریخ شروع عدم حضور به تقویم جلالی (شمسی)
  to_date: string; // تاریخ پایان عدم حضور به تقویم جلالی (شمسی)
  status: "pending" | "approved" | "rejected"; // وضعیت مرخصی
}

export interface CartableDoc {
  id: string; // شناسه یکتای درخواست
  request_type: "task_completion" | "travel_request" | "extra_task_request"; // نوع درخواست
  requester_email: string; // ایمیل ثبت‌کننده درخواست
  details: {
    task_type?: "garbage" | "vacuum";
    completion_date?: string; // تاریخ شمسی تکمیل کار
    from_date?: string; // تاریخ شمسی شروع سفر
    to_date?: string; // تاریخ شمسی پایان سفر
    reason?: string; // علت درخواست کار اضافی یا جزئیات
    points_requested?: number; // امتیاز پیشنهادی برای کار اضافی
  };
  status: "pending" | "approved" | "rejected"; // وضعیت بررسی درخواست
  created_at: string; // تاریخ شمسی ایجاد درخواست
}

// Google Sheets columns mapping model
export interface GoogleSheetsColumnMapping {
  column: string;
  field_path: string;
  persian_header: string;
  english_header: string;
  description_fa: string;
}

export const usersCollectionSchema = {
  name: "users",
  descriptionFa: "اطلاعات هویتی، امتیازات انباشته‌شده و نقش هر یک از هم‌خانه‌ها در ساختمان.",
  fields: [
    { name: "username", type: "string", descriptionFa: "نام و نام خانوادگی کاربر به فارسی برای نمایش در برنامه" },
    { name: "email", type: "string (PK)", descriptionFa: "شناسه یکتای کاربر و آدرس ایمیل رسمی جهت احراز هویت و دعوت" },
    { name: "points", type: "number", descriptionFa: "مجموع امتیازهای مثبت کسب‌شده بابت انجام به موقع وظایف" },
    { name: "role", type: "'Mayor' | 'Citizen'", descriptionFa: "نقش کاربر؛ شهردار (Mayor) مدیریت اتاق و تاییدها را دارد و شهروند (Citizen) وظایف را انجام می‌دهد" }
  ]
};

export const roomsCollectionSchema = {
  name: "rooms",
  descriptionFa: "پیکربندی اصلی خانه اشتراکی، دوره‌های زمانی تکرار کارهای خانه و اعضای دعوت شده.",
  fields: [
    { name: "room_number", type: "string (PK)", descriptionFa: "شماره منحصر‌به‌فرد آپارتمان یا اتاق مشترک" },
    { name: "invited_emails", type: "array<string>", descriptionFa: "لیست ایمیل هم‌خانه‌هایی که مجاز به عضویت در این اتاق هستند" },
    { name: "garbage_days", type: "number", descriptionFa: "فاصله زمانی استاندارد برای بیرون بردن زباله‌ها (مثلا هر ۲ روز یکبار)" },
    { name: "vacuum_days", type: "number", descriptionFa: "فاصله زمانی استاندارد برای جاروبرقی کشیدن کل ساختمان (مثلا هر ۷ روز یکبار)" }
  ]
};

export const rotationQueuesCollectionSchema = {
  name: "rotation_queues",
  descriptionFa: "مدیریت صف نوبت کارهای روتین خانه. ترتیب اعضا را مشخص کرده و نوبت فعلی را ردیابی می‌کند.",
  fields: [
    { name: "room_number", type: "string", descriptionFa: "شماره اتاق متصل به این صف" },
    { name: "task_type", type: "'garbage' | 'vacuum'", descriptionFa: "نوع کار روتین که این صف برای آن ایجاد شده است" },
    { name: "sequence", type: "array<string>", descriptionFa: "ترتیب اولویت دستی تعیین‌شده توسط شهردار (آرایه‌ای از ایمیل‌ها)" },
    { name: "current_turn_index", type: "number", descriptionFa: "شاخص (Index) شخصی که در حال حاضر نوبت اوست در آرایه sequence" },
    { name: "owed_turns", type: "map<string, number>", descriptionFa: "نگاشت ایمیل کاربر به عدد؛ ثبت نوبت‌های طلبکار یا بدهکار به دلیل جابجایی یا مرخصی" }
  ]
};

export const travelModesCollectionSchema = {
  name: "travel_modes",
  descriptionFa: "دوران غیبت موقت (مرخصی) اعضا به تاریخ جلالی. در این دوران، نوبت کاربر به طور هوشمند رد می‌شود.",
  fields: [
    { name: "email", type: "string", descriptionFa: "ایمیل کاربر متقاضی مرخصی" },
    { name: "from_date", type: "string (Jalali)", descriptionFa: "تاریخ شروع غیبت به تقویم جلالی (مثال: '۱۴۰۵/۰۴/۱۵')" },
    { name: "to_date", type: "string (Jalali)", descriptionFa: "تاریخ پایان غیبت به تقویم جلالی (مثال: '۱۴۰۵/۰۴/۲۲')" },
    { name: "status", type: "'pending' | 'approved' | 'rejected'", descriptionFa: "وضعیت تایید مرخصی توسط شهردار ساختمان" }
  ]
};

export const cartablesCollectionSchema = {
  name: "cartable",
  descriptionFa: "درخواست‌های نیازمند بررسی شهردار. شامل گزارش انجام کار، درخواست مرخصی و پیشنهاد کار اضافی است.",
  fields: [
    { name: "id", type: "string (PK)", descriptionFa: "شناسه ردیابی منحصر‌به‌فرد درخواست" },
    { name: "request_type", type: "'task_completion' | 'travel_request' | 'extra_task_request'", descriptionFa: "نوع درخواست ارسالی توسط شهروند" },
    { name: "requester_email", type: "string", descriptionFa: "ایمیل شهروندی که این درخواست را ثبت کرده است" },
    { name: "details", type: "map", descriptionFa: "فیلدهای متغیر بر اساس نوع درخواست (مانند نوع فعالیت، تاریخ مرخصی یا امتیاز پیشنهادی)" },
    { name: "status", type: "'pending' | 'approved' | 'rejected'", descriptionFa: "وضعیت بررسی؛ پس از تایید (approved) اثر آن در صف نوبت اعمال می‌شود" },
    { name: "created_at", type: "string (Jalali)", descriptionFa: "تاریخ دقیق ایجاد درخواست به شمسی" }
  ]
};

// Spreadsheet integration mapping
export const googleSheetsSyncMapping: GoogleSheetsColumnMapping[] = [
  { column: "A", field_path: "created_at", persian_header: "تاریخ ثبت", english_header: "Timestamp", description_fa: "زمان تایید و نهایی شدن فعالیت در سامانه" },
  { column: "B", field_path: "requester_email", persian_header: "ایمیل انجام‌دهنده", english_header: "Operator Email", description_fa: "کاربری که وظیفه را به دوش داشته است" },
  { column: "C", field_path: "request_type", persian_header: "نوع رویداد", english_header: "Event Type", description_fa: "گزارش انجام کار، مرخصی مصوب، یا فعالیت فوق‌العاده" },
  { column: "D", field_path: "details.task_type", persian_header: "شرح فعالیت", english_header: "Task Description", description_fa: "نوع کار خانگی انجام شده (زباله / جاروبرقی)" },
  { column: "E", field_path: "status", persian_header: "وضعیت تایید", english_header: "Approval Status", description_fa: "همواره Approved برای رویدادهای همگام‌سازی شده" },
  { column: "F", field_path: "points_rewarded", persian_header: "امتیاز مکتسبه", english_header: "Points Awarded", description_fa: "امتیاز اختصاص یافته به کاربر بابت این اقدام" }
];

// Seed (initial mock) state representing a fully functional Persian house share "تهران‌پارس"
export const initialUsers: UserDoc[] = [
  { username: "محمد احمدی (شهردار)", email: "mohammad@sabkhooneh.ir", points: 150, role: "Mayor" },
  { username: "علی رضایی", email: "ali@sabkhooneh.ir", points: 80, role: "Citizen" },
  { username: "سارا امیری", email: "sara@sabkhooneh.ir", points: 120, role: "Citizen" },
  { username: "مهدی دلیری", email: "mahdi@sabkhooneh.ir", points: 95, role: "Citizen" }
];

export const initialRooms: RoomDoc[] = [
  { room_number: "۱۰۴", invited_emails: ["mohammad@sabkhooneh.ir", "ali@sabkhooneh.ir", "sara@sabkhooneh.ir", "mahdi@sabkhooneh.ir"], garbage_days: 2, vacuum_days: 7 }
];

export const initialQueues: RotationQueueDoc[] = [
  {
    room_number: "۱۰۴",
    task_type: "garbage",
    sequence: ["mohammad@sabkhooneh.ir", "ali@sabkhooneh.ir", "sara@sabkhooneh.ir", "mahdi@sabkhooneh.ir"],
    current_turn_index: 1, // Currently Ali's turn
    owed_turns: { "mohammad@sabkhooneh.ir": 0, "ali@sabkhooneh.ir": 0, "sara@sabkhooneh.ir": 0, "mahdi@sabkhooneh.ir": 0 }
  },
  {
    room_number: "۱۰۴",
    task_type: "vacuum",
    sequence: ["ali@sabkhooneh.ir", "sara@sabkhooneh.ir", "mahdi@sabkhooneh.ir"], // Mayor is exempt from vacuuming
    current_turn_index: 0, // Currently Ali's turn
    owed_turns: { "ali@sabkhooneh.ir": 0, "sara@sabkhooneh.ir": 1, "mahdi@sabkhooneh.ir": -1 } // Sara owes one turn, Mahdi is +1
  }
];

export const initialTravelModes: TravelModeDoc[] = [
  { email: "sara@sabkhooneh.ir", from_date: "۱۴۰۵/۰۴/۱۵", to_date: "۱۴۰۵/۰۴/۲۲", status: "approved" },
  { email: "mahdi@sabkhooneh.ir", from_date: "۱۴۰۵/۰۵/۰۱", to_date: "۱۴۰۵/۰۵/۰۷", status: "pending" }
];

export const initialCartable: CartableDoc[] = [
  {
    id: "req_001",
    request_type: "task_completion",
    requester_email: "ali@sabkhooneh.ir",
    details: { task_type: "garbage", completion_date: "۱۴۰۵/۰۴/۱۲" },
    status: "pending",
    created_at: "۱۴۰۵/۰۴/۱۲"
  },
  {
    id: "req_002",
    request_type: "travel_request",
    requester_email: "mahdi@sabkhooneh.ir",
    details: { from_date: "۱۴۰۵/۰۵/۰۱", to_date: "۱۴۰۵/۰۵/۰۷", reason: "سفر کاری به اصفهان" },
    status: "pending",
    created_at: "۱۴۰۵/۰۴/۱۰"
  },
  {
    id: "req_003",
    request_type: "extra_task_request",
    requester_email: "sara@sabkhooneh.ir",
    details: { reason: "تمیزکاری شیشه‌های سالن اصلی خارج از نوبت", points_requested: 30 },
    status: "pending",
    created_at: "۱۴۰۵/۰۴/۱۱"
  }
];

// Initial Sheets Log synchronized data
export interface SheetsRow {
  rowId: number;
  created_at: string;
  requester_email: string;
  request_type: string;
  details: string;
  status: string;
  points_rewarded: number;
}

export const initialSheetsLog: SheetsRow[] = [
  {
    rowId: 1,
    created_at: "۱۴۰۵/۰۴/۰۱",
    requester_email: "mohammad@sabkhooneh.ir",
    request_type: "انجام وظیفه",
    details: "بیرون بردن زباله (garbage)",
    status: "تایید شده",
    points_rewarded: 10
  },
  {
    rowId: 2,
    created_at: "۱۴۰۵/۰۴/۰۵",
    requester_email: "sara@sabkhooneh.ir",
    request_type: "انجام وظیفه",
    details: "جاروبرقی کل آپارتمان (vacuum)",
    status: "تایید شده",
    points_rewarded: 25
  },
  {
    rowId: 3,
    created_at: "۱۴۰۵/۰۴/۰۸",
    requester_email: "ali@sabkhooneh.ir",
    request_type: "انجام وظیفه فوق‌العاده",
    details: "خرید مایع ظرفشویی مشترک",
    status: "تایید شده",
    points_rewarded: 15
  }
];
