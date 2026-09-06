"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadTelegramFile = downloadTelegramFile;
exports.receiveMediaHandler = receiveMediaHandler;
const env_1 = require("../../config/env");
/**
 * Downloads a file from Telegram's servers by its file_id.
 * Exported so it can be reused elsewhere.
 */
async function downloadTelegramFile(fileId) {
    const fileRes = await fetch(`https://api.telegram.org/bot${env_1.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileJson = (await fileRes.json());
    if (!fileJson.ok) {
        throw new Error(`Telegram getFile failed for file_id: ${fileId}`);
    }
    const filePath = fileJson.result.file_path;
    const ext = filePath.split(".").pop() ?? "bin";
    const mimeType = ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "mp4"
            ? "video/mp4"
            : "application/octet-stream";
    const downloadRes = await fetch(`https://api.telegram.org/file/bot${env_1.env.TELEGRAM_BOT_TOKEN}/${filePath}`);
    const arrayBuffer = await downloadRes.arrayBuffer();
    return {
        buffer: Buffer.from(arrayBuffer),
        filename: `file.${ext}`,
        mimeType,
    };
}
/**
 * Step 1 handler: Receives any media or text.
 * Uploads media to Supabase Storage (so we have the URL),
 * saves temporary state to session, and asks the user for their note.
 */
async function receiveMediaHandler(ctx) {
    const msg = ctx.message;
    if (!msg)
        return;
    const step = ctx.session.pending?.step;
    // Strict check: only accept new media if we are awaiting_media or have no active session
    if (step && step !== "awaiting_media") {
        // Let other handlers process it if possible, otherwise ignore
        return;
    }
    // Initialize session
    ctx.session.pending = undefined;
    try {
        if (msg.photo && msg.photo.length > 0) {
            // --- Photo ---
            const bestPhoto = msg.photo[msg.photo.length - 1];
            ctx.session.pending = {
                step: "awaiting_note",
                mediaType: "image",
                mediaUrl: bestPhoto.file_id,
                initialText: msg.caption ?? undefined,
                capturedAt: new Date().toISOString(),
            };
        }
        else if (msg.video) {
            // --- Video (big or small) ---
            ctx.session.pending = {
                step: "awaiting_note",
                mediaType: "video",
                mediaUrl: msg.video.file_id,
                initialText: msg.caption ?? undefined,
                capturedAt: new Date().toISOString(),
            };
        }
        else if (msg.video_note) {
            // --- Circle video note (Dumaloq video) ---
            ctx.session.pending = {
                step: "awaiting_note",
                mediaType: "video_note",
                mediaUrl: msg.video_note.file_id,
                initialText: "📹 Dumaloq video",
                capturedAt: new Date().toISOString(),
            };
        }
        else if (msg.document) {
            // --- Document / Any file (PDF, DOCX, ZIP, etc.) ---
            const fileName = msg.document.file_name || "Hujjat";
            ctx.session.pending = {
                step: "awaiting_note",
                mediaType: "document",
                mediaUrl: msg.document.file_id,
                initialText: msg.caption ?? fileName,
                capturedAt: new Date().toISOString(),
            };
        }
        else if (msg.audio) {
            // --- Audio / Music ---
            const audioTitle = msg.audio.title || msg.audio.file_name || "Audio fayl";
            ctx.session.pending = {
                step: "awaiting_note",
                mediaType: "voice",
                mediaUrl: msg.audio.file_id,
                initialText: msg.caption ?? audioTitle,
                capturedAt: new Date().toISOString(),
            };
        }
        else if (msg.text) {
            // --- Text note ---
            ctx.session.pending = {
                step: "awaiting_note",
                mediaType: "text",
                initialText: msg.text,
                capturedAt: new Date().toISOString(),
            };
        }
        else {
            return; // Unsupported message type
        }
        // Step 2: Ask for content summary/note
        await ctx.reply("Buni qanday eslatishim kerak? Qisqacha sarlavha, vazifa yoki ovozli xabar yuboring.");
    }
    catch (err) {
        console.error("[receiveMediaHandler] Error:", err);
        ctx.session.pending = undefined;
        await ctx.reply("❌ Faylni qabul qilishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    }
}
