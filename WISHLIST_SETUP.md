# Wishlist Feature Setup

## Database Setup

To set up the wishlist feature, you need to run the SQL migration in your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Open the file `create_wishlist_table.sql` from the root of this project
4. Copy and paste the SQL into the editor
5. Click "Run" to execute the migration

This will:
- Create the `wishlist` table with all necessary columns
- Set up Row Level Security (RLS) policies so users can:
  - View all active wishlist items
  - Create their own wishlist items
  - Update/delete only their own items
- Add foreign key relationships to users and categories

## Feature Overview

The wishlist feature allows students to post items they're looking for. Other students who have those items can contact them via email or phone.

### Pages Created:

1. **Browse Wishlist** (`/wishlist`) - View all wishlist items from other students
2. **Post Wishlist Item** (`/wishlist/new`) - Create a new wishlist post
3. **My Wishlist** (`/wishlist/my-wishlist`) - Manage your own wishlist items

### Navigation:
- "Wishlist" link in sidebar - Browse all wishlist items
- "My Wishlist" link in sidebar (authenticated users only) - Manage your items

### Features:
- Search and filter wishlist items
- Post items you're looking for with budget, condition, location
- Contact people via email or phone if you have what they need
- Mark items as fulfilled when found
- Delete your own wishlist items
