import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CartableRequest, HistoryItem, UserProfile } from "../types";
import { X } from "lucide-react";
import { createRequestInSupabase } from "../lib/supabaseService";

interface ModalsProps {
  isTravelModalOpen: boolean;
  setIsTravelModalOpen: (open: boolean) => void;
  isExtraTaskModalOpen: boolean;
  setIsExtraTaskModalOpen: (open: boolean) => void;
  currentUser: UserProfile;
  cartableRequests: CartableRequest[];
  setCartableRequests: React.Dispatch<React.SetStateAction<CartableRequest[]>>;
  historyList: HistoryItem[];
  setHistoryList: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  triggerToast: (msg: string) => void;
  syncAllData?: () => Promise<void>;
}

export default function Modals({
  isTravelModalOpen,
  setIsTravelModalOpen,
  isExtraTaskModalOpen,
  setIsExtraTaskModalOpen,
  currentUser,
  cartableRequests,
  setCartableRequests,
  historyList,
  setHistoryList,
  triggerToast,
  syncAllData,
}: ModalsProps) {
  
  // Travel inputs
  const [travelStartDate, setTravelStartDate] = useState("۱۴۰۵/۰۴/۱۵");
  const [travelEndDate, setTravelEndDate] = useState("۱۴۰۵/۰۴/۲۲");

  // Extra Task inputs
  const [selectedExtraTask, setSelectedExtraTask] = useState<"trash" | "vacuum">("trash");

  const handleSubmitTravelRequest = async () => {
    if (!travelStartDate.trim() || !travelEndDate.trim()) {
      triggerToast("⚠️ لطفاً بازه تاریخ مرخصی را وارد کنید.");
      return;
    }

    const newReq: CartableRequest = {
      id: "req-" + Date.now(),
      name: currentUser.name,
      email: currentUser.email,
      type: "travel",
      details: `درخواست مرخصی سفر از تاریخ ${travelStartDate.trim()} الی ${travelEndDate.trim()}`,
      status: "pending",
      date: "۱۴۰۵/۰۴/۰۴",
    };

    const success = await createRequestInSupabase(newReq);

    if (success) {
      setIsTravelModalOpen(false);
      triggerToast("📨 درخواست مرخصی سفر با موفقیت برای شهردار ارسال شد.");
      if (syncAllData) await syncAllData();
    } else {
      triggerToast("❌ خطا در ثبت درخواست در پایگاه داده.");
    }
  };

  const handleSubmitExtraTaskRequest = async () => {
    const taskTitle = selectedExtraTask === "trash" ? "خارج کردن زباله ساختمان" : "جاروی کل سوئیت";

    const newReq: CartableRequest = {
      id: "req-" + Date.now(),
      name: currentUser.name,
      email: currentUser.email,
      type: "extra_task",
      details: `درخواست داوطلبی کار اضافه: ${taskTitle}`,
      status: "pending",
      date: "۱۴۰۵/۰۴/۰۴",
    };

    const success = await createRequestInSupabase(newReq);

    if (success) {
      setIsExtraTaskModalOpen(false);
      triggerToast(`📨 درخواست داوطلبی برای "${taskTitle}" ارسال شد.`);
      if (syncAllData) await syncAllData();
    } else {
      triggerToast("❌ خطا در ثبت درخواست داوطلبی.");
    }
  };

  return (
    <>
      {/* 1. TRAVEL SETTINGS MODAL */}
      <AnimatePresence>
        {isTravelModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTravelModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 z-40 cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 z-50 text-right space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="text-base">✈️</span>
                  <span>تنظیمات مرخصی سفر</span>
                </span>
                <button
                  onClick={() => setIsTravelModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed">
                با ثبت مرخصی سفر، سیستم به صورت هوشمند نوبت‌های نظافت شما در بازه زمانی مورد نظر را به سایر اعضای سوئیت محول می‌کند تا جریمه نشوید.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-1">از تاریخ (شمسی)</label>
                  <input
                    type="text"
                    value={travelStartDate}
                    onChange={(e) => setTravelStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 text-center"
                    placeholder="۱۴۰۵/۰۴/۱۵"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-1">تا تاریخ (شمسی)</label>
                  <input
                    type="text"
                    value={travelEndDate}
                    onChange={(e) => setTravelEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 text-center"
                    placeholder="۱۴۰۵/۰۴/۲۲"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitTravelRequest}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer active:scale-98 shadow-sm"
              >
                ثبت و ارسال درخواست مرخصی
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. EXTRA TASK MODAL */}
      <AnimatePresence>
        {isExtraTaskModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExtraTaskModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 z-40 cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 z-50 text-right space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span className="text-base">🚨</span>
                  <span>درخواست کارهای داوطلبانه اضافه</span>
                </span>
                <button
                  onClick={() => setIsExtraTaskModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed">
                با انجام کار اضافه داوطلبانه می‌توانید امتیاز مسئولیت‌پذیری خود را افزایش داده و در صدر رده‌بندی سوئیت قرار بگیرید!
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedExtraTask("trash")}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    selectedExtraTask === "trash"
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-black"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                  }`}
                >
                  <span className="text-xl">🗑️</span>
                  <span className="text-[10px]">خارج کردن زباله ساختمان</span>
                  <span className="text-[8px] text-indigo-500 block mt-0.5">۱۵+ امتیاز مسئولیت</span>
                </button>

                <button
                  onClick={() => setSelectedExtraTask("vacuum")}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    selectedExtraTask === "vacuum"
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-black"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                  }`}
                >
                  <span className="text-xl">🧹</span>
                  <span className="text-[10px]">جاروی کل سوئیت</span>
                  <span className="text-[8px] text-indigo-500 block mt-0.5">۱۵+ امتیاز مسئولیت</span>
                </button>
              </div>

              <button
                onClick={handleSubmitExtraTaskRequest}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer active:scale-98 shadow-sm"
              >
                ثبت داوطلبی کار اضافه
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
