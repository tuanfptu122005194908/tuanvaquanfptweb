import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "Tuấn & Quân FPT <onboarding@resend.dev>";
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

const formatPriceForPDF = (price: number) => {
  return price.toLocaleString('vi-VN') + ' VND';
};

// Generate professional PDF invoice
async function generateInvoicePDF(data: OrderEmailRequest): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const { width, height } = page.getSize();
  const margin = 50;
  let yPosition = height - margin;
  
  // Colors
  const primaryColor = rgb(0.4, 0.49, 0.92); // #667eea
  const darkColor = rgb(0.2, 0.2, 0.2);
  const grayColor = rgb(0.5, 0.5, 0.5);
  const lightGray = rgb(0.95, 0.95, 0.95);
  const greenColor = rgb(0.13, 0.77, 0.37);
  
  // ============== HEADER ==============
  // Header background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: primaryColor,
  });
  
  // Company name
  page.drawText('TUAN & QUAN FPT', {
    x: margin,
    y: height - 55,
    size: 28,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  // Tagline
  page.drawText('Dich vu hoc tap chuyen nghiep', {
    x: margin,
    y: height - 80,
    size: 12,
    font: helvetica,
    color: rgb(0.9, 0.9, 0.95),
  });
  
  // Invoice label on right
  page.drawText('HOA DON', {
    x: width - margin - 100,
    y: height - 55,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  page.drawText(`#${data.orderId}`, {
    x: width - margin - 100,
    y: height - 80,
    size: 16,
    font: helvetica,
    color: rgb(1, 1, 1),
  });
  
  yPosition = height - 160;
  
  // ============== DATE & INFO ==============
  const orderDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
  });
  const orderTime = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  page.drawText('Ngay lap:', {
    x: margin,
    y: yPosition,
    size: 10,
    font: helvetica,
    color: grayColor,
  });
  page.drawText(`${orderDate} - ${orderTime}`, {
    x: margin + 55,
    y: yPosition,
    size: 10,
    font: helveticaBold,
    color: darkColor,
  });
  
  yPosition -= 40;
  
  // ============== CUSTOMER INFO BOX ==============
  // Box background
  page.drawRectangle({
    x: margin,
    y: yPosition - 75,
    width: width - margin * 2,
    height: 80,
    color: lightGray,
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
  });
  
  page.drawText('THONG TIN KHACH HANG', {
    x: margin + 15,
    y: yPosition - 5,
    size: 11,
    font: helveticaBold,
    color: primaryColor,
  });
  
  page.drawText('Ho ten:', {
    x: margin + 15,
    y: yPosition - 25,
    size: 10,
    font: helvetica,
    color: grayColor,
  });
  page.drawText(data.customerName, {
    x: margin + 55,
    y: yPosition - 25,
    size: 10,
    font: helveticaBold,
    color: darkColor,
  });
  
  page.drawText('Email:', {
    x: margin + 15,
    y: yPosition - 42,
    size: 10,
    font: helvetica,
    color: grayColor,
  });
  page.drawText(data.customerEmail, {
    x: margin + 55,
    y: yPosition - 42,
    size: 10,
    font: helvetica,
    color: darkColor,
  });
  
  page.drawText('MSSV:', {
    x: margin + 15,
    y: yPosition - 59,
    size: 10,
    font: helvetica,
    color: grayColor,
  });
  page.drawText(data.customerPhone, {
    x: margin + 55,
    y: yPosition - 59,
    size: 10,
    font: helveticaBold,
    color: darkColor,
  });
  
  yPosition -= 115;
  
  // ============== PRODUCTS TABLE ==============
  page.drawText('CHI TIET DON HANG', {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: darkColor,
  });
  
  yPosition -= 25;
  
  // Table header
  const tableWidth = width - margin * 2;
  const colWidths = [60, 280, 100]; // Code, Name, Price
  
  page.drawRectangle({
    x: margin,
    y: yPosition - 20,
    width: tableWidth,
    height: 25,
    color: primaryColor,
  });
  
  page.drawText('Ma', {
    x: margin + 10,
    y: yPosition - 13,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page.drawText('San pham', {
    x: margin + colWidths[0] + 10,
    y: yPosition - 13,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Gia', {
    x: margin + colWidths[0] + colWidths[1] + 20,
    y: yPosition - 13,
    size: 10,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  yPosition -= 25;
  
  // Table rows
  let rowIndex = 0;
  for (const item of data.items) {
    const rowY = yPosition - (rowIndex * 28);
    
    // Alternate row background
    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: rowY - 20,
        width: tableWidth,
        height: 28,
        color: lightGray,
      });
    }
    
    // Row border
    page.drawLine({
      start: { x: margin, y: rowY - 20 },
      end: { x: margin + tableWidth, y: rowY - 20 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
    
    page.drawText(item.code || '-', {
      x: margin + 10,
      y: rowY - 13,
      size: 9,
      font: helveticaBold,
      color: primaryColor,
    });
    
    // Truncate long names
    const itemName = item.name.length > 40 ? item.name.substring(0, 40) + '...' : item.name;
    page.drawText(itemName, {
      x: margin + colWidths[0] + 10,
      y: rowY - 13,
      size: 9,
      font: helvetica,
      color: darkColor,
    });
    
    page.drawText(formatPriceForPDF(item.price), {
      x: margin + colWidths[0] + colWidths[1] + 20,
      y: rowY - 13,
      size: 9,
      font: helveticaBold,
      color: darkColor,
    });
    
    rowIndex++;
  }
  
  yPosition -= (rowIndex * 28) + 10;
  
  // ============== DISCOUNT & TOTAL ==============
  // Discount row (if applicable)
  if (data.discountAmount && data.discountAmount > 0) {
    page.drawLine({
      start: { x: margin + tableWidth - 200, y: yPosition },
      end: { x: margin + tableWidth, y: yPosition },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });
    
    yPosition -= 20;
    
    page.drawText(`Giam gia ${data.couponCode ? `(${data.couponCode})` : ''}:`, {
      x: margin + tableWidth - 200,
      y: yPosition,
      size: 10,
      font: helvetica,
      color: greenColor,
    });
    page.drawText(`-${formatPriceForPDF(data.discountAmount)}`, {
      x: margin + tableWidth - 80,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: greenColor,
    });
    
    yPosition -= 15;
  }
  
  // Total row
  page.drawLine({
    start: { x: margin + tableWidth - 200, y: yPosition },
    end: { x: margin + tableWidth, y: yPosition },
    thickness: 2,
    color: primaryColor,
  });
  
  yPosition -= 25;
  
  page.drawRectangle({
    x: margin + tableWidth - 210,
    y: yPosition - 10,
    width: 220,
    height: 35,
    color: primaryColor,
  });
  
  page.drawText('TONG CONG:', {
    x: margin + tableWidth - 200,
    y: yPosition + 3,
    size: 12,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  page.drawText(formatPriceForPDF(data.total), {
    x: margin + tableWidth - 90,
    y: yPosition + 3,
    size: 14,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  yPosition -= 50;
  
  // ============== NOTE (if any) ==============
  if (data.note) {
    page.drawText('Ghi chu:', {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaBold,
      color: grayColor,
    });
    page.drawText(data.note, {
      x: margin + 50,
      y: yPosition,
      size: 10,
      font: helvetica,
      color: darkColor,
    });
    yPosition -= 30;
  }
  
  // ============== PAYMENT INFO ==============
  yPosition -= 10;
  page.drawRectangle({
    x: margin,
    y: yPosition - 70,
    width: tableWidth,
    height: 80,
    color: rgb(0.98, 0.98, 1),
    borderColor: primaryColor,
    borderWidth: 1,
  });
  
  page.drawText('THONG TIN THANH TOAN', {
    x: margin + 15,
    y: yPosition - 5,
    size: 11,
    font: helveticaBold,
    color: primaryColor,
  });
  
  page.drawText('Chuyen khoan ngan hang: BIDV - 5440888802 - LE QUAN', {
    x: margin + 15,
    y: yPosition - 25,
    size: 10,
    font: helvetica,
    color: darkColor,
  });
  
  page.drawText(`Noi dung CK: MSSV ${data.customerPhone} thanh toan don ${data.orderId}`, {
    x: margin + 15,
    y: yPosition - 42,
    size: 10,
    font: helveticaBold,
    color: darkColor,
  });
  
  page.drawText('Hotline ho tro: 0329985669 (Zalo)', {
    x: margin + 15,
    y: yPosition - 59,
    size: 10,
    font: helvetica,
    color: grayColor,
  });
  
  // ============== FOOTER ==============
  page.drawLine({
    start: { x: margin, y: 80 },
    end: { x: width - margin, y: 80 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  page.drawText('Tuan & Quan FPT - Dich vu hoc tap chuyen nghiep', {
    x: margin,
    y: 60,
    size: 9,
    font: helveticaBold,
    color: grayColor,
  });
  
  page.drawText('Website: tuanvaquanweb.com | Email: support@tuanvaquanweb.com', {
    x: margin,
    y: 45,
    size: 8,
    font: helvetica,
    color: grayColor,
  });
  
  const currentYear = new Date().getFullYear();
  page.drawText(`© ${currentYear} Tuan & Quan FPT. Cam on ban da tin tuong!`, {
    x: width - margin - 220,
    y: 45,
    size: 8,
    font: helvetica,
    color: grayColor,
  });
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

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

    // Generate PDF invoice
    console.log('Generating PDF invoice...');
    let pdfAttachment: { filename: string; content: string } | null = null;
    
    try {
      const pdfBytes = await generateInvoicePDF(data);
      const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));
      pdfAttachment = {
        filename: `hoa-don-${data.orderId}.pdf`,
        content: pdfBase64,
      };
      console.log('PDF invoice generated successfully');
    } catch (pdfError: any) {
      console.error('PDF generation failed:', pdfError.message);
    }

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
          .pdf-notice { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
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
            <p>Cảm ơn bạn đã đặt hàng tại <strong>Tuấn & Quân FPT</strong>! Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.</p>
            
            ${pdfAttachment ? `
            <div class="pdf-notice">
              📎 <strong>Hóa đơn PDF đính kèm</strong> - Vui lòng tải xuống và lưu lại!
            </div>
            ` : ''}
            
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

            <h3>💳 Thông tin thanh toán</h3>
            <table>
              <tr>
                <td style="padding: 10px; background: #f0f0f0;"><strong>Ngân hàng:</strong></td>
                <td style="padding: 10px;">BIDV</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #f0f0f0;"><strong>Số tài khoản:</strong></td>
                <td style="padding: 10px; font-family: monospace; font-size: 16px;"><strong>5440888802</strong></td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #f0f0f0;"><strong>Chủ tài khoản:</strong></td>
                <td style="padding: 10px;">LE QUAN</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #f0f0f0;"><strong>Nội dung CK:</strong></td>
                <td style="padding: 10px; color: #667eea;"><strong>MSSV ${data.customerPhone} thanh toan don ${data.orderId}</strong></td>
              </tr>
            </table>

            ${data.note ? `<p><strong>Ghi chú:</strong> ${data.note}</p>` : ''}
            
            <div class="contact-box">
              <p style="margin: 0;">📞 Liên hệ để được hỗ trợ:</p>
              <p style="margin: 5px 0; font-size: 18px;"><strong>Zalo/SĐT: 0329985669</strong></p>
            </div>
            
            <div class="footer">
              <p>Thời gian đặt: ${orderDate}</p>
              <p>© 2024 Tuấn & Quân FPT. Cảm ơn bạn đã tin tưởng!</p>
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
              <p><strong>MSSV:</strong> ${data.customerPhone}</p>
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

    let customerEmailResult: any = null;
    let adminEmailResult: any = null;

    // Send email to customer with PDF attachment
    try {
      console.log('Sending confirmation email to customer:', data.customerEmail);
      const emailOptions: any = {
        from: RESEND_FROM,
        to: [data.customerEmail],
        subject: `✅ Hóa đơn đặt hàng #${data.orderId} - Tuấn & Quân FPT`,
        html: customerEmailHtml,
      };
      
      if (pdfAttachment) {
        emailOptions.attachments = [pdfAttachment];
      }
      
      customerEmailResult = await resend.emails.send(emailOptions);
      console.log('Customer email result:', customerEmailResult);
    } catch (err: any) {
      console.error('Customer email failed:', err.message);
      customerEmailResult = { error: err.message };
    }

    // Send notification to admin with PDF attachment
    try {
      console.log('Sending notification email to admin:', ADMIN_EMAIL);
      const adminEmailOptions: any = {
        from: RESEND_FROM,
        to: [ADMIN_EMAIL],
        subject: `🔔 Đơn hàng mới #${data.orderId} - ${data.customerName} - ${formatPrice(data.total)}`,
        html: adminEmailHtml,
      };
      
      if (pdfAttachment) {
        adminEmailOptions.attachments = [pdfAttachment];
      }
      
      adminEmailResult = await resend.emails.send(adminEmailOptions);
      console.log('Admin email result:', adminEmailResult);
    } catch (err: any) {
      console.error('Admin email failed:', err.message);
      adminEmailResult = { error: err.message };
    }

    // Success if at least admin email was sent
    const adminSuccess = adminEmailResult?.data?.id && !adminEmailResult?.error;

    return new Response(
      JSON.stringify({
        success: adminSuccess,
        customerEmail: customerEmailResult,
        adminEmail: adminEmailResult,
        pdfGenerated: !!pdfAttachment,
        note: customerEmailResult?.error ? 'Cần xác minh domain tại resend.com/domains để gửi email cho khách hàng' : null,
      }),
      {
        status: 200,
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
