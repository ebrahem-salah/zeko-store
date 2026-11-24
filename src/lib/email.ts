import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT) || 465;
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const fromName = process.env.EMAIL_FROM_NAME || 'منصتي الذكية';
const fromAddress = process.env.EMAIL_FROM_ADDRESS || user || 'noreply@mysaas.com';

function getTransporter() {
  if (!user || !pass) {
    console.warn('⚠️ SMTP_USER or SMTP_PASS not set in .env. Falling back to test logger.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

// 1. Send OTP Verification Email
export async function sendOtpEmail(toEmail: string, userName: string, otpCode: string) {
  const subject = `رمز التحقق الخاص بك: ${otpCode} - ${fromName}`;

  const htmlContent = `
    <div dir="rtl" style="font-family: Arial, Tahoma, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
      <div style="background-color: #1e3a8a; padding: 28px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">${fromName}</h1>
      </div>
      
      <div style="padding: 36px 28px; text-align: right; color: #1e293b;">
        <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">مرحباً ${userName} 👋</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 24px;">
          تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في <strong>${fromName}</strong>. استخدم رمز التحقق التالي لإكمال العملية:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #2563eb; border-radius: 14px; padding: 16px 36px;">
            <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; font-family: monospace;">${otpCode}</span>
          </div>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.6; background-color: #f1f5f9; padding: 12px 16px; rounded: 10px;">
          ⏱️ هذا الرمز صالح للاستخدام لمدة <strong>10 دقائق</strong> فقط. إذا لم تكن أنت من طلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.
        </p>
      </div>

      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; color: #94a3b8; font-size: 12px;">
        جميع الحقوق محفوظة © ${new Date().getFullYear()} ${fromName}.
      </div>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[TEST EMAIL LOG] To: ${toEmail} | OTP Code: ${otpCode}`);
    return { success: true, testMode: true, code: otpCode };
  }

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}

// 2. Send Welcome Email
export async function sendWelcomeEmail(toEmail: string, userName: string) {
  const subject = `أهلاً بك في ${fromName}! 🎉`;

  const htmlContent = `
    <div dir="rtl" style="font-family: Arial, Tahoma, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
      <div style="background-color: #1e3a8a; padding: 28px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">${fromName}</h1>
      </div>
      <div style="padding: 32px 28px; text-align: right; color: #1e293b;">
        <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">أهلاً بك يا ${userName}! 🎉</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.7;">
          سعداء جداً بانضمامك إلى منصتنا. تم إنشاء حسابك وتفعيله بنجاح، ويمكنك الآن الاستمتاع بكافة مميزات المنصة.
        </p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) return { success: true, testMode: true };

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Welcome email failed:', error);
    return { success: false, error: error.message };
  }
}
