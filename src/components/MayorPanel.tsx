import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Announcement, CartableRequest, HistoryItem } from "../types";
import {
  Inbox,
  Bell,
  Award,
  History,
  Edit2,
  Check,
  UserPlus,
  Trash2,
  Copy,
  Plus,
  Minus,
  Menu,
  X,
  Volume2,
  Megaphone,
  UserCheck,
  LogOut,
  ChevronLeft,
  RefreshCw
} from "lucide-react";
import {
  addRoommateToWhitelist,
  updateMemberPointsInSupabase,
  logChoreHistoryToSupabase,
  updateRequestStatusInSupabase,
  createAnnouncementInSupabase,
  deleteAnnouncementFromSupabase
} from "../lib/supabaseService";

interface MayorPanelProps {
  roomName: string;
  setRoomName: (name: string) => void;
  roomCode: string;
  userDb: UserProfile[];
  setUserDb: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  cartableRequests: CartableRequest[];
  setCartableRequests: React.Dispatch<React.SetStateAction<CartableRequest[]>>;
  historyList: HistoryItem[];
  setHistoryList: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  activeBroadcast: string | null;
  setActiveBroadcast: (msg: string | null) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  triggerToast: (msg: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
  syncAllData?: () => Promise<void>;
  isSyncing?: boolean;
}

export default function MayorPanel({
  roomName,
  setRoomName,
  roomCode,
  userDb,
  setUserDb,
  announcements,
  setAnnouncements,
  cartableRequests,
  setCartableRequests,
  historyList,
  setHistoryList,
  activeBroadcast,
  setActiveBroadcast,
  currentUser,
  onLogout,
  triggerToast,
  setIsSidebarOpen,
  syncAllData,
  isSyncing = false,
}: MayorPanelProps) {
  const [activeMayorTab, setActiveMayorTab] = useState(0); // Opens directly to "کارتابل" (Tab index 0)
  
  // Suite renaming states
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const [tempRoomName, setTempRoomName] = useState(roomName);

  // Broadcast & Announcement states
  const [inputAnnouncement, setInputAnnouncement] = useState("");

  // Whitelist/Member recruit states
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // Filter logs states
  const [selectedHistoryFilter, setSelectedHistoryFilter] = useState("all");

  const saveRoomName = () => {
    if (!tempRoomName.trim()) {
      triggerToast("⚠️ نام سوئیت نمی‌تواند خالی باشد.");
      return;
    }
    setRoomName(tempRoomName.trim());
    setIsEditingRoomName(false);
    localStorage.setItem("sabkhooneh_room_name", tempRoomName.trim());
    triggerToast(`✏️ نام سوئیت با موفقیت به "${tempRoomName.trim()}" تغییر یافت.`);
  };

  // Cartable actions
  const handleApproveRequest = async (reqId: string) => {
    const request = cartableRequests.find((r) => r.id === reqId);
    if (!request) return;

    // A. Update Request status in Supabase
    await updateRequestStatusInSupabase(reqId, "approved", roomCode);

    // B. If extra task, award +15 points
    if (request.type === "extra_task") {
      await updateMemberPointsInSupabase(request.email, 15);
    }

    // C. Add to history log
    const actionDesc = request.type === "extra_task" 
      ? "فعالیت داوطلبانه اضافه را انجام داد و ۱۵+ امتیاز دریافت کرد." 
      : "درخواست مرخصی/سفر وی تایید شد.";
    
    await logChoreHistoryToSupabase(request.name, request.email, actionDesc, request.type, roomCode);

    triggerToast(`✅ درخواست "${request.name}" تایید شد.`);
    if (syncAllData) await syncAllData();
  };

  const handleRejectRequest = async (reqId: string) => {
    const request = cartableRequests.find((r) => r.id === reqId);
    if (!request) return;

    await updateRequestStatusInSupabase(reqId, "rejected", roomCode);

    triggerToast(`❌ درخواست "${request.name}" رد شد.`);
    if (syncAllData) await syncAllData();
  };

  // Broadcast & Announcement actions
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnnouncement.trim()) return;

