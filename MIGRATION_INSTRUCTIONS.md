# Database Migration Instructions

## Step 1: Run Migrations in Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **hrjcxaaisjukllglbgcs**
3. Navigate to **SQL Editor** (left sidebar)
4. Run **each migration file in order**:

### Migration 1: Initial Schema
Copy all content from `backend/migrations/001_initial_schema.sql` and paste into SQL Editor, then click **Run**.

This creates:
- `users` — employee profiles with roles
- `skill_domains`, `skill_categories`, `skills` — skill taxonomy
- `employee_skills` — user skill matrix
- `projects` — project/RFP records
- `allocations` — employee assignments
- `wish_list` — shortlisted candidates
- And supporting tables for notifications, settings, audit logs

### Migration 2: Notification Preferences
Copy all content from `backend/migrations/002_notification_prefs.sql` and paste into SQL Editor, then click **Run**.

This creates:
- `user_notification_prefs` — per-user notification settings

---

## Step 2: Verify Tables Were Created

After running both migrations:
1. Go to **Database → Tables** in Supabase Dashboard
2. You should see these tables:
   - `users`
   - `skill_domains`
   - `skill_categories`
   - `skills`
   - `employee_skills`
   - `projects`
   - `allocations`
   - `wish_list`
   - `user_notification_prefs`
   - `notifications`
   - `settings`

---

## Step 3: Seed Skill Catalog (Optional)

The skill catalog is optional but recommended for demo purposes:

1. Navigate to **SQL Editor** again
2. Copy the content from `backend/seed/skills.sql`
3. Paste and run it

This populates the skill taxonomy with standard categories (Backend, Frontend, DevOps, Data, etc.).

---

## Troubleshooting

**Error: "relation already exists"**
- The migrations use `CREATE TABLE IF NOT EXISTS`, so re-running them is safe
- Just click **Run** again

**No tables appeared**
- Check the SQL Editor output for errors
- Make sure you're in the correct Supabase project
- Verify your service key has adequate permissions

**PostgREST FK errors in backend**
- These are fixed in the code; all FK hints are in place
- If you see PGRST201 errors, re-run migrations and refresh backend

---

## Next Steps

Once migrations are complete:
1. ✅ Backend server will auto-connect to Supabase
2. ✅ Frontend will authenticate via Supabase Auth
3. ✅ You can start the dev servers

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for running the servers.
