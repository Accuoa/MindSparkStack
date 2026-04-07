// MindSparkAI — Supabase Client Configuration
// Loaded AFTER the Supabase JS SDK via CDN
// CDN: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

var SUPABASE_URL = 'https://rbhogcjqaxvtnmafjgyp.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaG9nY2pxYXh2dG5tYWZqZ3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDcwNzIsImV4cCI6MjA5MTA4MzA3Mn0.z3xtnqt5ETKGbWymSaRYWejlTBeAXIMrpGB0BLSfGKc';

var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
