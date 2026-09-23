import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, generateRoomCode } from "../types";
import { Key, Mail, ShieldAlert, Sparkles, User, Home, ArrowRight, Check } from "lucide-react";
import {
  sendLoginOtp,
  verifyLoginOtp,
  signupMayorInSupabase,
  signupCitizenInSupabase
} from "../lib/supabaseService";

interface LoginScreenProps {
  userDb: UserProfile[];
  setUserDb: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  onLoginSuccess: (user: UserProfile) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  roomName: string;
  setRoomName: (name: string) => void;
  triggerToast: (msg: string) => void;
  syncAllData?: () => Promise<void>;
}

export default function LoginScreen({
  userDb,
  setUserDb,
  onLoginSuccess,
  roomCode,
  setRoomCode,
  roomName,
  setRoomName,
  triggerToast,
  syncAllData,
}: LoginScreenProps) {
  const [activeForm, setActiveForm] = useState<"login" | "signup-mayor" | "signup-citizen">("login");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Signup fields
  const [signupMayorName, setSignupMayorName] = useState("");
  const [signupMayorEmail, setSignupMayorEmail] = useState("");
  const [signupMayorSuite, setSignupMayorSuite] = useState("");

  const [signupCitizenName, setSignupCitizenName] = useState("");
  const [signupCitizenEmail, setSignupCitizenEmail] = useState("");
  const [signupCitizenCode, setSignupCitizenCode] = useState("");


  // Handle email submit for OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      triggerToast("⚠️ لطفاً آدرس ایمیل خود را وارد کنید.");
      return;
    }

    const { success, message } = await sendLoginOtp(email);
    triggerToast(message);
    if (success) {
      setOtpSent(true);
    }
  };

  // OTP Digits Handling
  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next box
    if (val && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Verify OTP Code
  useEffect(() => {
    const codeStr = otpDigits.join("");
    if (codeStr.length === 4) {
      const verify = async () => {
        const loggedUser = await verifyLoginOtp(email, codeStr);
        if (loggedUser) {
          triggerToast(`✅ خوش آمدید، ${loggedUser.name}!`);
          if (syncAllData) await syncAllData();
          onLoginSuccess(loggedUser);
        } else {
          triggerToast("❌ کد تایید نادرست است یا حساب شما هنوز ثبت‌نام نشده است.");
          setOtpDigits(["", "", "", ""]);
          otpRefs[0].current?.focus();
        }
      };
      verify();
    }
  }, [otpDigits]);

  // Mayor Signup
  const handleMayorSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupMayorName.trim() || !signupMayorEmail.trim() || !signupMayorSuite.trim()) {
      triggerToast("⚠️ لطفا تمام فیلدها را پر کنید.");
      return;
    }

    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setRoomName(signupMayorSuite.trim());

    let newMayorProfile: UserProfile;
    try {
      newMayorProfile = await signupMayorInSupabase(
        signupMayorName,
        signupMayorEmail,
        signupMayorSuite,
        newCode
      );
    } catch {
      triggerToast("❌ ثبت‌نام امن شهردار انجام نشد. تنظیمات Supabase را بررسی کنید.");
      return;
    }

    const updatedDb = [...userDb, newMayorProfile];
    setUserDb(updatedDb);
    localStorage.setItem("sabkhooneh_users", JSON.stringify(updatedDb));
    localStorage.setItem("sabkhooneh_room_code", newCode);
    localStorage.setItem("sabkhooneh_room_name", signupMayorSuite.trim());

    if (syncAllData) await syncAllData();
    onLoginSuccess(newMayorProfile);
  };

  // Citizen Signup
  const handleCitizenSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupCitizenName.trim() || !signupCitizenEmail.trim() || !signupCitizenCode.trim()) {
      triggerToast("⚠️ لطفا تمام فیلدها را پر کنید.");
      return;
    }

    const targetCode = signupCitizenCode.trim().toUpperCase();

    // Register Citizen in Supabase, which verifies their whitelisted email
    const res = await signupCitizenInSupabase(
      signupCitizenName,
      signupCitizenEmail,
      targetCode
    );

    triggerToast(res.message);

    if (res.success && res.user) {
      const updatedDb = [...userDb, res.user];
      setUserDb(updatedDb);
      localStorage.setItem("sabkhooneh_users", JSON.stringify(updatedDb));
      if (syncAllData) await syncAllData();
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-10 overflow-y-auto bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white relative">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* App Header Branding */}
      <div className="text-center z-10 mb-8">
        <div className="inline-flex p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-inner mb-3">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-100">سامانه دانشجویی صابخونه</h1>
        <p className="text-[10px] font-bold text-indigo-200/80 mt-1.5 uppercase tracking-wider">سیستم توزیع عادلانه کارهای خوابگاه و کسر امتیاز</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-2xl z-10 space-y-5">
        
        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => { setActiveForm("login"); setOtpSent(false); }}
            className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all ${
              activeForm === "login" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            ورود با ایمیل
          </button>
          <button
            onClick={() => setActiveForm("signup-mayor")}
            className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all ${
              activeForm === "signup-mayor" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            ثبت‌نام شهردار
          </button>
          <button
            onClick={() => setActiveForm("signup-citizen")}
            className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all ${
              activeForm === "signup-citizen" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            ثبت‌نام هم‌اتاقی
          </button>
        </div>

        {/* 1. LOGIN FORM */}
        {activeForm === "login" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-[10px] font-black text-slate-300 pr-1 block">آدرس ایمیل دانشجویی</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@sabkhooneh.ir..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-bold text-white text-left focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>دریافت کد ۴ رقمی تایید</span>
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="text-center space-y-1.5">
                  <div className="text-[10.5px] text-indigo-300 font-bold">کد تایید ۴ رقمی به ایمیل شما ارسال شد.</div>
                  <div className="text-[9.5px] text-slate-400 font-bold font-sans">{email}</div>
                </div>

                {/* 4-digit verification box */}
                <div className="flex gap-2.5 justify-center ltr-grid">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl text-center font-black text-lg text-indigo-400 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => { setOtpSent(false); setOtpDigits(["", "", "", ""]); }}
                    className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>تغییر آدرس ایمیل</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 2. SIGNUP MAYOR */}
        {activeForm === "signup-mayor" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleMayorSignupSubmit} className="space-y-3 text-right">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 pr-1 block">نام و نام خانوادگی شهردار</label>
                <input
                  type="text"
                  required
                  value={signupMayorName}
                  onChange={(e) => setSignupMayorName(e.target.value)}
                  placeholder="مثال: امیررضا علوی"
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 pr-1 block">آدرس ایمیل</label>
                <input
                  type="email"
                  required
                  value={signupMayorEmail}
                  onChange={(e) => setSignupMayorEmail(e.target.value)}
                  placeholder="alavi@sabkhooneh.ir..."
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-bold text-white text-left focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 pr-1 block">نام سوئیت / شماره اتاق</label>
                <input
                  type="text"
                  required
                  value={signupMayorSuite}
                  onChange={(e) => setSignupMayorSuite(e.target.value)}
                  placeholder="مثال: اتاق ۴۰۲"
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer"
              >
                ایجاد سوئیت و ثبت‌نام شهردار
              </button>
            </form>
          </motion.div>
        )}

        {/* 3. SIGNUP CITIZEN */}
        {activeForm === "signup-citizen" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleCitizenSignupSubmit} className="space-y-3 text-right">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 pr-1 block">نام کاربری دلخواه (هم‌اتاقی)</label>
                <input
                  type="text"
                  required
                  value={signupCitizenName}
                  onChange={(e) => setSignupCitizenName(e.target.value)}
                  placeholder="مثال: محمد دلیری"
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 pr-1 block">آدرس ایمیل</label>
                <input
                  type="email"
                  required
                  value={signupCitizenEmail}
                  onChange={(e) => setSignupCitizenEmail(e.target.value)}
                  placeholder="mahdi@sabkhooneh.ir..."
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-bold text-white text-left focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-300 pr-1 block">کد اختصاصی اتاق (دریافت از شهردار)</label>
                <input
                  type="text"
                  required
                  value={signupCitizenCode}
                  onChange={(e) => setSignupCitizenCode(e.target.value)}
                  placeholder="مثال: SAB402..."
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-black text-white text-center focus:outline-none focus:border-indigo-500 transition-all uppercase tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer"
              >
                ثبت‌نام و عضویت در سوئیت
              </button>
            </form>
          </motion.div>
        )}

      </div>

    </div>
  );
}
