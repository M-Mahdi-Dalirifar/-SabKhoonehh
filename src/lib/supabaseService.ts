import { supabase } from "./supabaseClient";
import { UserProfile, Announcement, CartableRequest, HistoryItem } from "../types";

// =========================================================================
// HELPER FOR MAPPING USER
// =========================================================================
function mapUser(u: any, fallbackRoomCode: string): UserProfile {
  return {
    email: u.email,
    name: u.name || u.username || "کاربر بی‌نام",
    role: u.role || "Citizen",
    suiteCode: u.room_id || u.suiteCode || u.suite_code || fallbackRoomCode,
    points: typeof u.points === "number" ? u.points : 100,
    completedCount: typeof u.completedCount === "number" ? u.completedCount : (typeof u.completed_count === "number" ? u.completed_count : 0),
    transferCount: typeof u.transferCount === "number" ? u.transferCount : (typeof u.transfer_count === "number" ? u.transfer_count : 0),
  };
}

// =========================================================================
// 1. FETCH ALL DATA (Active Sync)
// =========================================================================
export async function fetchUsersFromSupabase(roomCode: string): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("room_id", roomCode.toUpperCase());
    
    if (error) throw error;
    if (!data) return [];

    // Filter by room code in JS to be safe and support different column names (room_id or suiteCode)
    return data.map((u: any) => mapUser(u, roomCode))
      .filter((u: UserProfile) => u.suiteCode?.toUpperCase() === roomCode.toUpperCase());
  } catch (err) {
    console.warn("Could not fetch users from Supabase, using mock fallback:", err);
    return [];
  }
}

export async function fetchAnnouncementsFromSupabase(roomCode: string): Promise<Announcement[]> {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("room_id", roomCode.toUpperCase())
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback if announcements table is structured differently
      const { data: altData, error: altError } = await supabase
        .from("announcement")
        .select("*");
      if (altError) throw altError;
      return (altData || []).map((a: any) => ({
        id: String(a.id),
        text: a.text || "",
        date: a.date || "۱۴۰۵/۰۴/۰۴",
        author: a.author || "شهردار",
      }));
    }

    return (data || []).map((a: any) => ({
      id: String(a.id),
      text: a.text || "",
      date: a.date || "۱۴۰۵/۰۴/۰۴",
      author: a.author || "شهردار",
    }));
  } catch (err) {
    console.warn("Could not fetch announcements from Supabase:", err);
    return [];
  }
}

export async function fetchCartableRequestsFromSupabase(roomCode: string): Promise<CartableRequest[]> {
  try {
    const { data, error } = await supabase
      .from("cartable_requests")
      .select("*")
      .eq("room_id", roomCode.toUpperCase())
      .order("created_at", { ascending: false });

    if (error) {
      const { data: altData, error: altError } = await supabase
        .from("cartable")
        .select("*");
      if (altError) throw altError;
      return (altData || []).map((r: any) => ({
        id: String(r.id),
        name: r.name || r.username || "هم‌اتاقی",
        email: r.email || r.requester_email || "",
        type: r.type || r.request_type || "travel",
        details: r.details || "درخواست",
        status: r.status || "pending",
        date: r.date || r.created_at || "۱۴۰۵/۰۴/۰۴",
      }));
    }

    return (data || []).map((r: any) => ({
      id: String(r.id),
      name: r.name || r.username || "هم‌اتاقی",
      email: r.email || r.requester_email || "",
      type: r.type || r.request_type || "travel",
      details: r.details || "درخواست",
      status: r.status || "pending",
      date: r.date || r.created_at || "۱۴۰۵/۰۴/۰۴",
    }));
  } catch (err) {
    console.warn("Could not fetch cartable requests:", err);
    return [];
  }
}

export async function fetchHistoryFromSupabase(roomCode: string): Promise<HistoryItem[]> {
  try {
    const { data, error } = await supabase
      .from("chores_history")
      .select("*")
      .eq("room_id", roomCode.toUpperCase())
      .order("created_at", { ascending: false });

    if (error) {
      const { data: altData, error: altError } = await supabase
        .from("history")
        .select("*");
      if (altError) throw altError;
      return (altData || []).map((h: any) => ({
        id: String(h.id),
        name: h.name || h.username || "کاربر",
        action: h.action || h.details || "",
        type: h.type || h.request_type || "chore",
        date: h.date || h.created_at || "۱۴۰۵/۰۴/۰۴",
      }));
    }

    return (data || []).map((h: any) => ({
      id: String(h.id),
      name: h.name || h.username || "کاربر",
      action: h.action || h.details || "",
      type: h.type || h.request_type || "chore",
      date: h.date || h.created_at || "۱۴۰۵/۰۴/۰۴",
    }));
  } catch (err) {
    console.warn("Could not fetch chores history:", err);
    return [];
  }
}

