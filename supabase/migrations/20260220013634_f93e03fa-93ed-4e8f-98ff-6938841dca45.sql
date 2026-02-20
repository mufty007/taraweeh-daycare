
-- Children registered via Google Form (synced periodically)
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT, -- ID from Google Sheet
  child_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL DEFAULT '',
  parent_email TEXT NOT NULL DEFAULT '',
  allergies_notes TEXT NOT NULL DEFAULT 'None',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Public access for staff (no auth required)
CREATE POLICY "Anyone can read children" ON public.children FOR SELECT USING (true);
CREATE POLICY "Anyone can insert children" ON public.children FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update children" ON public.children FOR UPDATE USING (true);

-- Daily attendance records
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL DEFAULT '',
  check_in_time TEXT,
  dropped_off_by TEXT,
  check_out_time TEXT,
  picked_up_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, child_id)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Anyone can insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete attendance" ON public.attendance FOR DELETE USING (true);

-- Enable realtime for attendance so multiple devices see updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
