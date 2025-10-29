import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jtdmckpffriblcnfhkhi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0ZG1ja3BmZnJpYmxjbmZoa2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODEwMzEsImV4cCI6MjA3NzI1NzAzMX0.aW37GPKj44YPWo476jBFgADdBxAqY_4luMYsBVdWWGE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