    const success = await createAnnouncementInSupabase(
      inputAnnouncement.trim(),
      currentUser.name,
      roomCode
    );

    if (success) {
      setActiveBroadcast(inputAnnouncement.trim());
      setInputAnnouncement("");
      triggerToast("📢 پیام اطلاعیه صادر و به عنوان بنر همگانی فعال شد!");
      if (syncAllData) await syncAllData();
    } else {
      triggerToast("❌ خطایی رخ داد. پیام اطلاعیه با موفقیت ثبت نشد.");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const deletedText = announcements.find((a) => a.id === id)?.text;
    const success = await deleteAnnouncementFromSupabase(id, roomCode);

    if (success) {
      if (deletedText === activeBroadcast) {
        setActiveBroadcast(null);
      }
      triggerToast("🗑️ اطلاعیه حذف شد.");
      if (syncAllData) await syncAllData();
    } else {
      triggerToast("❌ خطایی در حذف اطلاعیه پیش آمد.");
    }
  };

  // Recruit Member Directly (Whitelist)
  const handleAddNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    // Whitelist in Supabase
    const success = await addRoommateToWhitelist(
      newMemberEmail.trim(),
      newMemberName.trim(),
      roomCode
    );

    if (success) {
      await logChoreHistoryToSupabase(
        newMemberName.trim(),
        newMemberEmail.trim(),
        "توسط شهردار به صورت مستقیم به هم‌اتاقی‌ها اضافه شد (لیست سفید).",
        "system",
        roomCode
      );

      setNewMemberName("");
      setNewMemberEmail("");
      triggerToast(`👤 هم‌اتاقی جدید "${newMemberName.trim()}" به لیست اضافه شد. حالا او می‌تواند ثبت‌نام کند.`);
      if (syncAllData) await syncAllData();
    } else {
      triggerToast("❌ خطا در افزودن هم‌اتاقی به لیست سفید.");
    }
  };

  // Points adjustments
  const adjustMemberPoints = async (userEmail: string, value: number) => {
    const targetUser = userDb.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
    if (!targetUser) return;

    const resPoints = await updateMemberPointsInSupabase(userEmail, value);

    if (resPoints !== null) {
      await logChoreHistoryToSupabase(
        targetUser.name,
        userEmail,
        `توسط شهردار دستکاری امتیاز شد (${value > 0 ? "+" : ""}${value} امتیاز)`,
        "points",
        roomCode
      );

      triggerToast(`🎯 امتیاز هم‌اتاقی ${targetUser.name} بروزرسانی شد (${value > 0 ? "+" : ""}${value}).`);
      if (syncAllData) await syncAllData();
    } else {
      triggerToast("❌ خطا در ویرایش امتیاز در پایگاه داده.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast("📋 کد اختصاصی اتاق کپی شد!");
  };

  const citizensOnly = userDb.filter((u) => u.role === "Citizen");

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 text-slate-800">
      
      {/* TOP NAVBAR */}
      <header className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          <button
            onClick={() => syncAllData && syncAllData()}
            className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors cursor-pointer"
            title="بروزرسانی از پایگاه داده"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>

        {/* Dynamic Suite Name Header with inline Pencil Edit Icon */}
        <div className="flex-1 flex items-center justify-center gap-1.5 px-3">
          {isEditingRoomName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempRoomName}
                onChange={(e) => setTempRoomName(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-0.5 text-xs text-right text-slate-800 focus:outline-none focus:border-indigo-500 font-black"
                maxLength={20}
                autoFocus
              />
              <button
                onClick={saveRoomName}
                className="p-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">{roomName}</h2>
              <button
                onClick={() => { setTempRoomName(roomName); setIsEditingRoomName(true); }}
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                title="ویرایش نام سوئیت"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 shrink-0">👑 پنل شهردار</span>
      </header>

      {/* CORE WRAPPER */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        
        <AnimatePresence mode="wait">
          {/* TAB 0: CARTABLE */}
          {activeMayorTab === 0 && (
            <motion.div
              key="mayor-cartable"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pr-1">
                <h3 className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                  <Inbox className="w-4 h-4 text-indigo-600" />
                  <span>کارتابل درخواست‌های تایید نوبت</span>
                </h3>
                <span className="text-[9px] font-bold text-slate-400">بررسی درخواست هم‌اتاقی‌ها</span>
              </div>

              {cartableRequests.filter((r) => r.status === "pending").length === 0 ? (
                <div className="text-center p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-2">
                  <span className="text-2xl block">🎉</span>
                  <p className="text-xs text-slate-500 font-bold">هیچ درخواستی در صف انتظار وجود ندارد.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cartableRequests
                    .filter((r) => r.status === "pending")
                    .map((req) => (
                      <div key={req.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3 text-right">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{req.name}</span>
                            <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full ${
                              req.type === "travel" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-purple-50 text-purple-700 border border-purple-100"
                            }`}>
                              {req.type === "travel" ? "✈️ مرخصی سفر" : "🚨 کار داوطلبانه اضافه"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold mt-1.5 leading-relaxed">{req.details}</p>
                          <span className="text-[8.5px] text-slate-400 font-bold block mt-1">تاریخ ثبت: {req.date}</span>
                        </div>

                        <div className="flex gap-2 border-t border-slate-100 pt-2.5">
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                          >
                            تایید و ثبت امتیاز
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black rounded-xl transition-all cursor-pointer active:scale-98"
                          >
                            رد درخواست
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 1: BROADCAST & ANNOUNCEMENTS */}
          {activeMayorTab === 1 && (
            <motion.div
              key="mayor-broadcast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pr-1">
                <h3 className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-indigo-600" />
                  <span>پیام همگانی و اعلان شهردار</span>
                </h3>
              </div>

              {/* Form to Post Broadcast */}
              <form onSubmit={handlePostAnnouncement} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-right">
                <label className="text-[10px] font-black text-slate-700 block">متن اعلان جدید (نمایش مستقیم بالای داشبورد هم‌اتاقی‌ها):</label>
                <textarea
                  required
                  value={inputAnnouncement}
                  onChange={(e) => setInputAnnouncement(e.target.value)}
                  placeholder="مثال: نوبت‌های نظافت هفته جاری همگی تایید شدند. لطفا فردا راس ساعت..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-right focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl shadow-sm transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>انتشار فوری بنر اطلاعیه سوئیت</span>
                </button>
              </form>

              {/* List of active announcements */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 pr-1">📋 اطلاعیه‌های صادر شده</h4>
                <div className="space-y-2">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-3xs flex items-start justify-between gap-3 text-right">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-black">منتشرکننده: {ann.author}</span>
                          <span className="text-[8px] text-slate-400 font-black">{ann.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{ann.text}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: MEMBERS & POINT ADJUSTMENTS */}
          {activeMayorTab === 2 && (
            <motion.div
              key="mayor-members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Unique Room Code banner */}
              <div className="bg-indigo-600 text-white rounded-3xl p-4 shadow-xs flex items-center justify-between text-right">
                <div>
                  <span className="text-[9px] font-bold block opacity-80 uppercase tracking-widest">کد اختصاصی این سوئیت (جهت عضویت هم‌اتاقی‌ها):</span>
                  <span className="text-base font-black tracking-widest uppercase mt-1 block font-sans">{roomCode}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(roomCode)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
                  title="کپی کردن کد اتاق"
                >
                  <Copy className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Whitelist Recruit Form */}
              <form onSubmit={handleAddNewMember} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-right">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>ثبت عضو (هم‌اتاقی) جدید در لیست سفید</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="نام هم‌اتاقی..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-800 text-right focus:outline-none focus:border-indigo-400"
                  />
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="آدرس ایمیل..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-800 text-right focus:outline-none focus:border-indigo-400 font-sans"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  عضویت مستقیم هم‌اتاقی بدون تایید بعدی
                </button>
              </form>

              {/* List of Roommates with +/- 10 points adjustment */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 pr-1">مدیریت دستی امتیاز هم‌اتاقی‌ها</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                  {citizensOnly.length === 0 ? (
                    <div className="text-center p-6 bg-white border border-slate-200 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-bold">هیچ هم‌اتاقی‌ای هنوز ثبت‌نام نکرده است.</p>
                    </div>
                  ) : (
                    citizensOnly.map((item) => (
                      <div key={item.email} className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-right">
                        <div>
                          <div className="text-xs font-black text-slate-900">{item.name}</div>
                          <div className="text-[10px] text-indigo-600 font-bold mt-1">{item.points} امتیاز • {item.email}</div>
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => adjustMemberPoints(item.email, 10)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-black rounded-lg border border-emerald-100 transition-all cursor-pointer active:scale-90 flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>۱۰+</span>
                          </button>
                          <button
                            onClick={() => adjustMemberPoints(item.email, -10)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black rounded-lg border border-rose-100 transition-all cursor-pointer active:scale-90 flex items-center gap-0.5"
                          >
                            <Minus className="w-3 h-3" />
                            <span>۱۰-</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: COMPREHENSIVE HISTORY */}
          {activeMayorTab === 3 && (
            <motion.div
              key="mayor-history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h4 className="text-xs font-black text-slate-900 pr-1">📋 تاریخچه جامع کل سوئیت</h4>

              {/* Roommate filter feeds */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start select-none">
                <button
                  onClick={() => setSelectedHistoryFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black shrink-0 transition-all cursor-pointer ${
                    selectedHistoryFilter === "all"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  همه اعضا
                </button>
                {userDb.map((r) => (
                  <button
                    key={r.email}
                    onClick={() => setSelectedHistoryFilter(r.name)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black shrink-0 transition-all cursor-pointer ${
                      selectedHistoryFilter === r.name
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {r.name.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Log Event Feed */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
                {historyList.filter((log) => selectedHistoryFilter === "all" || log.name.includes(selectedHistoryFilter)).length === 0 ? (
                  <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold">هیچ فعالیتی برای این فیلتر ثبت نشده است.</p>
                  </div>
                ) : (
                  historyList
                    .filter((log) => selectedHistoryFilter === "all" || log.name.includes(selectedHistoryFilter))
                    .map((log) => (
                      <div key={log.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center text-right shadow-3xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm shrink-0">
                            {log.type === "travel" ? "✈️" : log.type === "extra_task" ? "🚨" : log.type === "system" ? "👤" : "✓"}
                          </span>
                          <div>
                            <div className="text-xs font-black text-slate-900">{log.name}</div>
                            <div className="text-[10px] text-slate-500 font-bold mt-1">{log.action}</div>
                          </div>
                        </div>
                        <span className="text-[9px] text-indigo-600 font-black shrink-0 bg-indigo-50 px-2 py-0.5 rounded-md">{log.date}</span>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER BAR (4 TABS) */}
      <footer className="bg-white border-t border-slate-200 flex py-2 px-2 justify-around items-center shrink-0 z-10 shadow-md">
        {[
          { label: "کارتابل", icon: Inbox },
          { label: "اعلان", icon: Bell },
          { label: "اعضا و امتیازات", icon: Award },
          { label: "تاریخچه جامع", icon: History }
        ].map((tab, idx) => {
          const IconComponent = tab.icon;
          const isActive = activeMayorTab === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                setActiveMayorTab(idx);
                triggerToast(`تب "${tab.label}" فعال شد.`);
              }}
              className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <IconComponent className={`w-5 h-5 mb-0.5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className="text-[9px] font-black tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </footer>

    </div>
  );
}
