-- Add clothes category
INSERT INTO public.categories (name, slug) VALUES ('Clothes', 'clothes') ON CONFLICT (name) DO NOTHING;

-- Update existing listings that have 'like-new' condition to 'good'
UPDATE public.listings SET condition = 'good' WHERE condition = 'like-new';

-- Update the condition enum to remove 'like-new'
-- Note: This requires recreating the enum type since PostgreSQL doesn't allow removing enum values directly
-- First, create a new enum type without 'like-new'
CREATE TYPE item_condition_new AS ENUM ('new', 'good', 'fair');

-- Update the listings table to use the new enum
ALTER TABLE public.listings 
  ALTER COLUMN condition TYPE item_condition_new 
  USING condition::text::item_condition_new;

-- Drop the old enum type
DROP TYPE item_condition;

-- Rename the new enum type to the original name
ALTER TYPE item_condition_new RENAME TO item_condition;
