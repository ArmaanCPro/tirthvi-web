-- Simple notification system without events_cache table
-- Events are read directly from JSON files in the Edge Function

-- Create a table to track sent notifications (prevent duplicates)
CREATE TABLE IF NOT EXISTS public.notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_slug TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'reminder',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_slug, user_id, event_date, notification_type)
);

-- Enable RLS for notification_history
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for notification_history
CREATE POLICY "Service role can manage notification history" ON public.notification_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to read their own notification history
CREATE POLICY "Users can read their own notification history" ON public.notification_history
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Schedule the cron job to run daily at 9 AM UTC
-- This will call the Edge Function to process notifications
SELECT cron.schedule(
    'daily-event-notifications',
    '0 9 * * *', -- 9 AM daily
    'SELECT net.http_post(
        url := ''https://your-project-ref.supabase.co/functions/v1/process-notifications'',
        headers := jsonb_build_object(
            ''Content-Type'', ''application/json'',
            ''Authorization'', ''Bearer '' || current_setting(''app.settings.service_role_key'', true)
        ),
        body := ''{}''::jsonb
    );'
);

-- Create a function to manually trigger notifications (for testing)
CREATE OR REPLACE FUNCTION public.trigger_notifications_now()
RETURNS void AS $$
BEGIN
    PERFORM net.http_post(
        url := 'https://your-project-ref.supabase.co/functions/v1/process-notifications',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := '{}'::jsonb
    );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Grant execute permissions to service role for cron jobs
GRANT EXECUTE ON FUNCTION public.trigger_notifications_now() TO service_role;
