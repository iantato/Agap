import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gebzysoalyzmosyypvzy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlYnp5c29hbHl6bW9zeXlwdnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDkwNzEsImV4cCI6MjA4OTE4NTA3MX0.oC2nQhCWek9FWr_IUoSiq4_pnCgjgC14Ynm4BfGvSbA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