// =========================================================================
// 2. AUTHENTICATION (Login with OTP & Signup)
// =========================================================================

// Passwordless email login request
export async function sendLoginOtp(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Request a real passwordless OTP. Profile lookup happens only after the
    // email is verified, so RLS never needs to expose the users table publicly.
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false, // Don't signup new users on login
      }
    });

    if (error) return { success: false, message: "❌ ارسال کد تایید ناموفق بود. تنظیمات Supabase را بررسی کنید." };

    return { success: true, message: "📨 کد تایید واقعی به ایمیل شما فرستاده شد!" };
  } catch (err: any) {
    console.error("Login OTP error:", err);
    return { success: false, message: "❌ ارتباط با سرویس ورود برقرار نشد." };
  }
}

// Verify OTP
export async function verifyLoginOtp(email: string, code: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: "email",
    });

    if (error) throw error;

    // Fetch the profile associated with this user
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (user) {
      return mapUser(user, user.room_id || "SAB402");
    }
    return null;
  } catch (err) {
    console.error("OTP verification failed:", err);
    return null;
  }
}

// Signup Mayor
export async function signupMayorInSupabase(
  name: string,
  email: string,
  roomName: string,
  roomCode: string
): Promise<UserProfile> {
  const newMayor: UserProfile = {
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role: "Mayor",
    suiteCode: roomCode,
    points: 200,
    completedCount: 0,
    transferCount: 0,
  };

  try {
    // 1. Create or register room first
    const { error: roomErr } = await supabase
      .from("rooms")
      .upsert({
        room_id: roomCode,
        room_number: roomCode,
        room_name: roomName,
        invited_emails: [email.trim().toLowerCase()],
      }, { onConflict: "room_id" });

    if (roomErr) console.warn("Could not create room row, continuing:", roomErr);

    // 2. Insert Mayor user row
    const { error: userErr } = await supabase
      .from("users")
      .upsert({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        username: name.trim(),
        role: "Mayor",
        room_id: roomCode,
        suiteCode: roomCode,
        suite_code: roomCode,
        points: 200,
        completed_count: 0,
        completedCount: 0,
        transfer_count: 0,
        transferCount: 0,
      }, { onConflict: "email" });

    if (userErr) throw userErr;
  } catch (err) {
    console.error("Error signing up mayor:", err);
    throw new Error("Mayor signup could not be persisted securely.");
  }

  return newMayor;
}

// Signup Citizen
export async function signupCitizenInSupabase(
  name: string,
  email: string,
  roomCode: string
): Promise<{ success: boolean; user?: UserProfile; message: string }> {
  try {
    const formattedEmail = email.trim().toLowerCase();
    const targetRoomCode = roomCode.toUpperCase();

    // 1. Check Whitelist: See if roommate email is whitelisted for this roomCode
    // We check "whitelists", fallback to "whitelist", or fallback to "rooms.invited_emails"
    let isWhitelisted = false;

    try {
      const { data: whitelistRow } = await supabase
        .from("whitelists")
        .select("*")
        .eq("email", formattedEmail)
        .eq("room_id", targetRoomCode)
        .maybeSingle();
      if (whitelistRow) {
        isWhitelisted = true;
      }
    } catch (e) {
      console.warn("whitelists check failed, trying whitelist check:", e);
    }

    if (!isWhitelisted) {
      try {
        const { data: altWhitelistRow } = await supabase
          .from("whitelist")
          .select("*")
          .eq("email", formattedEmail)
          .eq("room_id", targetRoomCode)
          .maybeSingle();
        if (altWhitelistRow) {
          isWhitelisted = true;
        }
      } catch (e) {
        console.warn("whitelist alternative check failed:", e);
      }
    }

    if (!isWhitelisted) {
      try {
        const { data: roomRow } = await supabase
          .from("rooms")
          .select("invited_emails")
          .eq("room_id", targetRoomCode)
          .maybeSingle();

        if (roomRow && roomRow.invited_emails) {
          isWhitelisted = roomRow.invited_emails
            .map((e: string) => e.toLowerCase())
            .includes(formattedEmail);
        }
      } catch (e) {
        console.warn("rooms invited_emails check failed:", e);
      }
    }

    if (!isWhitelisted) {
      return {
        success: false,
        message: "❌ ایمیل شما در لیست سفید (دعوت‌نامه‌های) شهردار این سوئیت یافت نشد. لطفاً از شهردار بخواهید شما را دعوت کند.",
      };
    }

    // 2. Insert Citizen User Profile
    const newCitizen: UserProfile = {
      email: formattedEmail,
      name: name.trim(),
      role: "Citizen",
      suiteCode: targetRoomCode,
      points: 100,
      completedCount: 0,
      transferCount: 0,
    };

    // Resilient upsert/upsert emulation
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", formattedEmail)
      .maybeSingle();

    if (existingUser) {
      const { error: updateErr } = await supabase
        .from("users")
        .update({
          name: name.trim(),
          username: name.trim(),
          role: "Citizen",
          room_id: targetRoomCode,
          suiteCode: targetRoomCode,
          suite_code: targetRoomCode,
        })
        .eq("email", formattedEmail);

      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("users")
        .insert({
          email: formattedEmail,
          name: name.trim(),
          username: name.trim(),
          role: "Citizen",
          room_id: targetRoomCode,
          suiteCode: targetRoomCode,
          suite_code: targetRoomCode,
          points: 100,
          completed_count: 0,
          transfer_count: 0,
        });

      if (insertErr) throw insertErr;
    }

    return {
      success: true,
      user: newCitizen,
      message: `🎉 ثبت‌نام با موفقیت در پایگاه داده انجام شد! خوش آمدی، ${name}.`,
    };
  } catch (err: any) {
    console.error("Error signing up citizen:", err);
    return {
      success: false,
      message: "❌ ثبت‌نام امن انجام نشد. اتصال و سیاست‌های دسترسی Supabase را بررسی کنید.",
    };
  }
}

