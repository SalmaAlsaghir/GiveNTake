# 🚀 Quick Start Guide - GiveNTake Platform

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works!)
- (Optional) Google AI API key for AI features

---

## 🏃‍♂️ Quick Setup (5 minutes)

### 1. Clone & Install
```bash
# If starting fresh, ensure you're in the project directory
cd GiveNTake

# Install dependencies
npm install
```

### 2. Set Up Supabase

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to initialize (~2 minutes)

#### Run Database Setup
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire content from `SUPABASE_SETUP.md`
3. Paste and run it
4. Copy the entire content from `create_wishlist_table.sql`
5. Paste and run it

#### Get API Keys
1. Go to Project Settings → API
2. Copy:
   - Project URL
   - anon public key
   - service_role key (keep secret!)

### 3. Configure Environment

Create `.env.local` in the project root:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google AI (Optional - for AI listing generation)
NEXT_PUBLIC_GOOGLE_API_KEY=your-google-ai-key
```

### 4. Disable Email Confirmation (Development)
1. Supabase Dashboard → Authentication → Settings
2. Turn OFF "Enable email confirmations"
3. This allows instant sign-up without email verification

### 5. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📱 First Steps to Test

### 1. Create an Account
- Go to `/signup`
- Enter email, username, password
- You'll be logged in automatically

### 2. Post a Listing
- Click "Post a Listing" in sidebar
- Upload 1-3 images
- (Optional) Click "Generate with AI" for auto-fill
- Fill in details and submit

### 3. Browse & Search
- Homepage shows all listings
- Use search bar to filter
- Click categories in sidebar
- View listing details

### 4. Create a Wishlist Item
- Click "Wishlist" in sidebar
- Click "Post Your Wishlist"
- Fill in what you're looking for
- Others can contact you if they have it

### 5. Create a Collection
- Go to Collections page
- Click "Create Collection"
- Give it a title and description
- Add listings to it when creating/editing listings

---

## 🔑 Key Features to Test

### Marketplace
- ✅ Browse listings
- ✅ Search and filter
- ✅ Category browsing
- ✅ Create/edit listings
- ✅ AI-powered generation
- ✅ Multiple image upload
- ✅ Contact seller

### Wishlist
- ✅ Post wanted items
- ✅ Browse wishlist
- ✅ Contact people with items
- ✅ Mark as fulfilled

### Collections
- ✅ Group related items
- ✅ Browse collections
- ✅ View collection details

### User Features
- ✅ Profile page
- ✅ Settings
- ✅ My Listings
- ✅ My Wishlist

---

## 🎨 Customization

### Change Colors
Edit `src/app/globals.css`:
```css
--primary: 262 83% 63%; /* Purple */
--secondary: 189 92% 69%; /* Aqua */
--accent: 43 96% 56%; /* Yellow */
```

### Add Categories
Run SQL in Supabase:
```sql
INSERT INTO categories (name, slug) VALUES
('Your Category', 'your-category');
```

### Modify Hero Sections
Each page has a hero section - look for:
```tsx
<section className="bg-gradient-to-br from-pink-100 to-purple-100...">
```

---

## 🐛 Troubleshooting

### "Failed to load listings"
- Check Supabase is running
- Verify `.env.local` has correct keys
- Run database migrations from `SUPABASE_SETUP.md`

### "Profile not found"
- Make sure you ran the profiles table setup
- Sign out and sign in again

### "AI generation not working"
- Add `NEXT_PUBLIC_GOOGLE_API_KEY` to `.env.local`
- Get key from [Google AI Studio](https://aistudio.google.com/)
- Restart dev server after adding env variable

### Images not uploading
- Check Supabase Storage is enabled
- Verify bucket permissions in Supabase dashboard
- Storage → Create "listing-images" bucket if missing

### CSS not applying
- Run `npm install` again
- Check `tailwind.config.ts` exists
- Restart dev server

---

## 📚 Project Structure

```
src/
├── app/                  # Next.js pages
│   ├── page.tsx         # Homepage (browse)
│   ├── listings/        # Listing details
│   ├── list/            # Create/edit listings
│   ├── collections/     # Collections
│   ├── wishlist/        # Wishlist feature
│   ├── my-listings/     # User's listings
│   ├── settings/        # User settings
│   └── stats/           # Statistics
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn components
│   ├── app-layout.tsx  # Main layout
│   └── listing-card.tsx
├── context/             # React contexts
│   └── auth-context.tsx
├── lib/                 # Utilities & services
│   ├── supabaseClient.ts
│   ├── listings-service.ts
│   ├── wishlist-service.ts
│   └── types.ts
└── ai/                  # AI features (Genkit)
    └── flows/
```

---

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Option 2: Other Platforms
Works on:
- Netlify
- Railway
- Render
- AWS Amplify

Just add the environment variables and deploy!

---

## 🆘 Need Help?

### Documentation Files
- `SUPABASE_SETUP.md` - Database setup
- `WISHLIST_SETUP.md` - Wishlist feature
- `AI_IMPLEMENTATION_SUMMARY.md` - AI details
- `PLATFORM_COMPLETE_SUMMARY.md` - Full feature list
- `PRE_LAUNCH_CHECKLIST.md` - Launch checklist

### Common Issues
Most issues are due to:
1. Missing environment variables
2. Database not set up
3. Supabase project not initialized

**Happy coding! 🎉**
