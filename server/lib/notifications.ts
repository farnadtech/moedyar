import { createRequire } from "module";
const require = createRequire(import.meta.url);
const nodemailer = require("nodemailer");

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// SMS Configuration (MelliPayamak)
interface SMSConfig {
  username: string;
  password: string;
  sender: string;
}

const smsConfig: SMSConfig = {
  username: process.env.SMS_USERNAME || "",
  password: process.env.SMS_PASSWORD || "",
  sender: process.env.SMS_SENDER || "",
};

export interface NotificationData {
  to: string;
  eventTitle: string;
  eventDate: string;
  daysUntil: number;
  userFullName: string;
}

export async function sendEmailNotification(
  data: NotificationData,
): Promise<boolean> {
  try {
    // Check if email is configured
    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === "your-email@gmail.com"
    ) {
      console.log("📧 Email notification (DEMO MODE - not actually sent):", {
        to: data.to,
        title: data.eventTitle,
        daysUntil: data.daysUntil,
        note: "Configure EMAIL_USER and EMAIL_PASS in .env to send real emails",
      });
      return true; // Simulate success for development
    }

    const { to, eventTitle, eventDate, daysUntil, userFullName } = data;

    const subject =
      daysUntil === 0
        ? `امروز: ${eventTitle}`
        : `یادآوری: ${eventTitle} - ${daysUntil} روز مانده`;

    const htmlContent = `
      <div dir="rtl" style="font-family: 'Tahoma', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📅 رویداد یار</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">سیستم هوشمند یادآوری رویدادها</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-top: 0;">سلام ${userFullName} عزیز،</h2>

          ${
            daysUntil === 0
              ? `<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
                 <h3 style="color: #92400e; margin: 0 0 10px 0;">🔔 امروز روز رویداد شماست!</h3>
                 <p style="color: #92400e; margin: 0; font-size: 16px; font-weight: bold;">${eventTitle}</p>
               </div>`
              : `<div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                 <h3 style="color: #1d4ed8; margin: 0 0 10px 0;">⏰ یادآوری رویداد</h3>
                 <p style="color: #1d4ed8; margin: 0; font-size: 16px;"><strong>${eventTitle}</strong></p>
                 <p style="color: #1d4ed8; margin: 10px 0 0 0;">${daysUntil} روز تا رویداد باقی مانده است</p>
               </div>`
          }

          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 10px 0;">جزئیات رویداد:</h4>
            <p style="color: #6b7280; margin: 5px 0;"><strong>عنوان:</strong> ${eventTitle}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>تاریخ:</strong> ${new Date(eventDate).toLocaleDateString("fa-IR")}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>زمان باقی‌مانده:</strong> ${daysUntil === 0 ? "امروز!" : `${daysUntil} روز`}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || "http://localhost:8080"}/dashboard"
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              مشاهده داشبورد
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              این پیام از طرف <strong>رویداد یار</strong> ارسال شده است.<br>
              برای مدیریت تنظیمات یادآوری، به داشبورد خود مراجعه کنید.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"رویداد یار" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}

export async function sendSMSNotification(
  data: NotificationData,
  phoneNumber: string,
): Promise<boolean> {
  try {
    // Check if SMS is configured
    if (
      !smsConfig.username ||
      !smsConfig.password ||
      smsConfig.username === "your-username" ||
      smsConfig.password === "your-password"
    ) {
      console.log("📱 SMS notification (DEMO MODE - not actually sent):", {
        to: phoneNumber,
        title: data.eventTitle,
        daysUntil: data.daysUntil,
        note: "Configure SMS_USERNAME and SMS_PASSWORD in .env to send real SMS",
      });
      return true; // Simulate success for development
    }

    const { eventTitle, daysUntil } = data;

    const message =
      daysUntil === 0
        ? `🔔 رویداد یار: امروز روز "${eventTitle}" شماست! برای جزئی��ت بیشتر به داشبورد مراجعه کنید.`
        : `⏰ رویداد یار: ${daysUntil} روز تا "${eventTitle}" باقی مانده. داشبورد: ${process.env.APP_URL || "http://localhost:8080"}`;

    // MelliPayamak API call
    const response = await fetch(
      "https://rest.payamak-panel.com/api/SendSMS/SendSMS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: smsConfig.username,
          password: smsConfig.password,
          to: phoneNumber,
          from: smsConfig.sender,
          text: message,
          isflash: false,
        }),
      },
    );

    const result = await response.json();

    if (result.RetStatus === 1) {
      console.log("SMS sent successfully:", result);
      return true;
    } else {
      console.error("SMS sending failed:", result);
      return false;
    }
  } catch (error) {
    console.error("SMS sending failed:", error);
    return false;
  }
}

export async function sendWhatsAppNotification(
  data: NotificationData,
  phoneNumber: string,
): Promise<boolean> {
  try {
    // Check if WhatsApp is configured
    if (
      !process.env.WHATSAPP_API_KEY ||
      process.env.WHATSAPP_API_KEY === "your-whatsapp-api-key"
    ) {
      console.log("📱 WhatsApp notification (DEMO MODE - not actually sent):", {
        to: phoneNumber,
        title: data.eventTitle,
        daysUntil: data.daysUntil,
        note: "Configure WHATSAPP_API_KEY in .env to send real WhatsApp messages",
      });
      return true; // Simulate success for development
    }

    const { eventTitle, daysUntil } = data;

    const message =
      daysUntil === 0
        ? `🔔 *رویداد یار*\n\nامروز روز "${eventTitle}" شماست!\n\nبرای مشاهده جزئیات به داشبورد مراجعه کنید:\n${process.env.APP_URL || "http://localhost:8080"}`
        : `⏰ *رویداد یار*\n\n${daysUntil} روز تا "${eventTitle}" باقی مانده است.\n\nداشبورد: ${process.env.APP_URL || "http://localhost:8080"}`;

    console.log("WhatsApp message prepared for:", phoneNumber);
    console.log("Message:", message);

    // TODO: Implement actual WhatsApp sending
    // This would require integration with WhatsApp Business API (Twilio, MessageBird, etc.)
    // For now, return success in demo mode

    return true;
  } catch (error) {
    console.error("WhatsApp sending failed:", error);
    return false;
  }
}

export interface TeamInvitationData {
  to: string;
  teamName: string;
  inviterName: string;
  inviteToken: string;
  expiresAt: Date;
}

export async function sendTeamInvitationEmail(
  data: TeamInvitationData,
): Promise<boolean> {
  try {
    // Check if email is configured
    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === "your-email@gmail.com"
    ) {
      console.log("📧 Team invitation email (DEMO MODE - not actually sent):", {
        to: data.to,
        teamName: data.teamName,
        inviterName: data.inviterName,
        note: "Configure EMAIL_USER and EMAIL_PASS in .env to send real emails",
      });
      return true; // Simulate success for development
    }

    const { to, teamName, inviterName, inviteToken, expiresAt } = data;

    const registrationUrl = `${process.env.APP_URL || "http://localhost:8080"}/register?token=${inviteToken}`;

    const subject = `دعوت به تیم ${teamName}`;

    const htmlContent = `
      <div dir="rtl" style="font-family: 'Tahoma', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">👥 رویداد یار</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">دعوت به تیم</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-top: 0;">سلام!</h2>

          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1d4ed8; margin: 0 0 10px 0;">🎉 شما به تیم دعوت شده‌اید!</h3>
            <p style="color: #1d4ed8; margin: 0; font-size: 16px;"><strong>${inviterName}</strong> شما را به تیم <strong>${teamName}</strong> دعوت کرده است.</p>
          </div>

          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 15px 0;">برای پیوستن به تیم:</h4>
            <p style="color: #6b7280; margin: 5px 0;">1. روی دکمه زیر کلیک کنید</p>
            <p style="color: #6b7280; margin: 5px 0;">2. حساب کاربری خود را ایجاد کنید</p>
            <p style="color: #6b7280; margin: 5px 0;">3. به صورت خودکار به تیم اضافه خواهید شد</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationUrl}"
               style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              پیوستن به تیم ${teamName}
            </a>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              ⚠️ این دعوت‌نامه تا تاریخ <strong>${expiresAt.toLocaleDateString("fa-IR")}</strong> معتبر است.
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              این دعوت‌نامه از طرف <strong>رویداد یار</strong> ارسال شده است.<br>
              اگر شما این دعوت را درخواست نکرده‌اید، این پیام را نادیده بگیرید.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"رویداد یار" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log("Team invitation email sent successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("Team invitation email sending failed:", error);
    return false;
  }
}

export async function sendNotification(
  method: "EMAIL" | "SMS" | "WHATSAPP",
  data: NotificationData,
  phoneNumber?: string,
): Promise<boolean> {
  switch (method) {
    case "EMAIL":
      return await sendEmailNotification(data);

    case "SMS":
      if (!phoneNumber) {
        console.error("Phone number required for SMS");
        return false;
      }
      return await sendSMSNotification(data, phoneNumber);

    case "WHATSAPP":
      if (!phoneNumber) {
        console.error("Phone number required for WhatsApp");
        return false;
      }
      return await sendWhatsAppNotification(data, phoneNumber);

    default:
      console.error("Unsupported notification method:", method);
      return false;
  }
}
