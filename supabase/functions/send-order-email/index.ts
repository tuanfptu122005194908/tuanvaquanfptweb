import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "TUAN VA QUAN <onboarding@resend.dev>";
const ADMIN_EMAIL = "lequan12305@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  code?: string;
  name: string;
  price: number;
  type: string;
}

interface OrderEmailRequest {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  discountAmount?: number;
  couponCode?: string;
  note?: string;
}

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + 'đ';
};

const getItemsHtml = (items: OrderItem[]) => {
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.code || '-'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
    </tr>
  `).join('');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderEmailRequest = await req.json();
    console.log('Sending order emails for order:', data.orderId);

    const orderDate = new Date().toLocaleString('vi-VN', { 
      timeZone: 'Asia/Ho_Chi_Minh',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Email template for customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          h1 { margin: 0; font-size: 24px; }
          .order-id { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 15px; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin: 20px 0; }
          th { background: #667eea; color: white; padding: 12px; text-align: left; }
          th:last-child { text-align: right; }
          .total-row { background: #f0f0f0; font-weight: bold; }
          .discount-row { color: #22c55e; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .contact-box { background: #667eea; color: white; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Đặt hàng thành công!</h1>
            <div class="order-id">Mã đơn: #${data.orderId}</div>
          </div>
          <div class="content">
            <p>Xin chào <strong>${data.customerName}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng tại <strong>TUAN VA QUAN</strong>! Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.</p>
            
            <h3>📦 Chi tiết đơn hàng</h3>
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Sản phẩm</th>
                  <th style="text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${getItemsHtml(data.items)}
                ${data.discountAmount && data.discountAmount > 0 ? `
                <tr class="discount-row">
                  <td colspan="2" style="padding: 12px; border-bottom: 1px solid #eee;">Giảm giá ${data.couponCode ? `(${data.couponCode})` : ''}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">-${formatPrice(data.discountAmount)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="2" style="padding: 12px;">TỔNG CỘNG</td>
                  <td style="padding: 12px; text-align: right; font-size: 18px; color: #667eea;">${formatPrice(data.total)}</td>
                </tr>
              </tbody>
            </table>

            ${data.note ? `<p><strong>Ghi chú:</strong> ${data.note}</p>` : ''}
            
            <div class="contact-box">
              <p style="margin: 0;">📞 Liên hệ để được hỗ trợ:</p>
              <p style="margin: 5px 0; font-size: 18px;"><strong>Zalo/SĐT: 0329985669</strong></p>
            </div>
            
            <div class="footer">
              <p>Thời gian đặt: ${orderDate}</p>
              <p>© 2024 TUAN VA QUAN. Cảm ơn bạn đã tin tưởng!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email template for admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-icon { font-size: 48px; margin-bottom: 10px; }
          h1 { margin: 0; font-size: 24px; }
          .order-id { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 15px; }
          .customer-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .customer-info h3 { margin-top: 0; color: #f97316; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin: 20px 0; }
          th { background: #f97316; color: white; padding: 12px; text-align: left; }
          th:last-child { text-align: right; }
          .total-row { background: #f0f0f0; font-weight: bold; }
          .discount-row { color: #22c55e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="alert-icon">🔔</div>
            <h1>Đơn hàng mới!</h1>
            <div class="order-id">Mã đơn: #${data.orderId}</div>
          </div>
          <div class="content">
            <div class="customer-info">
              <h3>👤 Thông tin khách hàng</h3>
              <p><strong>Tên:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              <p><strong>SĐT:</strong> ${data.customerPhone}</p>
              ${data.note ? `<p><strong>Ghi chú:</strong> ${data.note}</p>` : ''}
            </div>
            
            <h3>📦 Chi tiết đơn hàng</h3>
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Sản phẩm</th>
                  <th style="text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${getItemsHtml(data.items)}
                ${data.discountAmount && data.discountAmount > 0 ? `
                <tr class="discount-row">
                  <td colspan="2" style="padding: 12px; border-bottom: 1px solid #eee;">Giảm giá ${data.couponCode ? `(${data.couponCode})` : ''}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">-${formatPrice(data.discountAmount)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="2" style="padding: 12px;">TỔNG CỘNG</td>
                  <td style="padding: 12px; text-align: right; font-size: 18px; color: #f97316;">${formatPrice(data.total)}</td>
                </tr>
              </tbody>
            </table>
            
            <p style="text-align: center; color: #666;">Thời gian đặt: ${orderDate}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Resend FROM:', RESEND_FROM);

    // Send email to customer
    console.log('Sending confirmation email to customer:', data.customerEmail);
    const customerEmailResult = await resend.emails.send({
      from: RESEND_FROM,
      to: [data.customerEmail],
      subject: `✅ Đặt hàng thành công - Đơn #${data.orderId}`,
      html: customerEmailHtml,
    });
    console.log('Customer email result:', customerEmailResult);

    // Send notification to admin
    console.log('Sending notification email to admin:', ADMIN_EMAIL);
    const adminEmailResult = await resend.emails.send({
      from: RESEND_FROM,
      to: [ADMIN_EMAIL],
      subject: `🔔 Đơn hàng mới #${data.orderId} - ${data.customerName}`,
      html: adminEmailHtml,
    });
    console.log('Admin email result:', adminEmailResult);

    const success = !customerEmailResult?.error && !adminEmailResult?.error;

    return new Response(
      JSON.stringify({
        success,
        customerEmail: customerEmailResult,
        adminEmail: adminEmailResult,
      }),
      {
        status: success ? 200 : 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending order emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
