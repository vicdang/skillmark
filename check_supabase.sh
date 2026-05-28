# Check if we can query the users table and see recent entries
# This requires supabase CLI to be installed and authenticated

echo "Checking Supabase project status..."
supabase projects list 2>/dev/null | head -20 || echo "Supabase CLI not available or not authenticated"

echo ""
echo "Recommended next steps:"
echo "1. Go to Supabase dashboard > Your project > Logs"
echo "2. Check the 'auth' log for errors during OAuth callback"
echo "3. Check the 'postgres' log for errors in on_auth_user_created trigger"
echo "4. Verify the users table - are test accounts being created?"
