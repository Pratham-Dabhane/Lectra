# Supabase Setup Guide - Lectra Project

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to: https://supabase.com/dashboard/projects
2. Click "New Project"
3. Fill in:
   - **Name:** Lectra
   - **Database Password:** (choose a strong password, save it!)
   - **Region:** Choose closest to you
4. Click "Create new project" (takes 2-3 minutes)

---

### Step 2: Get API Credentials

1. In your project dashboard, click "Settings" (gear icon on left)
2. Click "API" in the sidebar
3. Copy these values:

   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (long JWT token)

---

### Step 3: Update Environment Variables

#### **Frontend (.env.local)**

Update `C:\Pra_programming\Projects\lectra\.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

#### **Backend (backend/.env)**

Update `C:\Pra_programming\Projects\lectra\backend\.env`:

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=YOUR_ANON_KEY_HERE
```

---

### Step 4: Set Up Storage Bucket

1. In Supabase dashboard, click "Storage" (left sidebar)
2. Click "Create a new bucket"
3. Fill in:
   - **Name:** `user-files`
   - **Public bucket:** ✅ Check this (so files are accessible)
4. Click "Create bucket"

---

### Step 5: Set Up Authentication

1. Click "Authentication" → "Providers" (left sidebar)
2. **Enable Email provider:**
   - Click "Email"
   - Toggle "Enable Email provider" ON
   - Toggle "Confirm email" OFF (for testing)
   - Click "Save"

3. **Optional - Add Google OAuth:**
   - Click "Google"
   - Follow instructions to get Google OAuth credentials
   - Paste Client ID and Secret
   - Click "Save"

---

### Step 6: Restart Your Servers

```powershell
# Kill all existing processes
taskkill /F /IM node.exe /T
taskkill /F /IM python.exe /T

# Start Backend (Terminal 1)
cd C:\Pra_programming\Projects\lectra\backend
.venv\Scripts\Activate.ps1
uvicorn main:app --reload

# Start Frontend (Terminal 2)
cd C:\Pra_programming\Projects\lectra
npm run dev
```

---

### Step 7: Test Everything

1. **Open:** http://localhost:3000/auth
2. **Sign up** with email/password
3. **Check browser console** - should see no errors
4. **Upload a file** on home page
5. **Go to chat** and ask a question

---

## 🐛 Troubleshooting

### "Failed to fetch" Error
- ✅ Verify Supabase project is **Active** (not paused)
- ✅ Check `.env.local` has correct URL and key
- ✅ Restart Next.js server after changing `.env.local`

### "Storage bucket not found"
- ✅ Create `user-files` bucket in Supabase Storage
- ✅ Make it **public**

### "Invalid API key"
- ✅ Copy the **anon public** key, not service_role key
- ✅ Make sure there are no extra spaces in `.env` files

---

## 📝 Your Current Credentials

**Old Project (Paused):**
- URL: `https://pdbbgsqaoayxhtmrpscz.supabase.co`
- Status: ⏸️ Paused (inactive for 15 days)

**Action Required:**
1. Restore old project, OR
2. Create new project and update `.env` files

---

## 🔐 Security Notes

- ✅ `.env.local` and `backend/.env` are in `.gitignore`
- ✅ Never commit API keys to GitHub
- ✅ Use `.env.example` files as templates only
- ✅ Supabase free tier auto-pauses after 1 week of inactivity

---

## ✅ Checklist

After setup, verify:
- [ ] Supabase project is Active
- [ ] Both `.env` files updated
- [ ] Storage bucket `user-files` created (public)
- [ ] Email auth enabled
- [ ] Can sign up/login at `/auth`
- [ ] Can upload files
- [ ] Can ask questions in chat
