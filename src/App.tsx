import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserProfile,
  Announcement,
  CartableRequest,
  HistoryItem,
  DEFAULT_USERS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_REQUESTS,
  DEFAULT_HISTORY
} from "./types";
import LoginScreen from "./components/LoginScreen";
import MayorPanel from "./components/MayorPanel";
import CitizenDashboard from "./components/CitizenDashboard";
import Modals from "./components/Modals";
import { X, ChevronLeft, GraduationCap, Copy, ArrowRight, RefreshCw } from "lucide-react";
import {
  fetchUsersFromSupabase,
  fetchAnnouncementsFromSupabase,
  fetchCartableRequestsFromSupabase,
  fetchHistoryFromSupabase
} from "./lib/supabaseService";

export default function App() {
  // --- 1. CORE APPLICATION STATES ---
  const [userDb, setUserDb] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem("sabkhooneh_users");
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("sabkhooneh_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [roomName, setRoomName] = useState<string>(() => {
    return localStorage.getItem("sabkhooneh_room_name") || "اتاق ۴۰۲";
  });

  const [roomCode, setRoomCode] = useState<string>(() => {
    return localStorage.getItem("sabkhooneh_room_code") || "SAB402";
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem("sabkhooneh_announcements");
    return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENTS;
  });

  const [cartableRequests, setCartableRequests] = useState<CartableRequest[]>(() => {
    const saved = localStorage.getItem("sabkhooneh_requests");
    return saved ? JSON.parse(saved) : DEFAULT_REQUESTS;
  });

  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("sabkhooneh_history");
    return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
  });

  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(() => {
    return localStorage.getItem("sabkhooneh_active_broadcast") || "هم‌اتاقی‌های عزیز، لطفاً نسبت به تخلیه سطل‌های تفکیک زباله تا امشب اقدام نمایید. با تشکر.";
  });

  const [currentTurnUserEmail, setCurrentTurnUserEmail] = useState<string>(() => {
    return localStorage.getItem("sabkhooneh_turn_email") || "mahdi@sabkhooneh.ir";
  });

  const [isSkippedToday, setIsSkippedToday] = useState<boolean>(() => {
    return localStorage.getItem("sabkhooneh_skipped_today") === "true";
  });

  // Role control for dashboard toggle
  const [activeRoleView, setActiveRoleView] = useState<"Mayor" | "Citizen">("Citizen");

  // --- SUPABASE ACTIVE SYNCHRONIZATION ---
  const [isSyncing, setIsSyncing] = useState(false);

  const syncAllData = async () => {
    setIsSyncing(true);
    try {
      const [fetchedUsers, fetchedAnnouncements, fetchedRequests, fetchedHistory] = await Promise.all([
        fetchUsersFromSupabase(roomCode),
        fetchAnnouncementsFromSupabase(roomCode),
        fetchCartableRequestsFromSupabase(roomCode),
        fetchHistoryFromSupabase(roomCode),
      ]);

      if (fetchedUsers && fetchedUsers.length > 0) {
        setUserDb(fetchedUsers);
        localStorage.setItem("sabkhooneh_users", JSON.stringify(fetchedUsers));
      }
      if (fetchedAnnouncements && fetchedAnnouncements.length > 0) {
        setAnnouncements(fetchedAnnouncements);
        localStorage.setItem("sabkhooneh_announcements", JSON.stringify(fetchedAnnouncements));
        const active = fetchedAnnouncements[0]?.text;
        if (active) {
          setActiveBroadcast(active);
          localStorage.setItem("sabkhooneh_active_broadcast", active);
        }
      }
      if (fetchedRequests && fetchedRequests.length > 0) {
        setCartableRequests(fetchedRequests);
        localStorage.setItem("sabkhooneh_requests", JSON.stringify(fetchedRequests));
      }
      if (fetchedHistory && fetchedHistory.length > 0) {
        setHistoryList(fetchedHistory);
        localStorage.setItem("sabkhooneh_history", JSON.stringify(fetchedHistory));
      }
    } catch (err) {
      console.warn("Active Sync fetch error, using local fallback state:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Perform initial active sync
    syncAllData();

    // Auto-sync every 15 seconds so changes are pushed seamlessly
    const interval = setInterval(syncAllData, 15000);
    return () => clearInterval(interval);
  }, [roomCode]);

  // --- 2. DRAWER & MODALS NAVIGATION STATES ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isExtraTaskModalOpen, setIsExtraTaskModalOpen] = useState(false);

  // --- 3. TOAST FEEDBACK STATE ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Sync role view when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setActiveRoleView(currentUser.role);
    }
  }, [currentUser]);

  // --- 4. AUTHENTICATION HANDLERS ---
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem("sabkhooneh_current_user", JSON.stringify(user));
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sabkhooneh_current_user");
    setIsSidebarOpen(false);
    triggerToast("👋 با موفقیت از حساب کاربری خود خارج شدید.");
  };

  const handleSwitchToMayorPanel = () => {
    if (!currentUser) return;
    setIsSidebarOpen(false);

    if (currentUser.role === "Mayor") {
      setActiveRoleView("Mayor");
      triggerToast("👑 وارد پنل مدیریتی شهردار سوئیت شدید.");
    } else {
      triggerToast("⚠️ دسترسی غیرمجاز! بخش شهردار فقط مختص حساب‌های با نقش شهردار است.");
    }
  };

  const handleSwitchToCitizenPanel = () => {
    setIsSidebarOpen(false);
    setActiveRoleView("Citizen");
    triggerToast("🧑‍🎓 به نمای عادی هم‌اتاقی‌ها بازگشتید.");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast("📋 کد سوئیت کپی شد!");
  };

  return (
    <div className="w-full h-screen bg-slate-100 text-slate-800 font-sans rtl-grid flex justify-center items-center overflow-hidden">
      
      {/* Mobile viewport simulator with direct fullscreen on actual mobile */}
      <div id="sabkhooneh-app-container" className="w-full h-full max-w-md bg-slate-50 flex flex-col overflow-hidden relative shadow-2xl border-x border-slate-200/40">
        
        {/* --- DYNAMIC ROUTING PANEL BASED ON SESSION STATE --- */}
        {!currentUser ? (
          <LoginScreen
            userDb={userDb}
            setUserDb={setUserDb}
            onLoginSuccess={handleLoginSuccess}
            roomCode={roomCode}
            setRoomCode={setRoomCode}
            roomName={roomName}
            setRoomName={setRoomName}
            triggerToast={triggerToast}
            syncAllData={syncAllData}
          />
        ) : activeRoleView === "Mayor" ? (
          <MayorPanel
            roomName={roomName}
            setRoomName={setRoomName}
            roomCode={roomCode}
            userDb={userDb}
            setUserDb={setUserDb}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            cartableRequests={cartableRequests}
            setCartableRequests={setCartableRequests}
            historyList={historyList}
            setHistoryList={setHistoryList}
            activeBroadcast={activeBroadcast}
            setActiveBroadcast={setActiveBroadcast}
            currentUser={currentUser}
            onLogout={handleLogout}
            triggerToast={triggerToast}
            setIsSidebarOpen={setIsSidebarOpen}
            syncAllData={syncAllData}
            isSyncing={isSyncing}
          />
        ) : (
          <CitizenDashboard
            roomName={roomName}
            roomCode={roomCode}
            userDb={userDb}
            setUserDb={setUserDb}
            announcements={announcements}
            historyList={historyList}
            setHistoryList={setHistoryList}
            activeBroadcast={activeBroadcast}
            setActiveBroadcast={setActiveBroadcast}
            currentUser={currentUser}
            onLogout={handleLogout}
            triggerToast={triggerToast}
            setIsSidebarOpen={setIsSidebarOpen}
            currentTurnUserEmail={currentTurnUserEmail}
            setCurrentTurnUserEmail={setCurrentTurnUserEmail}
            isSkippedToday={isSkippedToday}
            setIsSkippedToday={setIsSkippedToday}
            syncAllData={syncAllData}
            isSyncing={isSyncing}
          />
        )}

        {/* --- GLOBAL HAMBURGER DRAWER MENU (SLIDES FROM RIGHT) --- */}
        <AnimatePresence>
          {isSidebarOpen && currentUser && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-slate-950 z-40 cursor-pointer"
              />

              {/* Sidebar content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="absolute top-0 right-0 bottom-0 w-[78%] bg-white border-l border-slate-200 z-50 flex flex-col justify-between p-5 shadow-2xl text-right"
              >
                <div>
                  {/* Title Header */}
                  <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 mb-5">
                    <span className="text-xs font-black text-indigo-700">منوی خدمات صابخونه</span>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Profile section */}
                  <div className="bg-slate-50 rounded-2xl p-4 text-right mb-5 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">کاربر فعلی سامانه:</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs shrink-0">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">{currentUser.name}</div>
                        <div className="text-[9px] text-slate-400 font-bold font-sans mt-0.5 truncate">{currentUser.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-1.5">
                    {activeRoleView === "Citizen" ? (
                      <>
                        <button
                          onClick={() => {
                            setIsSidebarOpen(false);
                            setIsTravelModalOpen(true);
                          }}
                          className="w-full text-right px-3 py-3 text-xs font-black text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
                        >
                          <span className="text-base shrink-0">✈️</span>
                          <span>تنظیمات مرخصی سفر</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsSidebarOpen(false);
                            setIsExtraTaskModalOpen(true);
                          }}
                          className="w-full text-right px-3 py-3 text-xs font-black text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
                        >
                          <span className="text-base shrink-0">🚨</span>
                          <span>درخواست کار اضافه داوطلبانه</span>
                        </button>

                        <div className="h-px bg-slate-100 my-4" />

                        {/* Mayor panel entry (Locked for standard citizens, active for actual mayors!) */}
                        <button
                          onClick={handleSwitchToMayorPanel}
                          className={`w-full text-right px-3.5 py-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer shadow-xs group ${
                            currentUser.role === "Mayor"
                              ? "bg-purple-50 hover:bg-purple-100 border-purple-100"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-100 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 text-right min-w-0">
                            <span className="text-lg text-purple-600 group-hover:scale-110 transition-transform shrink-0">👤</span>
                            <div className="min-w-0">
                              <span className="text-xs font-black text-purple-700 block truncate">ورود به پنل مدیریت شهردار</span>
                              <span className="text-[9px] text-purple-400 font-bold block mt-0.5 truncate">
                                {currentUser.role === "Mayor" ? "مدیریت اعضا، امتیازات و کارتابل" : "🔒 مخصوص نقش شهردار سوئیت"}
                              </span>
                            </div>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-purple-500 shrink-0" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-3.5 py-2.5 text-[9px] text-indigo-700 font-black bg-indigo-50 rounded-xl mb-4 text-right leading-relaxed">
                          شما با دسترسی مدیریت شهردار وارد شده‌اید. می‌توانید برای مشاهده کارهای شخصی خود، به نمای هم‌اتاقی‌ها بازگردید.
                        </div>
                        
                        <button
                          onClick={handleSwitchToCitizenPanel}
                          className="w-full text-right px-3.5 py-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-2xl transition-all flex items-center justify-between cursor-pointer shadow-xs group"
                        >
                          <div className="flex items-center gap-2.5 text-right min-w-0">
                            <GraduationCap className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-black text-indigo-700 block truncate">بازگشت به نمای عادی هم‌اتاقی‌ها</span>
                              <span className="text-[9px] text-indigo-400 font-bold block mt-0.5 truncate">تائید انجام وظیفه، امتیازات و سفر</span>
                            </div>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-indigo-500 shrink-0" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Drawer Footer info */}
                <div className="pt-3 border-t border-slate-100 text-[9px] text-slate-400 text-center font-bold">
                  سامانه مدیریت خوابگاه صابخونه • ۱۴۰۵
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- OVERLAY MODALS REGISTRY --- */}
        {currentUser && (
          <Modals
            isTravelModalOpen={isTravelModalOpen}
            setIsTravelModalOpen={setIsTravelModalOpen}
            isExtraTaskModalOpen={isExtraTaskModalOpen}
            setIsExtraTaskModalOpen={setIsExtraTaskModalOpen}
            currentUser={currentUser}
            cartableRequests={cartableRequests}
            setCartableRequests={setCartableRequests}
            historyList={historyList}
            setHistoryList={setHistoryList}
            triggerToast={triggerToast}
            syncAllData={syncAllData}
          />
        )}

        {/* --- ANIMATED TOAST NOTIFICATIONS (BOTTOM-LEFT IN CONTAINER) --- */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-16 left-4 right-4 bg-slate-900/95 text-white border border-slate-800 rounded-2xl p-3 shadow-lg z-50 text-right text-[10px] font-black leading-relaxed flex items-center justify-between gap-2.5 backdrop-blur-md"
            >
              <span>{toastMessage}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
