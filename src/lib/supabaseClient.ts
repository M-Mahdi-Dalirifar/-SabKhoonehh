import { createClient } from "@supabase/supabase-js";

// =========================================================================
// SUPABASE CONFIGURATION PLACEHOLDERS
// You can replace these with your own credentials directly if you wish to swap databases.
// =========================================================================
const SUPABASE_URL = "https://jkvohjcunovknhtggjqi.supabase.co"; // <-- PLACEHOLDER: Paste your Supabase URL here
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprdm9oamN1bm92a25odGdnanFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTExNDIsImV4cCI6MjA5ODc2NzE0Mn0.ohtshRDd48J2iata5OI7S3JE9hU6XTKTKUtS03ScrYk"; // <-- PLACEHOLDER: Paste your Supabase Anon Key here

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
