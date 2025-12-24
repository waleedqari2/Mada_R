import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured, skipping email send');
      return false;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send request approval notification
 */
export async function sendApprovalEmail(
  to: string,
  requestNumber: string,
  requesterName: string
): Promise<boolean> {
  const subject = `موافقة على طلب الصرف ${requestNumber}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #1e3a5f;">تمت الموافقة على الطلب</h2>
      <p>السلام عليكم ورحمة الله وبركاته،</p>
      <p>تم الموافقة على طلب الصرف التالي:</p>
      <ul>
        <li><strong>رقم الطلب:</strong> ${requestNumber}</li>
        <li><strong>مقدم الطلب:</strong> ${requesterName}</li>
      </ul>
      <p>يمكنك مراجعة تفاصيل الطلب من خلال نظام إدارة طلبات الصرف.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        هذا إشعار تلقائي من نظام مدى السياحية - لا ترد على هذا البريد
      </p>
    </div>
  `;

  return await sendEmail({ to, subject, html });
}

/**
 * Send request implementation notification
 */
export async function sendImplementationEmail(
  to: string,
  requestNumber: string,
  requesterName: string
): Promise<boolean> {
  const subject = `تم تنفيذ طلب الصرف ${requestNumber}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #1e3a5f;">تم تنفيذ الطلب</h2>
      <p>السلام عليكم ورحمة الله وبركاته،</p>
      <p>تم تنفيذ طلب الصرف التالي:</p>
      <ul>
        <li><strong>رقم الطلب:</strong> ${requestNumber}</li>
        <li><strong>مقدم الطلب:</strong> ${requesterName}</li>
      </ul>
      <p>يمكنك مراجعة تفاصيل الطلب من خلال نظام إدارة طلبات الصرف.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        هذا إشعار تلقائي من نظام مدى السياحية - لا ترد على هذا البريد
      </p>
    </div>
  `;

  return await sendEmail({ to, subject, html });
}

/**
 * Send delayed request notification
 */
export async function sendDelayedRequestEmail(
  to: string,
  requestNumber: string,
  requesterName: string,
  daysDelayed: number
): Promise<boolean> {
  const subject = `تنبيه: طلب صرف متأخر ${requestNumber}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #ff6b35;">تنبيه: طلب متأخر</h2>
      <p>السلام عليكم ورحمة الله وبركاته،</p>
      <p>الطلب التالي متأخر عن موعده:</p>
      <ul>
        <li><strong>رقم الطلب:</strong> ${requestNumber}</li>
        <li><strong>مقدم الطلب:</strong> ${requesterName}</li>
        <li><strong>عدد الأيام المتأخرة:</strong> ${daysDelayed}</li>
      </ul>
      <p>يرجى اتخاذ الإجراء المناسب في أقرب وقت ممكن.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        هذا إشعار تلقائي من نظام مدى السياحية - لا ترد على هذا البريد
      </p>
    </div>
  `;

  return await sendEmail({ to, subject, html });
}