// =========================================================================
// 3. MAYOR WHITELISTING
// =========================================================================
export async function addRoommateToWhitelist(
  email: string,
  name: string,
  roomCode: string
): Promise<boolean> {
  const formattedEmail = email.trim().toLowerCase();
  const targetRoomCode = roomCode.toUpperCase();
  try {
    // A. Insert into "whitelists" table
    let wlErr = null;
    try {
      const { data: existing } = await supabase
        .from("whitelists")
        .select("*")
        .eq("email", formattedEmail)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("whitelists")
          .update({
            name: name.trim(),
            room_id: targetRoomCode,
            suite_code: targetRoomCode,
          })
          .eq("email", formattedEmail);
        wlErr = error;
      } else {
        const { error } = await supabase
          .from("whitelists")
          .insert({
            email: formattedEmail,
            name: name.trim(),
            room_id: targetRoomCode,
            suite_code: targetRoomCode,
          });
        wlErr = error;
      }
    } catch (e: any) {
      console.warn("whitelists table insert failed, trying alternative updates:", e);
      wlErr = e;
    }

    // Try fallback "whitelist" table if "whitelists" failed or threw
    if (wlErr) {
      try {
        const { data: existing } = await supabase
          .from("whitelist")
          .select("*")
          .eq("email", formattedEmail)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("whitelist")
            .update({
              name: name.trim(),
              room_id: targetRoomCode,
            })
            .eq("email", formattedEmail);
        } else {
          await supabase
            .from("whitelist")
            .insert({
              email: formattedEmail,
              name: name.trim(),
              room_id: targetRoomCode,
            });
        }
      } catch (altE) {
        console.warn("Could not write to alternative whitelist table:", altE);
      }
    }

    // B. Also update rooms array whitelisted column if exists
    try {
      const { data: roomRow } = await supabase
        .from("rooms")
        .select("invited_emails")
        .eq("room_id", targetRoomCode)
        .maybeSingle();

      if (roomRow) {
        const currentList = roomRow.invited_emails || [];
        if (!currentList.map((e: string) => e.toLowerCase()).includes(formattedEmail)) {
          const updatedList = [...currentList, formattedEmail];
          await supabase
            .from("rooms")
            .update({ invited_emails: updatedList })
            .eq("room_id", targetRoomCode);
        }
      }
    } catch (roomE) {
      console.warn("Could not update rooms.invited_emails:", roomE);
    }

    return true;
  } catch (err) {
    console.error("Error whitelisting roommate:", err);
    return false;
  }
}

// =========================================================================
// 4. CHORES & POINTS UPDATES
// =========================================================================
export async function updateMemberPointsInSupabase(
  email: string,
  value: number
): Promise<number | null> {
  try {
    // Fetch current points
    const { data: user, error: fetchErr } = await supabase
      .from("users")
      .select("points")
      .eq("email", email.toLowerCase())
      .single();

    if (fetchErr || !user) throw fetchErr || new Error("User not found");

    const newPoints = Math.max(0, (user.points || 0) + value);

    // Update table
    const { error: updateErr } = await supabase
      .from("users")
      .update({ points: newPoints })
      .eq("email", email.toLowerCase());

    if (updateErr) throw updateErr;

    return newPoints;
  } catch (err) {
    console.error("Error updating points in Supabase:", err);
    return null;
  }
}

