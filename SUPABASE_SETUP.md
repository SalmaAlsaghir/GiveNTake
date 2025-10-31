# Supabase Backend Setup Guide

This guide will help you set up the Supabase backend for your GiveNTake application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Your Next.js project ready

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - Project name: `giventake-app` (or your preferred name)
   - Database password: Choose a strong password
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (use for `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public key** (use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (use for `SUPABASE_SERVICE_ROLE_KEY` - keep this secret!)

## Step 3: Configure Authentication Settings

### For Development (Recommended):
1. Go to **Authentication** > **Settings**
2. Turn OFF **"Enable email confirmations"**
3. This allows immediate sign-in after signup

### For Production:
1. Keep **"Enable email confirmations"** ON
2. Configure your email provider in **Authentication** > **Email Templates**
3. Set up proper email templates for verification

## Step 4: Set Up Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google AI Configuration (Optional - for AI features)
# Use either NEXT_PUBLIC_GOOGLE_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY
NEXT_PUBLIC_GOOGLE_API_KEY=your-google-api-key-here
# OR
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

3. Replace the placeholder values with your actual keys

### Getting Google API Key (Optional - for AI features):

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env.local` file as either:
   - `NEXT_PUBLIC_GOOGLE_API_KEY=your-key` (preferred)
   - `NEXT_PUBLIC_GEMINI_API_KEY=your-key` (alternative)
4. The AI generation feature will work automatically once configured

## Step 5: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Enable uuid generator
create extension if not exists "pgcrypto";

-----------------------
-- Profiles (public)
-----------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  phone_number text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "public_select_profiles" on public.profiles for select using (true);
create policy "users_update_own_profile" on public.profiles for update using (auth.uid() = id);
create policy "users_insert_own_profile" on public.profiles for insert with check (auth.uid() = id);

-----------------------
-- Categories
-----------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

alter table public.categories enable row level security;
create policy "public_select_categories" on public.categories for select using (true);

insert into public.categories (name, slug) values
('Textbooks','textbooks'),
('Electronics','electronics'),
('Dorm Essentials','dorm-essentials'),
('Accessories','accessories'),
('Clothes','clothes');

-----------------------
-- Enum: item_condition
-----------------------
create type item_condition as enum ('new', 'like-new', 'good', 'fair');

-----------------------
-- Listings
-----------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric(10,2) not null,
  currency text not null default 'AED',
  condition item_condition not null,
  category_id uuid not null references public.categories(id),
  location text,
  created_at timestamptz default now(),
  is_active boolean default true
);

alter table public.listings enable row level security;

create policy "public_view_active_listings" on public.listings for select using (is_active = true);
create policy "authenticated_can_insert_listing" on public.listings for insert with check (auth.uid() = user_id);
create policy "owner_can_update" on public.listings for update using (auth.uid() = user_id);
create policy "owner_can_delete" on public.listings for delete using (auth.uid() = user_id);

-----------------------
-- Listing images
-----------------------
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  created_at timestamptz default now()
);

alter table public.listing_images enable row level security;

create policy "public_select_images" on public.listing_images for select using (true);
create policy "owner_can_insert_images" on public.listing_images for insert with check (
  auth.uid() = (select user_id from public.listings where id = listing_id)
);
create policy "owner_can_delete_images" on public.listing_images for delete using (
  auth.uid() = (select user_id from public.listings where id = listing_id)
);
```

### Collections (New Feature)

Run this additional SQL to enable Collections and linking listings to a collection:

```sql
-- Collections table
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now()
);

alter table public.collections enable row level security;

-- Public can view collections
create policy if not exists "public_select_collections" on public.collections for select using (true);

-- Owners can insert/update/delete their collections
create policy if not exists "owner_insert_collection" on public.collections for insert with check (auth.uid() = user_id);
create policy if not exists "owner_update_collection" on public.collections for update using (auth.uid() = user_id);
create policy if not exists "owner_delete_collection" on public.collections for delete using (auth.uid() = user_id);

-- Link listings to collections
alter table public.listings add column if not exists collection_id uuid references public.collections(id) on delete set null;

-- Optional: expose listing status (if not already present)
alter table public.listings add column if not exists status text default 'available';

