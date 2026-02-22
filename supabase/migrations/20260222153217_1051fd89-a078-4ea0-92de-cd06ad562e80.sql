
-- Table to track spin requests and results
CREATE TABLE public.spin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, completed, denied
  prize_value integer NULL, -- 10000, 20000, 30000, 40000, 50000
  coupon_code text NULL, -- generated coupon code after spin
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone NULL,
  completed_at timestamp with time zone NULL
);

ALTER TABLE public.spin_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own spin requests
CREATE POLICY "Users can create spin requests"
ON public.spin_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own spin requests
CREATE POLICY "Users can view own spin requests"
ON public.spin_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all spin requests
CREATE POLICY "Admins can view all spin requests"
ON public.spin_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update spin requests (approve/deny)
CREATE POLICY "Admins can update spin requests"
ON public.spin_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can update their own approved requests (to mark as completed)
CREATE POLICY "Users can complete approved spins"
ON public.spin_requests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'approved');

-- Admins can delete spin requests
CREATE POLICY "Admins can delete spin requests"
ON public.spin_requests FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_spin_requests_updated_at
BEFORE UPDATE ON public.spin_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.spin_requests;
