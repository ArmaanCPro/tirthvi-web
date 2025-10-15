-- Add scripture downloads tracking table
CREATE TABLE IF NOT EXISTS scripture_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scripture_slug TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month TEXT NOT NULL, -- YYYY-MM format for monthly tracking
  year INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scripture_downloads_user_id ON scripture_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_scripture_downloads_month_year ON scripture_downloads(month, year);
CREATE INDEX IF NOT EXISTS idx_scripture_downloads_user_month ON scripture_downloads(user_id, month, year);

-- Enable RLS
ALTER TABLE scripture_downloads ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for scripture_downloads
CREATE POLICY "Users can only access their own download records" ON scripture_downloads
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
