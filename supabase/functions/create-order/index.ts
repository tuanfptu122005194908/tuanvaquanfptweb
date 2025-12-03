import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid Authorization header found');
      return new Response(
        JSON.stringify({ success: false, error: 'Bạn cần đăng nhập để đặt hàng!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);
    
    // Create admin client with service role key for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the JWT token using admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    console.log('Auth result:', { userId: user?.id, error: authError?.message });
    
    if (authError || !user) {
      console.error('Authentication error:', authError?.message || 'No user found');
      return new Response(
        JSON.stringify({ success: false, error: 'Bạn cần đăng nhập để đặt hàng!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    console.log('User authenticated:', user.id, user.email);

    const { items, customerInfo, total, couponCode } = await req.json();
    
    console.log('Order data received:', { itemsCount: items?.length, total, couponCode });

    let discountAmount = 0;
    let finalTotal = total;

    // Validate and apply coupon if provided
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('active', true)
        .single();

      if (couponError || !coupon) {
        console.error('Coupon error:', couponError);
        return new Response(
          JSON.stringify({ success: false, error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check if coupon is expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ success: false, error: 'Mã giảm giá đã hết hạn' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check if coupon has reached max uses
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return new Response(
          JSON.stringify({ success: false, error: 'Mã giảm giá đã hết lượt sử dụng' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check minimum order value
      if (coupon.min_order_value && total < coupon.min_order_value) {
        return new Response(
          JSON.stringify({ success: false, error: `Đơn hàng tối thiểu ${coupon.min_order_value.toLocaleString('vi-VN')}đ để áp dụng mã này` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Calculate discount
      if (coupon.discount_type === 'percentage') {
        discountAmount = Math.round((total * coupon.discount_value) / 100);
      } else {
        discountAmount = coupon.discount_value;
      }

      finalTotal = total - discountAmount;

      // Update coupon usage count
      await supabaseAdmin
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', coupon.id);
        
      console.log('Coupon applied:', { code: couponCode, discount: discountAmount });
    }

    // Create order with timestamp as ID
    const orderId = Date.now();

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: orderId,
        user_id: user.id,
        items,
        customer_info: customerInfo,
        total: finalTotal,
        coupon_code: couponCode || null,
        discount_amount: discountAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return new Response(
        JSON.stringify({ success: false, error: 'Không thể tạo đơn hàng. Vui lòng thử lại!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Order created successfully:', order.id);

    // Update phone if provided and not already set
    if (customerInfo.phone) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      if (!profile?.phone) {
        await supabaseAdmin
          .from('profiles')
          .update({ phone: customerInfo.phone })
          .eq('id', user.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, order }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error('Unexpected error:', error.message, error.stack);
    
    return new Response(
      JSON.stringify({ success: false, error: 'Có lỗi xảy ra khi tạo đơn hàng!' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