-- Update public view policy to allow selecting all active listings
drop policy if exists "public_view_active_listings" on public.listings;
create policy "public_view_active_listings" on public.listings for select using (is_active = true);
```

4. Click "Run" to execute the SQL

## Step 6: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click "Create new bucket"
3. Name it: `listing-images`
4. Set it as **Public** (for easier image access)
5. Click "Create bucket"

## Step 7: Install Dependencies

Run the following command in your project directory:

```bash
npm install @supabase/supabase-js
```

## Step 8: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to:
   - Sign up a new account
   - Log in with the account
   - Create a new listing
   - Browse listings

## Email Verification Troubleshooting

### If you get "auth session missing" error:

1. **For Development**: Disable email verification in Supabase Dashboard
   - Go to **Authentication** > **Settings**
   - Turn OFF **"Enable email confirmations"**

2. **For Production**: Handle email verification properly
   - Keep email verification ON
   - Users will receive verification emails
   - Click the verification link to activate account

### If users can't sign in after signup:

1. Check if email verification is required
2. Look for verification emails in spam folder
3. Use the "Resend Verification Email" button in the app
4. Or manually verify the user in Supabase Dashboard:
   - Go to **Authentication** > **Users**
   - Find the user and click "Verify"

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**: Double-check your environment variables are correct
2. **"RLS policy violation"**: Make sure you're logged in when creating listings
3. **Image upload fails**: Check that the storage bucket is created and public
4. **Categories not loading**: Verify the SQL schema was executed successfully
5. **"auth session missing"**: Check email verification settings
6. **Browse pages keep loading**: Check database connection and RLS policies
7. **AI generation fails**: Check Google API key configuration

### Specific Issue Fixes:

#### Categories Not Displaying in "Post a Listing":
1. Check browser console for errors
2. Verify the SQL schema was executed (especially the categories insert)
3. Check if categories table exists in Supabase dashboard
4. Ensure RLS policies are set correctly

#### AI Generation Failing:
1. Add `NEXT_PUBLIC_GOOGLE_API_KEY` to your `.env.local`
2. Get API key from [Google AI Studio](https://aistudio.google.com/)
3. Restart your development server after adding the key
4. The feature will show "AI Generation Unavailable" if not configured

#### Browse Pages Not Loading:
1. Check browser console for database errors
2. Verify all tables were created successfully
3. Check RLS policies are not blocking public access
4. Ensure the `is_active` column exists in listings table

#### Foreign Key Constraint Error:
1. Run the additional SQL policy for profile creation:
   ```sql
   create policy "users_insert_own_profile" on public.profiles for insert with check (auth.uid() = id);
   ```
2. Check if the user profile exists in the profiles table
3. Verify RLS policies are set correctly for profiles table

### Debug Tips:

1. Check the browser console for error messages
2. Check the Supabase dashboard logs for server-side errors
3. Verify your environment variables are loaded correctly
4. Make sure you're using the latest version of `@supabase/supabase-js`
5. Check the Authentication > Users section in Supabase dashboard
6. Look for console logs from the ListingsService for debugging info

## Security Notes

- Never commit your `.env.local` file to version control
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used in server-side code
- Row Level Security (RLS) is enabled by default for data protection
- All user data is automatically cleaned up when users are deleted
- For production, always enable email verification

### Optional: Admin Moderation (Delete Any Listing)

To allow designated admins to delete any listing (not just their own), configure an admin email allowlist and add an RLS policy:

1. Set a Postgres config variable with admin emails (comma-separated):

```sql
-- Replace with your admin emails
select set_config('app.admin_emails', 'alice@nyu.edu,bob@nyu.edu', true);
```

2. Create a helper function to check if the current user is an admin:

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
   select exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
         and lower(p.email) = any (string_to_array(lower(current_setting('app.admin_emails', true)), ','))
   );
$$;
```

3. Grant delete permission to admins on listings and their images:

```sql
-- Allow admins to delete any listing
create policy if not exists "admin_can_delete_listings"
on public.listings for delete
using (public.is_admin());

-- Allow admins to delete any listing image
create policy if not exists "admin_can_delete_listing_images"
on public.listing_images for delete
using (public.is_admin());
```

With these policies, UI actions gated for admins will succeed server-side under RLS.

## Next Steps

Once your backend is working:

1. Test all CRUD operations (Create, Read, Update, Delete)
2. Test image uploads
3. Test user authentication flows
4. Consider adding email verification for production
5. Set up proper error handling and user feedback
6. Deploy to production (Vercel recommended)

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [Supabase Community](https://github.com/supabase/supabase/discussions)
3. Check your project's logs in the Supabase dashboard
