# Lectra - Your Personal AI Learning Companion 🚀

Transform your learning experience with **Lectra**, the intelligent AI platform that makes studying smarter, faster, and more personalized. Upload your notes, ask questions, and get instant insights powered by advanced AI.

![Lectra](https://img.shields.io/badge/Lectra-AI%20Learning-1E4E8C?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)

## Features

- **Smart Document Upload**: Upload PDF and TXT files securely to Supabase Storage
- **Personal Dashboard**: Clean, intuitive interface to manage your learning materials
- **AI-Powered Learning**: Get personalized insights from your documents (Phase 2)
- **Secure Authentication**: User authentication with Supabase Auth
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instant feedback and file management

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS with custom Lectra design system
- **Backend**: Supabase (Auth, Database, Storage)
- **UI Components**: Custom components with modern design patterns

## 🚀 Quick Start

> **📖 For detailed setup instructions, see [SETUP.md](SETUP.md)**

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account (free tier works great!)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings → API

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database:**
   Create the `uploads` table in your Supabase database:
   ```sql
   CREATE TABLE uploads (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     filename TEXT NOT NULL,
     file_url TEXT NOT NULL,
     uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Create storage bucket:**
   - Create a bucket named `user-docs` in Supabase Storage
   - Set it to public access

6. **Configure security policies:**
   ```sql
   -- Enable RLS
   ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

   -- Allow users to manage their own uploads
   CREATE POLICY "Users can insert their own uploads" ON uploads
   FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can view their own uploads" ON uploads
   FOR SELECT USING (auth.uid() = user_id);
   ```

### Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access Lectra.

## Design System

### Color Palette
- **Lectra Blue**: `#1E4E8C` - Primary brand color
- **Electric Cyan**: `#3BE3F4` - Secondary accent
- **Soft Lavender**: `#B7A4F6` - Creative accent
- **Background**: `#F8FAFC` (light) / `#0D1117` (dark)
- **Text**: `#1E293B` (primary) / `#64748B` (secondary)

### Typography
- **Headings**: Poppins (SemiBold/Bold)
- **Body**: Inter (Regular/Medium)
- **Mono**: IBM Plex Mono (for technical content)

### UI Components
- **Buttons**: Gradient backgrounds with rounded corners
- **Cards**: Soft shadows with 12px border radius
- **Inputs**: Clean borders with cyan focus states
- **Navigation**: Glassmorphism effect with blur

## Project Structure

```
lectra/
├── lib/
│   └── supabaseClient.ts    # Supabase configuration
├── pages/
│   ├── auth.tsx            # Authentication page
│   └── index.tsx           # Main dashboard
├── components/
│   ├── Navbar.tsx          # Navigation header
│   ├── FileUpload.tsx      # Document upload component
│   └── FileList.tsx        # Uploaded files display
├── styles/
│   └── globals.css         # Global styles and fonts
└── .env.local              # Environment variables
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Lectra** - Learn Smarter with AI
