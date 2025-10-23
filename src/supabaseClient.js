import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fjukaywizsoanrstykwn.supabase.co'//found in Data API section
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdWtheXdpenNvYW5yc3R5a3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjE2NzIsImV4cCI6MjA3NjQzNzY3Mn0.IsOlrfBHmvcMp--VPFyqN2ft1_QtlQPsSgc5txU1RoE'//found in API Keys section
export const supabase = createClient(supabaseUrl, supabaseKey)
