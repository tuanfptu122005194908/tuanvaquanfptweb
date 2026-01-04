import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "TUAN VA QUAN <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusEmailRequest {
  orderId: number;
  customerName: string;
  customerEmail: string;
  newStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: Array<{ code?: string; name: string; price: number }>;
  total: number;
}

const statusLabels: Record<string, { label: string; icon: string; color: string; message: string }> = {
  pending: {
    label: 'Chờ xử lý',
    icon: '⏳',
    color: '#f59e0b',
    message: 'Đơn hàng của bạn đang chờ được xử lý. Chúng tôi sẽ liên hệ với bạn sớm nhất!'
  },
  processing: {
    label: 'Đang xử lý',
    icon: '🔄',
    color: '#3b82f6',
    message: 'Đơn hàng của bạn đang được xử lý. Vui lòng chờ trong giây lát!'
  },
  completed: {
    label: 'Hoàn thành',
    icon: '✅',
    color: '#22c55e',
    message: 'Đơn hàng của bạn đã hoàn thành! Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.'
  },
  cancelled: {
    label: 'Đã hủy',
    icon: '❌',
    color: '#ef4444',
    message: 'Đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.'
  }
};

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + 'đ';
};

const getItemsHtml = (items: Array<{ code?: string; name: string; price: number }>) => {
  return items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.code || '-'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price)}</td>
    </tr>
  `).join('');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: StatusEmailRequest = await req.json();
    console.log('Sending status update email for order:', data.orderId, 'New status:', data.newStatus);

    const statusInfo = statusLabels[data.newStatus];
    if (!statusInfo) {
      throw new Error(`Invalid status: ${data.newStatus}`);
    }

    const updateDate = new Date().toLocaleString('vi-VN', { 
      timeZone: 'Asia/Ho_Chi_Minh',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .status-icon { font-size: 56px; margin-bottom: 10px; }
          h1 { margin: 0; font-size: 24px; }
          .order-id { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 15px; font-size: 14px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-radius: 10px; border-left: 4px solid ${statusInfo.color}; margin-bottom: 20px; }
          .status-badge { display: inline-block; background: ${statusInfo.color}20; color: ${statusInfo.color}; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin: 20px 0; }
          th { background: ${statusInfo.color}; color: white; padding: 12px; text-align: left; }
          th:last-child { text-align: right; }
          .total-row { background: #f0f0f0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .contact-box { background: ${statusInfo.color}; color: white; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="status-icon">${statusInfo.icon}</div>
            <h1>Cập nhật đơn hàng</h1>
            <div class="order-id">Mã đơn: #${data.orderId}</div>
          </div>
          <div class="content">
            <p>Xin chào <strong>${data.customerName}</strong>,</p>
            
            <div class="message-box">
              <p style="margin: 0 0 10px 0;">Trạng thái đơn hàng của bạn đã được cập nhật:</p>
              <span class="status-badge">${statusInfo.icon} ${statusInfo.label}</span>
              <p style="margin: 15px 0 0 0; color: #666;">${statusInfo.message}</p>
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
                <tr class="total-row">
                  <td colspan="2" style="padding: 12px;">TỔNG CỘNG</td>
                  <td style="padding: 12px; text-align: right; font-size: 18px; color: ${statusInfo.color};">${formatPrice(data.total)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="contact-box">
              <p style="margin: 0;">📞 Liên hệ hỗ trợ:</p>
              <p style="margin: 5px 0; font-size: 18px;"><strong>Zalo/SĐT: 0329985669</strong></p>
            </div>
            
            <div class="footer">
              <p>Cập nhật lúc: ${updateDate}</p>
              <p>© 2024 TUAN VA QUAN. Cảm ơn bạn đã tin tưởng!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Sending email to:', data.customerEmail);
    const emailResult = await resend.emails.send({
      from: RESEND_FROM,
      to: [data.customerEmail],
      subject: `${statusInfo.icon} Đơn hàng #${data.orderId} - ${statusInfo.label}`,
      html: emailHtml,
    });
    console.log('Email result:', emailResult);

    if (emailResult?.error) {
      throw new Error(emailResult.error.message);
    }

    return new Response(
      JSON.stringify({ success: true, email: emailResult }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending status email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
