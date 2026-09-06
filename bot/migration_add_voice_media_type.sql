-- =============================================
-- Migration: Allow 'voice' in memories.media_type
-- Run this in your Supabase SQL Editor if needed
-- =============================================

ALTER TABLE public.memories DROP CONSTRAINT IF EXISTS memories_media_type_check;

ALTER TABLE public.memories ADD CONSTRAINT memories_media_type_check 
  CHECK (media_type IN ('image', 'video', 'text', 'voice'));
