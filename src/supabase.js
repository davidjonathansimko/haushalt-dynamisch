import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://jcblkosecwnaetegserx.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjYmxrb3NlY3duYWV0ZWdzZXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDQ3MjYsImV4cCI6MjA4ODM4MDcyNn0.Ni2PcWUdIOD3iiKtUtlmI_3ohKLvc2YyLUKp7g1I0YM"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// The one admin email
export const ADMIN_EMAIL = "davidsimko22@yahoo.com"
