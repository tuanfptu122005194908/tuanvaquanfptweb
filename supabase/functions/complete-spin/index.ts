import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bạn cần đăng nhập!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bạn cần đăng nhập!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { spinRequestId, prizeValue } = await req.json();

    if (!spinRequestId || !prizeValue) {
      return new Response(
        JSON.stringify({ success: false, error: 'Dữ liệu không hợp lệ!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Only allow 10k or 20k prizes
    const allowedPrizes = [10000, 20000];
    if (!allowedPrizes.includes(prizeValue)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Giá trị giải thưởng không hợp lệ!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify spin request belongs to user and is approved
    const { data: spinRequest, error: spinError } = await supabaseAdmin
      .from('spin_requests')
      .select('*')
      .eq('id', spinRequestId)
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single();

    if (spinError || !spinRequest) {
      return new Response(
        JSON.stringify({ success: false, error: 'Yêu cầu quay không hợp lệ!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Generate coupon code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let couponCode = "SPIN";
    for (let i = 0; i < 6; i++) {
      couponCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create coupon with admin privileges
    const { error: couponError } = await supabaseAdmin.from('coupons').insert({
      code: couponCode,
      discount_type: 'fixed',
      discount_value: prizeValue,
      min_order_value: 0,
      max_uses: 1,
      active: true,
    });

    if (couponError) {
      console.error('Coupon creation error:', couponError);
      return new Response(
        JSON.stringify({ success: false, error: 'Không thể tạo mã giảm giá!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update spin request as completed
    await supabaseAdmin
      .from('spin_requests')
      .update({
        status: 'completed',
        prize_value: prizeValue,
        coupon_code: couponCode,
        completed_at: new Date().toISOString(),
      })
      .eq('id', spinRequestId);

    return new Response(
      JSON.stringify({ success: true, couponCode, prizeValue }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: 'Có lỗi xảy ra!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
