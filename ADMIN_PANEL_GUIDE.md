# MindSnap Admin Panel — Architecture & Implementation Guide

This document provides a comprehensive, production-ready specification and step-by-step roadmap to build an **Admin Panel** for the MindSnap Telegram Bot.

The admin panel is built directly into the existing **Next.js 16 (App Router) + React 19 + Tailwind CSS v4** workspace, connecting directly to **Supabase** and the **Telegram Bot API**.

---

## 📑 Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Database Schema & Data Model](#2-database-schema--data-model)
3. [Required Dependencies & Environment Variables](#3-required-dependencies--environment-variables)
4. [Admin Authentication & Middleware](#4-admin-authentication--middleware)
5. [Core Modules & Features](#5-core-modules--features)
   - [5.1 Dashboard & KPI Overview](#51-dashboard--kpi-overview)
   - [5.2 User Management](#52-user-management)
   - [5.3 Reminders & Active Cycles Monitor](#53-reminders--active-cycles-monitor)
   - [5.4 Memories & Media Gallery](#54-memories--media-gallery)
   - [5.5 Broadcast & Announcement Center](#55-broadcast--announcement-center)
   - [5.6 System Health & Scheduler Logs](#56-system-health--scheduler-logs)
6. [Target Directory & File Structure](#6-target-directory--file-structure)
7. [Implementation Blueprint & Code Templates](#7-implementation-blueprint--code-templates)
   - [7.1 Supabase Server Client & Service Role](#71-supabase-server-client--service-role)
   - [7.2 Server Actions for Dashboard & Control](#72-server-actions-for-dashboard--control)
   - [7.3 Broadcast Engine with Rate-Limiting](#73-broadcast-engine-with-rate-limiting)
   - [7.4 Admin Layout & UI Design System](#74-admin-layout--ui-design-system)
8. [Step-by-Step Execution Roadmap](#8-step-by-step-execution-roadmap)

---

## 1. System Architecture

```mermaid
graph TD
    AdminUser[Admin User] -->|HTTPS Browser| NextApp[Next.js 16 Admin Panel]
    
    subgraph NextJS [Next.js App Router (app/admin)]
        AuthMid[Admin Auth Middleware]
        DashPage[Dashboard / KPIs]
        UserPage[User Management]
        RemPage[Reminders & Cycles]
        MemPage[Media Gallery]
        BroadPage[Broadcast Center]
        ServerActions[Server Actions & API Routes]
    end

    NextApp --> AuthMid
    AuthMid --> ServerActions
    ServerActions -->|Service Role Client| SupabaseDB[(Supabase PostgreSQL)]
    ServerActions -->|Storage API| SupabaseStore[(Supabase Storage: memories)]
    ServerActions -->|sendMessage API| TelegramAPI[Telegram Bot API]

    subgraph BotRuntime [Telegram Bot Background Worker]
        BotEngine[grammY Bot]
        Scheduler[1-Minute Cron Scheduler]
    end

    BotRuntime <--> SupabaseDB
    BotRuntime <--> SupabaseStore
```

---

## 2. Database Schema & Data Model

The Admin Panel interacts with the existing Supabase tables:

### 2.1 `public.users`
| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Internal user unique identifier |
| `telegram_id` | `bigint` (Unique) | Telegram numeric user ID |
| `timezone` | `text` | User's IANA timezone (default: `Asia/Tashkent`) |
| `created_at` | `timestamptz` | Account registration date |
| `is_banned` | `boolean` (Optional) | Flag to block malicious users |

### 2.2 `public.memories`
| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Memory identifier |
| `user_id` | `uuid` (FK -> users.id) | Memory creator |
| `media_type` | `text` | `'text'`, `'image'`, `'video'`, `'voice'` |
| `media_url` | `text` (Nullable) | Public/Signed URL in Supabase Storage |
| `content_text` | `text` (Nullable) | Extracted text / caption / prompt |
| `created_at` | `timestamptz` | Memory creation timestamp |

### 2.3 `public.reminders`
| Column | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Reminder record identifier |
| `memory_id` | `uuid` (FK -> memories.id) | Attached memory item |
| `scheduled_at` | `timestamptz` | Due trigger time in UTC |
| `is_recurring` | `boolean` | `true` if recurring cycle |
| `recurring_interval_minutes` | `integer` (Nullable) | Cycle repeat interval (e.g. 1440 for daily) |
| `end_date` | `timestamptz` (Nullable) | Optional recurring expiration date |
| `status` | `text` | `'pending'`, `'sent'`, `'stopped'` |
| `created_at` | `timestamptz` | Reminder registration timestamp |

### 2.4 Supabase Storage
- **Bucket**: `memories`
- **Folders**: `uploads/{timestamp}_{filename}`

---

## 3. Required Dependencies & Environment Variables

### 3.1 Install NPM Packages
In the root directory, install the required packages for UI icons, Supabase server interaction, and session encryption:

```bash
npm install @supabase/supabase-js lucide-react clsx tailwind-merge jose
```

### 3.2 Environment Variables (`.env.local`)
Create or update `.env.local` at the root of the project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
BOT_TOKEN=your_telegram_bot_token_here

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Admin Authentication
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here
ADMIN_JWT_SECRET=your_jwt_secret_key_here
```

---

## 4. Admin Authentication & Middleware

To keep the setup light, reliable, and secure without requiring third-party OAuth, use **email + password validation** with a **JWT session cookie**.

### 4.1 Session Verification Utility (`lib/auth.ts`)
```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "mindsnap_super_secure_jwt_secret_key_2026_x89a"
);

export async function validateAdminCredentials(email: string, pass: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || "otabekabduvaliyev1910@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "qwerty_654321";
  return email === adminEmail && pass === adminPassword;
}

export async function createAdminSession(email: string) {
  const token = await new SignJWT({ role: "admin", email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
```

### 4.2 Middleware Route Guard (`middleware.ts`)
Create `middleware.ts` in the workspace root to guard `/admin/*`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "default_fallback_secret_32_characters_long"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      await jwtVerify(token, secretKey);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## 5. Core Modules & Features

### 5.1 Dashboard & KPI Overview (`/admin`)
- **Key Metric Cards**:
  - 👥 **Total Users**: Total registered Telegram users (`COUNT(*) FROM users`).
  - 🔁 **Active Recurring Cycles**: Active cycles currently looping (`status = 'pending' AND is_recurring = true`).
  - ⏰ **Scheduled Today**: Reminders pending execution today in UTC.
  - 📦 **Total Memories**: Count of saved memory items.
- **Media Distribution Chart**:
  - Breakdown of memory formats (Text, Images, Voice Notes, Videos).
- **Recent Activity Feed**:
  - Latest 10 reminders triggered or created.
- **Bot Scheduler Liveness Status**:
  - Green indicator if scheduler is executing on time.

---

### 5.2 User Management (`/admin/users`)
- **Search & Filters**: Search by numeric `telegram_id` or filter by registered date.
- **User Detail Modal / Page**:
  - Telegram ID, configured Timezone (e.g. `Asia/Tashkent`).
  - Total memories created.
  - Active vs. Completed reminders count.
  - Quick action to view all memories/reminders belonging to this user.
  - **Ban / Restrict Toggle**: Flag user in database to ignore incoming bot events.

---

### 5.3 Reminders & Active Cycles Monitor (`/admin/reminders`)
- **Interactive Data Table**:
  - Filter by status: `pending`, `sent`, `stopped`.
  - Filter by type: `Recurring Cycle` vs `One-time Reminder`.
  - Columns: User (Telegram ID), Memory Preview, Scheduled Time (UTC & Local), Interval, Status, Actions.
- **Admin Control Actions**:
  - 🛑 **Force Stop**: Instantly marks recurring reminder as `status = 'stopped'`.
  - 🚀 **Trigger Now**: Sends reminder immediately via Telegram Bot API and sets next recurring timestamp.
  - ✏️ **Reschedule**: Date/Time picker modal to change `scheduled_at`.

---

### 5.4 Memories & Media Gallery (`/admin/memories`)
- **Visual Card Grid / Table**:
  - Shows thumbnails for images, audio players for voice notes, video previews for MP4s, and text cards for notes.
  - Direct download / inspect links for Supabase storage objects.
- **Bulk Cleanup**: Delete outdated or orphaned media files.

---

### 5.5 Broadcast & Announcement Center (`/admin/broadcast`)
- **Rich Message Composer**:
  - Supports Telegram MarkdownV2 or HTML formatting.
  - Optional Photo / Media attachment.
- **Audience Targeting**:
  - All Users.
  - Specific Timezone cohort (e.g., send only to `Asia/Tashkent` users).
  - Selected Telegram IDs (for testing).
- **Execution Engine**:
  - Uses batching with **30 messages/sec** throttling to comply with Telegram API rate limits.
  - Live progress bar showing Sent / Failed / Blocked count.

---

### 5.6 System Health & Scheduler Logs (`/admin/system`)
- **Scheduler Heartbeat Monitor**:
  - Real-time check of pending overdue reminders (`scheduled_at <= NOW() AND status = 'pending'`). If overdue count > 0 for > 3 minutes, show Warning.
- **Gemini API & Token Usage**:
  - Estimates and logs of AI parsing requests.

---

## 6. Target Directory & File Structure

```
app/
├── admin/
│   ├── layout.tsx                # Admin Sidebar, Header, and Shell
│   ├── page.tsx                  # Dashboard & KPIs
│   ├── login/
│   │   └── page.tsx              # Admin Login Form
│   ├── users/
│   │   ├── page.tsx              # Users Table & Search
│   │   └── [id]/page.tsx         # User Profile & Activity Detail
│   ├── reminders/
│   │   └── page.tsx              # Reminders & Recurring Cycles Manager
│   ├── memories/
│   │   └── page.tsx              # Media Gallery & Storage Browser
│   ├── broadcast/
│   │   └── page.tsx              # Announcement & Broadcast Tool
│   └── system/
│       └── page.tsx              # System Health & Overdue Checker
├── api/
│   └── admin/
│       ├── auth/route.ts         # Login / Logout Endpoints
│       ├── broadcast/route.ts    # Background Broadcast Dispatcher
│       └── trigger/route.ts      # Manual Reminder Execution
lib/
├── auth.ts                       # JWT Session helpers
├── supabaseServer.ts             # Service Role Supabase Client
├── telegram.ts                   # Telegram API Broadcast & Direct Messaging
components/
└── admin/
    ├── Sidebar.tsx               # Navigation Sidebar
    ├── StatCard.tsx              # Dashboard Metric Card
    ├── DataTable.tsx             # Generic Filterable Table
    ├── ReminderActions.tsx       # Stop, Trigger, Reschedule Buttons
    ├── MediaModal.tsx            # Fullscreen Image/Video Preview
    └── BroadcastForm.tsx         # Message composer with live preview
```

---

## 7. Implementation Blueprint & Code Templates

### 7.1 Supabase Server Client (`lib/supabaseServer.ts`)
```typescript
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
```

---

### 7.2 Server Actions for Dashboard & Control (`app/admin/actions.ts`)
```typescript
"use server";

import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function getDashboardStats() {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  const [usersCount, activeCycles, todayReminders, totalMemories, overdueReminders] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("reminders").select("*", { count: "exact", head: true }).eq("status", "pending").eq("is_recurring", true),
    supabase.from("reminders").select("*", { count: "exact", head: true }).eq("status", "pending").gte("scheduled_at", startOfDay.toISOString()).lte("scheduled_at", endOfDay.toISOString()),
    supabase.from("memories").select("*", { count: "exact", head: true }),
    supabase.from("reminders").select("*", { count: "exact", head: true }).eq("status", "pending").lt("scheduled_at", now),
  ]);

  return {
    totalUsers: usersCount.count || 0,
    activeCycles: activeCycles.count || 0,
    todayReminders: todayReminders.count || 0,
    totalMemories: totalMemories.count || 0,
    overdueCount: overdueReminders.count || 0,
  };
}

export async function stopRecurringReminder(reminderId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("reminders")
    .update({ status: "stopped" })
    .eq("id", reminderId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/reminders");
  return { success: true };
}

export async function rescheduleReminder(reminderId: string, newIsoDate: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("reminders")
    .update({ scheduled_at: newIsoDate, status: "pending" })
    .eq("id", reminderId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/reminders");
  return { success: true };
}
```

---

### 7.3 Broadcast Engine with Rate Limiting (`lib/telegram.ts`)
```typescript
interface SendBroadcastParams {
  messageText: string;
  photoUrl?: string;
  parseMode?: "HTML" | "MarkdownV2";
}

export async function broadcastToUsers(params: SendBroadcastParams) {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN is not defined");

  const supabase = getSupabaseAdmin();
  const { data: users, error } = await supabase.from("users").select("telegram_id");
  if (error || !users) throw new Error("Failed to fetch users");

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const url = params.photoUrl
        ? `https://api.telegram.org/bot${token}/sendPhoto`
        : `https://api.telegram.org/bot${token}/sendMessage`;

      const body = params.photoUrl
        ? { chat_id: user.telegram_id, photo: params.photoUrl, caption: params.messageText, parse_mode: params.parseMode || "HTML" }
        : { chat_id: user.telegram_id, text: params.messageText, parse_mode: params.parseMode || "HTML" };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) sent++;
      else failed++;
    } catch {
      failed++;
    }

    // Rate-limit safety: 35ms sleep between sends (~28 requests/sec)
    await new Promise((resolve) => setTimeout(resolve, 35));
  }

  return { total: users.length, sent, failed };
}
```

---

### 7.4 Admin Layout Shell (`app/admin/layout.tsx`)
```tsx
import Link from "next/link";
import { LayoutDashboard, Users, BellRing, Image as ImageIcon, Send, Activity, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 px-2 pb-6 border-b border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              🔔
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-wide text-white">MindSnap Admin</h1>
              <p className="text-xs text-slate-400">MindSnap Bot v1.0</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-1.5">
            <NavLink href="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavLink href="/admin/users" icon={<Users size={18} />} label="Users" />
            <NavLink href="/admin/reminders" icon={<BellRing size={18} />} label="Reminders & Cycles" />
            <NavLink href="/admin/memories" icon={<ImageIcon size={18} />} label="Memories & Media" />
            <NavLink href="/admin/broadcast" icon={<Send size={18} />} label="Broadcast" />
            <NavLink href="/admin/system" icon={<Activity size={18} />} label="System Health" />
          </nav>
        </div>

        <form action="/api/admin/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </form>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-150"
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </Link>
  );
}
```

---

## 8. Step-by-Step Execution Roadmap

| Step | Task | Details |
|---|---|---|
| **Phase 1** | **Dependencies & Environment Setup** | Install `lucide-react`, `@supabase/supabase-js`, `jose`. Add `ADMIN_SECRET_PASSWORD`, `ADMIN_JWT_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`. |
| **Phase 2** | **Authentication System** | Create `lib/auth.ts`, `middleware.ts`, and `app/admin/login/page.tsx` with secure session cookie. |
| **Phase 3** | **Admin Layout & Navigation** | Build `app/admin/layout.tsx` with dark glassmorphic sidebar and responsive container. |
| **Phase 4** | **Dashboard View** | Implement `app/admin/page.tsx` displaying real-time KPI metrics (users, cycles, today's reminders, media stats). |
| **Phase 5** | **User Management** | Build `app/admin/users/page.tsx` with search by Telegram ID, timezone badge, and memory/reminder history. |
| **Phase 6** | **Reminders & Cycles Control** | Implement `app/admin/reminders/page.tsx` with filters, "Stop Cycle", "Trigger Now", and date rescheduling actions. |
| **Phase 7** | **Media Browser** | Build `app/admin/memories/page.tsx` displaying photo thumbnails, voice audio players, and download links. |
| **Phase 8** | **Broadcast Center** | Create `app/admin/broadcast/page.tsx` with Telegram formatting preview, target cohort filtering, and rate-limited dispatch. |
| **Phase 9** | **System & Scheduler Monitor** | Create `app/admin/system/page.tsx` detecting overdue jobs or scheduler lag. |

---

## 💡 Quick Tips & Best Practices
1. **Next.js 16 Direct Access**: Keep database mutations inside Server Actions with `revalidatePath()` for instant UI updates.
2. **Telegram Formatting**: When using `parse_mode: 'HTML'` in broadcast messages, ensure tags like `<b>`, `<i>`, and `<code>` are properly validated.
3. **Timezones**: Always display reminder dates in both **UTC** and the user's localized timezone (e.g. `Asia/Tashkent`) using `Intl.DateTimeFormat`.
