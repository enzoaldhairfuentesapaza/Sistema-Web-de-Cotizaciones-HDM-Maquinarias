import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://nxxmjmhsopadxwoaadvj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eG1qbWhzb3BhZHh3b2FhZHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDA3MzgsImV4cCI6MjA4Njc3NjczOH0.vvpIc_qeH7oXAgt3ZUBzY-WntJdNDwZGrn74E3VnGVY'

export const supabase = createClient(supabaseUrl, supabaseKey)