-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

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

-- Create a table to store event data for the Edge Function
CREATE TABLE IF NOT EXISTS public.events_cache (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    occurrences JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to populate events cache (called by your Next.js app)
CREATE OR REPLACE FUNCTION public.update_events_cache()
RETURNS void AS $$
BEGIN
    -- This function will be called by your Next.js app
    -- to keep the events cache up to date
    RAISE NOTICE 'Events cache update requested';
END;
$$ LANGUAGE plpgsql;

-- Function to check if an event is happening tomorrow
CREATE OR REPLACE FUNCTION public.is_event_tomorrow(event_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    tomorrow DATE := CURRENT_DATE + INTERVAL '1 day';
    tomorrow_str TEXT := to_char(tomorrow, 'YYYY-MM-DD');
    event_occurrences JSONB;
    year_data JSONB;
    occurrence JSONB;
BEGIN
    -- Get the event's occurrences from the cache
    SELECT occurrences INTO event_occurrences
    FROM public.events_cache
    WHERE slug = event_slug;
    
    IF event_occurrences IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check each year's occurrences
    FOR year_data IN SELECT jsonb_array_elements(jsonb_array_elements(event_occurrences))
    LOOP
        -- Check if any occurrence matches tomorrow's date
        IF year_data->>'date' = tomorrow_str THEN
            RETURN TRUE;
        END IF;
    END LOOP;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming events for tomorrow
CREATE OR REPLACE FUNCTION public.get_tomorrows_events()
RETURNS TABLE(
    event_slug TEXT,
    event_name TEXT,
    event_description TEXT,
    event_date DATE,
    subscribers JSONB
) AS $$
DECLARE
    event_record RECORD;
    tomorrow DATE := CURRENT_DATE + INTERVAL '1 day';
    tomorrow_str TEXT := to_char(tomorrow, 'YYYY-MM-DD');
    subscriber_list JSONB;
BEGIN
    -- Get all events that are happening tomorrow
    FOR event_record IN
        SELECT 
            ec.slug,
            ec.name,
            ec.description,
            ec.occurrences
        FROM public.events_cache ec
        WHERE public.is_event_tomorrow(ec.slug)
    LOOP
        -- Get all subscribers for this event
        SELECT jsonb_agg(
            jsonb_build_object(
                'user_id', es.user_id,
                'email', p.email,
                'first_name', p.first_name,
                'last_name', p.last_name
            )
        ) INTO subscriber_list
        FROM public.event_subscriptions es
        JOIN public.profiles p ON es.user_id = p.id
        WHERE es.event_slug = event_record.slug
        AND es.notification_enabled = true;
        
        -- Return the event with its subscribers
        RETURN QUERY SELECT 
            event_record.slug,
            event_record.name,
            event_record.description,
            tomorrow,
            subscriber_list;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule the cron job to run daily at 9 AM UTC
-- This will call the Edge Function to process notifications
-- Note: You'll need to set the edge_function_url in your Supabase settings
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

-- Optional: Create a function to manually trigger notifications (for testing)
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
$$ LANGUAGE plpgsql;
