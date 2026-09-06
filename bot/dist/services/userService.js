"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertUser = upsertUser;
exports.getUserTimezone = getUserTimezone;
exports.setUserTimezone = setUserTimezone;
const supabase_1 = require("../db/supabase");
const timezone_1 = require("../utils/timezone");
// ----------------------------------------------------------------
// User Service
// Handles user lookup, registration, and timezone management in the `users` table.
// ----------------------------------------------------------------
// In-memory cache for fast timezone lookups
const userTimezoneCache = new Map();
/**
 * Finds an existing user by their Telegram ID, or creates a new one.
 * Returns the user's internal UUID.
 */
async function upsertUser(telegramId, timezone = timezone_1.DEFAULT_TIMEZONE) {
    // First, try to find the existing user
    const { data: existing, error: findError } = await supabase_1.supabase
        .from("users")
        .select("id, timezone")
        .eq("telegram_id", telegramId)
        .maybeSingle();
    if (findError) {
        // If error might be missing timezone column, fallback to selecting id only
        if (/timezone/i.test(findError.message)) {
            const fallback = await supabase_1.supabase
                .from("users")
                .select("id")
                .eq("telegram_id", telegramId)
                .maybeSingle();
            if (fallback.data) {
                userTimezoneCache.set(telegramId, timezone_1.DEFAULT_TIMEZONE);
                return fallback.data.id;
            }
        }
        else {
            throw new Error(`Failed to find user: ${findError.message}`);
        }
    }
    if (existing) {
        const tz = existing.timezone || timezone_1.DEFAULT_TIMEZONE;
        userTimezoneCache.set(telegramId, tz);
        return existing.id;
    }
    // User not found — create a new record
    const insertPayload = {
        telegram_id: telegramId,
        timezone,
    };
    let created = null;
    const insertRes = await supabase_1.supabase
        .from("users")
        .insert(insertPayload)
        .select("id")
        .single();
    if (insertRes.error && /timezone/i.test(insertRes.error.message)) {
        // Retry without timezone column if migration hasn't run yet
        delete insertPayload.timezone;
        const retry = await supabase_1.supabase
            .from("users")
            .insert(insertPayload)
            .select("id")
            .single();
        if (retry.error || !retry.data) {
            throw new Error(`Failed to create user: ${retry.error?.message}`);
        }
        created = retry.data;
    }
    else if (insertRes.error || !insertRes.data) {
        throw new Error(`Failed to create user: ${insertRes.error?.message}`);
    }
    else {
        created = insertRes.data;
    }
    userTimezoneCache.set(telegramId, timezone);
    return created.id;
}
/**
 * Retrieves the user's timezone from cache or database.
 * Defaults to Asia/Tashkent if unspecified or unknown.
 */
async function getUserTimezone(telegramId) {
    const cached = userTimezoneCache.get(telegramId);
    if (cached)
        return cached;
    try {
        const { data, error } = await supabase_1.supabase
            .from("users")
            .select("timezone")
            .eq("telegram_id", telegramId)
            .maybeSingle();
        if (!error && data?.timezone && (0, timezone_1.isValidTimeZone)(data.timezone)) {
            userTimezoneCache.set(telegramId, data.timezone);
            return data.timezone;
        }
    }
    catch (err) {
        console.warn("[getUserTimezone] Failed to fetch timezone:", err);
    }
    userTimezoneCache.set(telegramId, timezone_1.DEFAULT_TIMEZONE);
    return timezone_1.DEFAULT_TIMEZONE;
}
/**
 * Updates the user's timezone in memory and database.
 */
async function setUserTimezone(telegramId, timezone) {
    if (!(0, timezone_1.isValidTimeZone)(timezone)) {
        throw new Error(`Invalid timezone: ${timezone}`);
    }
    // Make sure user exists first
    await upsertUser(telegramId, timezone);
    userTimezoneCache.set(telegramId, timezone);
    const { error } = await supabase_1.supabase
        .from("users")
        .update({ timezone })
        .eq("telegram_id", telegramId);
    if (error) {
        console.warn("[setUserTimezone] Could not update timezone in DB (migration may be needed):", error.message);
    }
}