export async function logChoreHistoryToSupabase(
  name: string,
  email: string,
  action: string,
  type: "chore" | "travel" | "extra_task" | "system" | "points",
  roomCode: string,
  date: string = "۱۴۰۵/۰۴/۰۴"
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("chores_history")
      .insert({
        id: "log-" + Date.now(),
        name,
        email: email.toLowerCase(),
        user_email: email.toLowerCase(),
        action,
        type,
        date,
        room_id: roomCode.toUpperCase(),
        created_at: new Date().toISOString(),
      });

    if (error) {
      // Try history fallback
      const { error: altErr } = await supabase
        .from("history")
        .insert({
          id: "log-" + Date.now(),
          name,
          email: email.toLowerCase(),
          action,
          type,
          date,
        });
      if (altErr) throw altErr;
    }
    return true;
  } catch (err) {
    console.error("Error logging history to Supabase:", err);
    return false;
  }
}

// =========================================================================
// 5. ANNOUNCEMENTS AND REQUESTS
// =========================================================================
export async function createAnnouncementInSupabase(
  text: string,
  author: string,
  roomCode: string,
  date: string = "۱۴۰۵/۰۴/۰۴"
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("announcements")
      .insert({
        id: "ann-" + Date.now(),
        text,
        author,
        date,
        room_id: roomCode.toUpperCase(),
        created_at: new Date().toISOString()
      });
    return !error;
  } catch (err) {
    console.error("Error posting announcement:", err);
    return false;
  }
}

export async function deleteAnnouncementFromSupabase(id: string, roomCode: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id)
      .eq("room_id", roomCode.toUpperCase());
    return !error;
  } catch (err) {
    console.error("Error deleting announcement:", err);
    return false;
  }
}

export async function createRequestInSupabase(
  request: CartableRequest,
  roomCode: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("cartable_requests")
      .insert({
        id: request.id,
        name: request.name,
        email: request.email.toLowerCase(),
        type: request.type,
        details: request.details,
        status: request.status,
        date: request.date,
        room_id: roomCode.toUpperCase(),
        created_at: new Date().toISOString()
      });
    return !error;
  } catch (err) {
    console.error("Error inserting request:", err);
    return false;
  }
}

export async function updateRequestStatusInSupabase(
  id: string,
  status: "approved" | "rejected",
  roomCode: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("cartable_requests")
      .update({ status })
      .eq("id", id)
      .eq("room_id", roomCode.toUpperCase());
    return !error;
  } catch (err) {
    console.error("Error updating request status:", err);
    return false;
  }
}

// =========================================================================
// 6. ROOM CONFIGURATION FETCH
// =========================================================================
export async function fetchRoomConfigFromSupabase(roomCode: string): Promise<{ garbage_days: number; vacuum_days: number } | null> {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("garbage_days, vacuum_days")
      .eq("room_id", roomCode.toUpperCase())
      .maybeSingle();

    if (error) {
      const { data: altData } = await supabase
        .from("room")
        .select("garbage_days, vacuum_days")
        .eq("room_id", roomCode.toUpperCase())
        .maybeSingle();
      if (altData) {
        return {
          garbage_days: altData.garbage_days || 2,
          vacuum_days: altData.vacuum_days || 7
        };
      }
    }

    if (data) {
      return {
        garbage_days: data.garbage_days || 2,
        vacuum_days: data.vacuum_days || 7
      };
    }
    return { garbage_days: 2, vacuum_days: 7 };
  } catch (err) {
    console.warn("Could not fetch room config from Supabase:", err);
    return { garbage_days: 2, vacuum_days: 7 };
  }
}

export async function fetchRoomTurnFromSupabase(roomCode: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("current_turn_email")
      .eq("room_id", roomCode.toUpperCase())
      .maybeSingle();

    if (error) {
      const { data: altData } = await supabase
        .from("room")
        .select("current_turn_email")
        .eq("room_id", roomCode.toUpperCase())
        .maybeSingle();
      if (altData) {
        return altData.current_turn_email || null;
      }
    }

    if (data && data.current_turn_email) {
      return data.current_turn_email;
    }
    return null;
  } catch (err) {
    console.warn("Could not fetch room turn from Supabase:", err);
    return null;
  }
}

export async function updateRoomTurnInSupabase(roomCode: string, email: string): Promise<boolean> {
  const targetEmail = email.toLowerCase().trim();
  const targetRoomCode = roomCode.toUpperCase();
  try {
    const { error } = await supabase
      .from("rooms")
      .update({ current_turn_email: targetEmail })
      .eq("room_id", targetRoomCode);

    if (error) {
      await supabase
        .from("room")
        .update({ current_turn_email: targetEmail })
        .eq("room_id", targetRoomCode);
    }
    return true;
  } catch (err) {
    console.warn("Could not update room turn in Supabase:", err);
    return false;
  }
}
