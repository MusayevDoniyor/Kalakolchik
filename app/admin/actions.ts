"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { validateAdminCredentials, createAdminSession, destroyAdminSession } from "@/lib/auth";
import { broadcastToUsers, sendDirectTelegramMessage } from "@/lib/telegram";

// ----------------------------------------------------------------
// Auth Actions
// ----------------------------------------------------------------

export async function loginAdminAction(prevState: { error?: string } | null, formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";

  const isValid = await validateAdminCredentials(email, password);
  if (!isValid) {
    return { error: "Invalid admin email or password." };
  }

  await createAdminSession(email);
  redirect("/admin");
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

// ----------------------------------------------------------------
// Dashboard Stats Action
// ----------------------------------------------------------------

export async function getDashboardStats() {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const nowIso = now.toISOString();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  try {
    const [
      usersRes,
      activeCyclesRes,
      todayRemindersRes,
      totalMemoriesRes,
      overdueRes,
      mediaTextRes,
      mediaImageRes,
      mediaVoiceRes,
      mediaVideoRes,
      recentRemindersRes,
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("reminders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("is_recurring", true),
      supabase
        .from("reminders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("scheduled_at", startOfDay.toISOString())
        .lte("scheduled_at", endOfDay.toISOString()),
      supabase.from("memories").select("*", { count: "exact", head: true }),
      supabase
        .from("reminders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .lt("scheduled_at", nowIso),
      supabase.from("memories").select("*", { count: "exact", head: true }).eq("media_type", "text"),
      supabase.from("memories").select("*", { count: "exact", head: true }).eq("media_type", "image"),
      supabase.from("memories").select("*", { count: "exact", head: true }).eq("media_type", "voice"),
      supabase.from("memories").select("*", { count: "exact", head: true }).eq("media_type", "video"),
      supabase
        .from("reminders")
        .select(
          `
          id,
          scheduled_at,
          status,
          is_recurring,
          recurring_interval_minutes,
          created_at,
          memories (
            id,
            content_text,
            media_type,
            media_url,
            users (
              telegram_id
            )
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    return {
      totalUsers: usersRes.count || 0,
      activeCycles: activeCyclesRes.count || 0,
      todayReminders: todayRemindersRes.count || 0,
      totalMemories: totalMemoriesRes.count || 0,
      overdueCount: overdueRes.count || 0,
      mediaBreakdown: {
        text: mediaTextRes.count || 0,
        image: mediaImageRes.count || 0,
        voice: mediaVoiceRes.count || 0,
        video: mediaVideoRes.count || 0,
      },
      recentReminders: (recentRemindersRes.data || []) as any[],
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalUsers: 0,
      activeCycles: 0,
      todayReminders: 0,
      totalMemories: 0,
      overdueCount: 0,
      mediaBreakdown: { text: 0, image: 0, voice: 0, video: 0 },
      recentReminders: [],
    };
  }
}

// ----------------------------------------------------------------
// Users Actions
// ----------------------------------------------------------------

export async function getUsersList(search?: string) {
  const supabase = getSupabaseAdmin();

  const fetchUsers = async (includeTz: boolean) => {
    let query = supabase
      .from("users")
      .select(
        `
        id,
        telegram_id,
        ${includeTz ? "timezone," : ""}
        created_at,
        memories (
          id,
          reminders (
            id,
            status,
            is_recurring
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (search && search.trim()) {
      const num = Number(search.trim());
      if (!isNaN(num)) {
        query = query.eq("telegram_id", num);
      }
    }
    return await query;
  };

  let { data, error } = await fetchUsers(true);

  if (error && /timezone/i.test(error.message)) {
    console.warn("[getUsersList] 'timezone' column missing in users table, falling back to default timezone.");
    const fallback = await fetchUsers(false);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return (data || []).map((u: any) => {
    const memories = u.memories || [];
    let activeRemindersCount = 0;
    memories.forEach((m: any) => {
      const rems = m.reminders || [];
      rems.forEach((r: any) => {
        if (r.status === "pending") activeRemindersCount++;
      });
    });

    return {
      id: u.id,
      telegram_id: u.telegram_id,
      timezone: u.timezone || "Asia/Tashkent",
      created_at: u.created_at,
      memories_count: memories.length,
      active_reminders_count: activeRemindersCount,
    };
  });
}

// ----------------------------------------------------------------
// Reminders Actions
// ----------------------------------------------------------------

export async function getRemindersList(filters?: {
  status?: string;
  isRecurring?: string;
  search?: string;
}) {
  const supabase = getSupabaseAdmin();

  const fetchReminders = async (includeTz: boolean, includeEndDate: boolean) => {
    let query = supabase
      .from("reminders")
      .select(
        `
        id,
        memory_id,
        scheduled_at,
        is_recurring,
        recurring_interval_minutes,
        ${includeEndDate ? "end_date," : ""}
        status,
        created_at,
        memories (
          id,
          content_text,
          media_type,
          media_url,
          users (
            telegram_id${includeTz ? ",\n            timezone" : ""}
          )
        )
      `
      )
      .order("scheduled_at", { ascending: true })
      .limit(100);

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.isRecurring === "recurring") {
      query = query.eq("is_recurring", true);
    } else if (filters?.isRecurring === "once") {
      query = query.eq("is_recurring", false);
    }

    return await query;
  };

  let includeTz = true;
  let includeEndDate = true;
  let { data, error } = await fetchReminders(includeTz, includeEndDate);

  if (error) {
    if (/timezone/i.test(error.message)) includeTz = false;
    if (/end_date/i.test(error.message)) includeEndDate = false;
    const retry = await fetchReminders(includeTz, includeEndDate);
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    const finalFallback = await fetchReminders(false, false);
    data = finalFallback.data;
    error = finalFallback.error;
  }

  if (error) {
    console.error("Error fetching reminders:", error);
    return [];
  }

  let list = data || [];
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.toLowerCase().trim();
    list = list.filter((r: any) => {
      const text = r.memories?.content_text?.toLowerCase() || "";
      const tgId = String(r.memories?.users?.telegram_id || "");
      return text.includes(s) || tgId.includes(s);
    });
  }

  return list as any[];
}

export async function stopRecurringReminder(reminderId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("reminders")
    .update({ status: "stopped" })
    .eq("id", reminderId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/reminders");
  revalidatePath("/admin");
  return { success: true };
}

export async function rescheduleReminder(reminderId: string, newScheduledIso: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("reminders")
    .update({ scheduled_at: newScheduledIso, status: "pending" })
    .eq("id", reminderId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/reminders");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteReminder(reminderId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("reminders").delete().eq("id", reminderId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/reminders");
  revalidatePath("/admin");
  return { success: true };
}

export async function triggerReminderNow(reminderId: string) {
  const supabase = getSupabaseAdmin();

  // 1. Fetch reminder with memory and user
  const { data: reminder, error } = await supabase
    .from("reminders")
    .select(
      `
      id,
      scheduled_at,
      is_recurring,
      recurring_interval_minutes,
      status,
      memories (
        id,
        content_text,
        media_type,
        media_url,
        users (
          telegram_id
        )
      )
    `
    )
    .eq("id", reminderId)
    .single();

  if (error || !reminder) {
    throw new Error("Reminder not found");
  }

  const memory = (reminder as any).memories;
  const telegramId = memory?.users?.telegram_id;
  if (!telegramId) {
    throw new Error("Telegram ID associated with reminder not found");
  }

  const reminderText = `🔔 <b>MindSnap Reminder (Admin Triggered)</b>\n\n${
    memory.content_text || "You have a scheduled memory."
  }`;

  // 2. Dispatch message
  await sendDirectTelegramMessage(
    telegramId,
    reminderText,
    memory.media_url,
    memory.media_type
  );

  // 3. Update database
  if (reminder.is_recurring && reminder.recurring_interval_minutes) {
    const nextDate = new Date(Date.now() + reminder.recurring_interval_minutes * 60 * 1000);
    await supabase
      .from("reminders")
      .update({ scheduled_at: nextDate.toISOString() })
      .eq("id", reminderId);
  } else {
    await supabase.from("reminders").update({ status: "sent" }).eq("id", reminderId);
  }

  revalidatePath("/admin/reminders");
  revalidatePath("/admin");
  return { success: true };
}

// ----------------------------------------------------------------
// Memories Actions
// ----------------------------------------------------------------

export async function getMemoriesList(mediaType?: string) {
  const supabase = getSupabaseAdmin();

  const fetchMemories = async (includeTz: boolean) => {
    let query = supabase
      .from("memories")
      .select(
        `
        id,
        user_id,
        media_type,
        media_url,
        content_text,
        created_at,
        users (
          telegram_id${includeTz ? ",\n          timezone" : ""}
        ),
        reminders (
          id,
          status,
          scheduled_at,
          is_recurring
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (mediaType && mediaType !== "all") {
      query = query.eq("media_type", mediaType);
    }

    return await query;
  };

  let { data, error } = await fetchMemories(true);

  if (error && /timezone/i.test(error.message)) {
    console.warn("[getMemoriesList] 'timezone' column missing in users table, falling back.");
    const fallback = await fetchMemories(false);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error("Error fetching memories:", error);
    return [];
  }

  return (data || []) as any[];
}

export async function deleteMemory(memoryId: string) {
  const supabase = getSupabaseAdmin();
  // Supabase CASCADE will delete associated reminders
  const { error } = await supabase.from("memories").delete().eq("id", memoryId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/memories");
  revalidatePath("/admin");
  return { success: true };
}

// ----------------------------------------------------------------
// Broadcast Action
// ----------------------------------------------------------------

export async function sendBroadcastAction(params: {
  messageText: string;
  photoUrl?: string;
  parseMode?: "HTML" | "Markdown";
  targetTimezone?: string;
}) {
  return await broadcastToUsers(params);
}

// ----------------------------------------------------------------
// System Health Action
// ----------------------------------------------------------------

export async function getSystemHealth() {
  const supabase = getSupabaseAdmin();
  const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

  let dbOk = false;
  let dbLatencyMs = 0;
  const start = Date.now();

  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    dbLatencyMs = Date.now() - start;
    dbOk = !error;
  } catch {
    dbOk = false;
  }

  let botOk = false;
  let botUsername = "";
  if (token) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await res.json();
      if (res.ok && data.ok) {
        botOk = true;
        botUsername = data.result.username || "";
      }
    } catch {
      botOk = false;
    }
  }

  // Count overdue reminders (> 2 mins past scheduled_at and still pending)
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { count: overdueCount } = await supabase
    .from("reminders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .lt("scheduled_at", twoMinutesAgo);

  return {
    database: {
      status: dbOk ? "healthy" : "down",
      latencyMs: dbLatencyMs,
    },
    telegramBot: {
      status: botOk ? "connected" : "error",
      username: botUsername,
    },
    scheduler: {
      overduePendingCount: overdueCount || 0,
      status: (overdueCount || 0) > 0 ? "warning" : "nominal",
    },
  };
}
