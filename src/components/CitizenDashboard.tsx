import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Announcement, HistoryItem } from "../types";
import {
  Home,
  Trophy,
  History,
  User,
  Menu,
  Check,
  RefreshCw,
  Clock,
  LogOut,
  Sparkles,
  Award,
  ChevronLeft,
  X,
  Volume2,
  Copy,
  Plus
} from "lucide-react";

import { updateMemberPointsInSupabase, logChoreHistoryToSupabase } from "../lib/supabaseService";

interface CitizenDashboardProps {
  roomName: string;
  roomCode: string;
  userDb: UserProfile[];
  setUserDb: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  announcements: Announcement[];
  historyList: HistoryItem[];
  setHistoryList: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  activeBroadcast: string | null;
  setActiveBroadcast: (msg: string | null) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  triggerToast: (msg: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
  currentTurnUserEmail: string;
  setCurrentTurnUserEmail: (email: string) => void;
  isSkippedToday: boolean;
  setIsSkippedToday: (val: boolean) => void;
  syncAllData?: () => Promise<void>;
  isSyncing?: boolean;
}

export default function CitizenDashboard({
  roomName,
  roomCode,
  userDb,
  setUserDb,
  announcements,
  historyList,
  setHistoryList,
  activeBroadcast,
  setActiveBroadcast,
  currentUser,
  onLogout,
  triggerToast,
  setIsSidebarOpen,
  currentTurnUserEmail,
  setCurrentTurnUserEmail,
  isSkippedToday,
  setIsSkippedToday,
  syncAllData,
  isSyncing = false,
}: CitizenDashboardProps) {
  const [activeBottomTab, setActiveBottomTab] = useState(0);

  // Get active user details
  const myProfile = userDb.find((u) => u.email.toLowerCase() === currentUser.email.toLowerCase()) || currentUser;

  // Find whose turn it is
  const citizenUsers = userDb.filter((u) => u.role === "Citizen");
  const currentChoreUser = citizenUsers.find((u) => u.email.toLowerCase() === currentTurnUserEmail.toLowerCase()) || citizenUsers[0];

  const isMyTurn = currentChoreUser?.email.toLowerCase() === myProfile.email.toLowerCase();

  // Find next citizen in queue
  const getNextCitizenEmail = () => {
    if (citizenUsers.length <= 1) return currentTurnUserEmail;
    const currentIndex = citizenUsers.findIndex((u) => u.email.toLowerCase() === currentTurnUserEmail.toLowerCase());
    const nextIndex = (currentIndex + 1) % citizenUsers.length;
    return citizenUsers[nextIndex].email;
  };

  // Chore actions
  const handleCompleteChore = async () => {
    if (!isMyTurn) return;

    // Award +25 points and increment completed count
    const resPoints = await updateMemberPointsInSupabase(myProfile.email, 25);

    if (resPoints !== null) {
      // Log to history in Supabase
      await logChoreHistoryToSupabase(
        myProfile.name,
        myProfile.email,
        "نظافت زباله‌ها و جاروی هفتگی سوئیت را با موفقیت انجام داد. (۲۵+ امتیاز)",
        "chore"
      );

      // Advance turn and reset skip
      const nextEmail = getNextCitizenEmail();
      setCurrentTurnUserEmail(nextEmail);
      localStorage.setItem("sabkhooneh_turn_email", nextEmail);
      setIsSkippedToday(false);
      localStorage.setItem("sabkhooneh_skipped_today", "false");

      triggerToast("🎉 خسته نباشید! کار نظافت ثبت شد و ۲۵ امتیاز دریافت کردید.");
      if (syncAllData) await syncAllData();
    } else {
      triggerToast("❌ خطایی رخ داد. فعالیت نظافت شما در پایگاه داده ثبت نشد.");
    }
  };

  const handleTransferChore = async () => {
    if (!isMyTurn) return;

    // Advance turn to next user
    const nextEmail = getNextCitizenEmail();
    setCurrentTurnUserEmail(nextEmail);
    localStorage.setItem("sabkhooneh_turn_email", nextEmail);
    setIsSkippedToday(false);
    localStorage.setItem("sabkhooneh_skipped_today", "false");

    const nextUser = citizenUsers.find((u) => u.email.toLowerCase() === nextEmail.toLowerCase());

    // Log to history in Supabase
    await logChoreHistoryToSupabase(
      myProfile.name,
      myProfile.email,
      `نوبت نظافت خود را به هم‌اتاقی دیگر (${nextUser ? nextUser.name : "بعدی"}) واگذار کرد.`,
      "chore"
    );

    triggerToast(`🔄 نوبت نظافت شما به هم‌اتاقی بعدی انتقال یافت.`);
    if (syncAllData) await syncAllData();
  };

  const handleNotNeededToday = async () => {
    if (!isMyTurn) return;

    // Marks today as skipped but retains queue position!
    setIsSkippedToday(true);
    localStorage.setItem("sabkhooneh_skipped_today", "true");

    // Log to history in Supabase
    await logChoreHistoryToSupabase(
      myProfile.name,
      myProfile.email,
      "امروز نظافت سوئیت را نیاز نداشت و نوبت نظافت وی محفوظ ماند.",
      "chore"
    );

    triggerToast("✨ کار نظافت امروز لغو شد؛ نوبت شما برای مرتبه بعدی کماکان محفوظ ماند.");
    if (syncAllData) await syncAllData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast("📋 کد سوئیت کپی شد!");
  };

  // Sort roommates for Leaderboard
  const sortedLeaderboard = [...userDb].sort((a, b) => b.points - a.points);
  const topThree = sortedLeaderboard.slice(0, 3);
  const remainingRoommates = sortedLeaderboard.slice(3);

  // Stats calculation
  const totalPoints = userDb.reduce((sum, u) => sum + u.points, 0);
  const averagePoints = Math.round(totalPoints / userDb.length);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 text-slate-800">
      
      {/* HEADER TOP BAR */}
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
            title="بروزرسانی داده‌ها"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-sm font-black text-slate-900 tracking-tight">{roomName}</h2>
          <span className="text-[9px] font-bold text-slate-400 block mt-0.5 font-sans">شنبه ۱۴ تیر ۱۴۰۵</span>
        </div>

        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 shrink-0 text-xs">
          {myProfile.name.charAt(0)}
        </div>
      </header>

      {/* CORE WRAPPER */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ACTIVE BROADCAST BANNER */}
        <AnimatePresence>
          {activeBroadcast && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500 text-white rounded-2xl p-3.5 shadow-sm border border-amber-600/20 relative overflow-hidden text-right shrink-0"
            >
              <div className="flex items-start gap-2.5">
                <Volume2 className="w-5 h-5 mt-0.5 shrink-0 text-white animate-bounce" />
                <div className="flex-1 space-y-0.5 pr-1">
                  <span className="text-[9px] font-black uppercase tracking-wider block text-amber-100">اعلان اضطراری شهردار سوئیت:</span>
                  <p className="text-[10.5px] font-black leading-relaxed text-white">{activeBroadcast}</p>
                </div>
                <button
                  onClick={() => setActiveBroadcast(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* TAB 0: HOME */}
          {activeBottomTab === 0 && (
            <motion.div
              key="citizen-home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Chore turn indicator */}
              <div className="bg-indigo-600 text-white rounded-3xl p-5 shadow-sm space-y-4 text-right">
                <div>
                  <span className="text-[9px] font-bold text-indigo-200/90 block uppercase tracking-widest">مسئولیت نظافت زباله و سوئیت:</span>
                  <h3 className="text-base font-black mt-1">
                    {isMyTurn ? "🎯 امروز نوبت شماست!" : `🧑‍🎓 نوبت ${currentChoreUser ? currentChoreUser.name : "هم‌اتاقی شما"}`}
                  </h3>
                  {isSkippedToday && (
                    <span className="inline-flex mt-1.5 px-2.5 py-0.5 bg-amber-500/30 border border-amber-400/20 rounded-md text-[8.5px] font-black text-amber-200 animate-pulse">
                      ⚠️ نوبت شما به علت اعلام «امروز نیاز نیست» برای دفعه بعد محفوظ ماند.
                    </span>
                  )}
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-[11px] font-black leading-relaxed">
                    🗑️ بیرون بردن کیسه‌های زباله سوئیت تفکیکی و 🧹 جاروی کامل سالن پذیرایی و راهروی جلو ورودی
                  </p>
                </div>

                {isMyTurn && !isSkippedToday && (
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={handleCompleteChore}
                      className="w-full py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 text-[10.5px] font-black rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>ثبت نوبت انجام شد (+۲۵ امتیاز)</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleTransferChore}
                        className="py-2.5 bg-indigo-700/80 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl transition-all border border-indigo-500/20 cursor-pointer"
                      >
                        انتقال نوبت به هم‌اتاقی بعدی
                      </button>
                      <button
                        onClick={handleNotNeededToday}
                        className="py-2.5 bg-amber-500/80 hover:bg-amber-500 text-white text-[10px] font-black rounded-xl transition-all border border-amber-400/20 cursor-pointer"
                      >
                        امروز نیاز نیست (حفظ نوبت)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics Widgets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-3xs text-right">
                  <span className="text-[9px] font-bold text-slate-400 block">امتیاز مسئولیت شما</span>
                  <span className="text-xl font-black text-slate-900 font-sans mt-1.5 block">{myProfile.points}</span>
                  <span className="text-[8.5px] text-indigo-600 font-bold block mt-1">میانگین سوئیت: {averagePoints}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-3xs text-right">
                  <span className="text-[9px] font-bold text-slate-400 block">آمارهای انفرادی</span>
                  <span className="text-xs font-black text-slate-900 mt-1.5 block">✓ {myProfile.completedCount} نظافت موفق</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-1">🔄 {myProfile.transferCount} انتقال نوبت</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 1: LEADERBOARD */}
          {activeBottomTab === 1 && (
            <motion.div
              key="citizen-leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xs font-black text-slate-950 pr-1 flex items-center gap-1.5 text-right">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>رده‌بندی مسئولیت‌پذیری هم‌اتاقی‌ها</span>
              </h3>

              {/* Podium display */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-md flex justify-around items-end pt-8 pb-4 text-center">
                {/* 2nd place */}
                {topThree[1] && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">🥈</span>
                    <span className="text-[10px] font-black text-slate-200 block truncate max-w-[70px]">{topThree[1].name.split(" ")[0]}</span>
                    <div className="bg-slate-800/80 w-12 h-14 rounded-t-xl flex flex-col justify-center items-center mt-1 border border-slate-700/50">
                      <span className="text-[9px] font-bold text-slate-400">دوم</span>
                      <span className="text-[10px] font-black text-indigo-400 mt-1">{topThree[1].points}</span>
                    </div>
                  </div>
                )}

                {/* 1st place */}
                {topThree[0] && (
                  <div className="flex flex-col items-center gap-1 -translate-y-2">
                    <span className="text-2xl animate-bounce">👑</span>
                    <span className="text-xs font-black text-white block truncate max-w-[80px]">{topThree[0].name.split(" ")[0]}</span>
                    <div className="bg-indigo-600/80 w-14 h-20 rounded-t-xl flex flex-col justify-center items-center mt-1 border border-indigo-500/50 shadow-lg">
                      <span className="text-[9px] font-black text-indigo-200">اول</span>
                      <span className="text-[11px] font-black text-white mt-1">{topThree[0].points}</span>
                    </div>
                  </div>
                )}

                {/* 3rd place */}
                {topThree[2] && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">🥉</span>
                    <span className="text-[10px] font-black text-slate-200 block truncate max-w-[70px]">{topThree[2].name.split(" ")[0]}</span>
                    <div className="bg-slate-800/80 w-12 h-10 rounded-t-xl flex flex-col justify-center items-center mt-1 border border-slate-700/50">
                      <span className="text-[9px] font-bold text-slate-400">سوم</span>
                      <span className="text-[10px] font-black text-indigo-400 mt-1">{topThree[2].points}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scrollable list of roommates */}
              <div className="space-y-2">
                {remainingRoommates.map((user, idx) => (
                  <div key={user.email} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-right">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-slate-400">#{idx + 4}</span>
                      <div>
                        <span className="text-xs font-black text-slate-900">{user.name}</span>
                        <span className="text-[8.5px] text-slate-400 font-bold block mt-0.5">{user.role === "Mayor" ? "👑 شهردار سوئیت" : "هم‌اتاقی"}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{user.points} امتیاز</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 2: HISTORY */}
          {activeBottomTab === 2 && (
            <motion.div
              key="citizen-history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xs font-black text-slate-950 pr-1 flex items-center gap-1.5 text-right">
                <History className="w-4 h-4 text-indigo-600" />
                <span>تاریخچه اقدامات اخیر سوئیت</span>
              </h3>

              <div className="space-y-2">
                {historyList.map((log) => (
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
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: PROFILE */}
          {activeBottomTab === 3 && (
            <motion.div
              key="citizen-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Profile Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center font-black text-indigo-700 text-xl mx-auto shadow-sm">
                  {myProfile.name.charAt(0)}
                </div>
                
                <div>
                  <h3 className="text-sm font-black text-slate-900">{myProfile.name}</h3>
                  <span className="text-[9px] text-indigo-600 font-bold block mt-1">{myProfile.role === "Mayor" ? "👑 شهردار سوئیت" : "🧑‍🎓 هم‌اتاقی سوئیت"}</span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">آدرس ایمیل:</span>
                    <span className="text-slate-800 font-sans">{myProfile.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">کد اختصاصی اتاق:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-800 font-sans uppercase font-black">{roomCode}</span>
                      <button
                        onClick={() => copyToClipboard(roomCode)}
                        className="p-1 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">نام سوئیت فعال:</span>
                    <span className="text-slate-800">{roomName}</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black rounded-xl border border-rose-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از حساب صابخونه</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER BAR (4 TABS) */}
      <footer className="bg-white border-t border-slate-200 flex py-2 px-2 justify-around items-center shrink-0 z-10 shadow-md">
        {[
          { label: "خانه", icon: Home },
          { label: "امتیازات", icon: Trophy },
          { label: "تاریخچه", icon: History },
          { label: "پروفایل", icon: User }
        ].map((tab, idx) => {
          const IconComponent = tab.icon;
          const isActive = activeBottomTab === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                setActiveBottomTab(idx);
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
