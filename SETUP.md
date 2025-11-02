# Lectra - Setup Guide

Welcome to **Lectra**, your personal AI learning companion! This guide will help you get the application up and running.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- A **Supabase** account - [Sign up free](https://supabase.com)

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in your project details
   - Wait for the project to be ready

2. **Get Your API Credentials:**
   - Navigate to **Settings → API** in your Supabase dashboard
   - Find your **Project URL** and **anon/public key**

3. **Create Environment File:**
   - Copy `.env.example` to `.env.local`:
     ```bash
     copy .env.example .env.local
     ```
   - Open `.env.local` and add your credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```

### Step 3: Set Up Database

Run these SQL commands in your Supabase SQL Editor (**Database → SQL Editor → New Query**):

```sql
-- Create uploads table
CREATE TABLE uploads (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can insert their own uploads" 
ON uploads FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own uploads" 
ON uploads FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" 
ON uploads FOR DELETE 
USING (auth.uid() = user_id);
```

### Step 4: Set Up Storage

1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Name it: `user-docs`
4. Set it to **Public** bucket
5. Click **Create**

#### Configure Storage Policies:

Go to **Storage → Policies** and add these policies for the `user-docs` bucket:

**Insert Policy:**
```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Select Policy:**
```sql
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-docs');
```

**Delete Policy:**
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 5: Run the Application

#### Development Mode:
```bash
npm run dev
```

Visit **http://localhost:3000** to see Lectra in action! 🎉

#### Production Mode:
```bash
npm run build
npm start
```

## 🎨 Design System

### Brand Colors
- **Lectra Blue**: `#1E4E8C` - Primary brand color
- **Electric Cyan**: `#3BE3F4` - Secondary accent
- **Soft Lavender**: `#B7A4F6` - Creative accent

### Typography
- **Headings**: Poppins (SemiBold/Bold)
- **Body**: Inter (Regular/Medium)

## 📁 Project Structure

```
lectra/
├── components/
│   ├── FileList.tsx       # Display uploaded documents
│   ├── FileUpload.tsx     # Document upload interface
│   └── Navbar.tsx         # Navigation bar
├── lib/
│   └── supabaseClient.ts  # Supabase configuration
├── pages/
│   ├── auth.tsx           # Authentication page
│   └── index.tsx          # Main dashboard
├── styles/
│   └── globals.css        # Global styles
├── .env.example           # Environment template
├── .env.local             # Your credentials (create this)
└── package.json           # Dependencies
```

## 🔧 Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## ✅ Verification Checklist

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] `.env.local` file created with valid credentials
- [ ] Database table `uploads` created
- [ ] Storage bucket `user-docs` created
- [ ] Storage policies configured
- [ ] Application runs without errors

## 🐛 Troubleshooting

### Issue: "Invalid API key" error
**Solution:** Double-check your `.env.local` file has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Issue: Can't upload files
**Solution:** 
1. Verify the `user-docs` bucket exists and is public
2. Check storage policies are correctly set
3. Ensure Row Level Security is enabled on the `uploads` table

### Issue: Build fails
**Solution:** 
1. Delete `.next` folder: `rm -r .next -Force`
2. Reinstall dependencies: `npm install`
3. Run build again: `npm run build`

### Issue: Authentication doesn't work
**Solution:**
1. Check your Supabase URL is correct
2. Verify email confirmations are disabled for development (Settings → Authentication → Email Auth)
3. Check browser console for errors

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the Supabase dashboard for error logs
3. Check the browser console for JavaScript errors
4. Verify all environment variables are set correctly

---

**Lectra** - Learn Smarter with AI 🚀
