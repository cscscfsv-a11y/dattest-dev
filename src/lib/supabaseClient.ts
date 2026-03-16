import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://epsroezbzdfeufulhwcl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwc3JvZXpiemRmZXVmdWxod2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDQxODYsImV4cCI6MjA4OTE4MDE4Nn0.qkCVtyMy9P-HJ9d8utH5elzkHtbIWAJlSALTIyHHNPw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
