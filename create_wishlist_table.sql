-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    budget DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    condition VARCHAR(50),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active wishlist items
CREATE POLICY "Wishlist items are viewable by everyone"
    ON wishlist FOR SELECT
    USING (is_active = true);

-- Policy: Users can insert their own wishlist items
CREATE POLICY "Users can insert their own wishlist items"
    ON wishlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own wishlist items
CREATE POLICY "Users can update their own wishlist items"
    ON wishlist FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own wishlist items
CREATE POLICY "Users can delete their own wishlist items"
    ON wishlist FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_category_id ON wishlist(category_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_is_active ON wishlist(is_active);
