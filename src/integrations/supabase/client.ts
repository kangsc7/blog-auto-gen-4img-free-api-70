
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://doiiqlqqyfxnvicvlzxr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaWlxbHFxeWZ4bnZpY3ZsenhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NzQ5MDIsImV4cCI6MjA2NTU1MDkwMn0.FNhB-Kjdx3TJx5BlI8pQOhWQ5oAZRvNTwtsekk9tOY4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
