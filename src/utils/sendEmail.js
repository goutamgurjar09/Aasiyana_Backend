const nodemailer = require("nodemailer");

// Configure transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send Email (supports different types: booking, otp, etc.)
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.type - "booking" or "otp"
 * @param {object} options.data - Extra data (depends on type)
 */
const sendEmail = async ({ to, subject, type, data }) => {
  let html = "";

  // ✅ Type 1: Booking confirmation template
  if (type === "booking") {
    const { name, mobile, propertyId, message } = data;
    html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2e86de;">🏡 Booking Confirmation</h2>
        <p>Hi <b>${name}</b>,</p>
        <p>Thank you for booking with us! Here are your booking details:</p>

        <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
          <tr><td style="padding:8px;border:1px solid #ccc;">📞 Mobile</td><td style="padding:8px;border:1px solid #ccc;">${mobile}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ccc;">🏠 Property ID</td><td style="padding:8px;border:1px solid #ccc;">${propertyId}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ccc;">💬 Message</td><td style="padding:8px;border:1px solid #ccc;">${message || "N/A"}</td></tr>
        </table>

        <p style="margin-top: 20px;">Our team will contact you shortly to confirm your booking.</p>
        <p>Best regards,<br><b>Property Booking Team</b></p>
      </div>
    `;
  }

  // ✅ Type 2: OTP verification template
  else if (type === "otp") {
    const { name, otp } = data;
    html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#2e86de;">🔐 OTP Verification</h2>
        <p>Hi <b>${name || "User"}</b>,</p>
        <p>Your One-Time Password (OTP) is:</p>

        <h1 style="background:#f5f5f5; display:inline-block; padding:10px 20px; border-radius:8px; color:#000; letter-spacing:2px;">
          ${otp}
        </h1>

        <p>This OTP will expire in <b>10 minutes</b>. Please do not share it with anyone.</p>
        <p>Thank you,<br><b>Security Team</b></p>
      </div>
    `;
  }

  try {
    const mailOptions = {
      from: `"Property Booking" <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ ${type.toUpperCase()} email sent to:`, to, "Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    throw new Error("Email could not be sent.");
  }
};

module.exports = sendEmail;


//---------------
// const sgMail = require("@sendgrid/mail");

// // Set API Key
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendEmail = async (to, subject, text) => {
//     try {
//         const msg = {
//             to,
//             from: process.env.EMAIL_FROM, // Your verified  sender email
//             subject,
//             text
//         };

//         await sgMail.send(msg);
//         console.log("Email sent successfully to:", to);
//     } catch (error) {
//         console.error("SendGrid Error:", error.response?.body || error.message);
//         throw new Error("Email could not be sent.");
//     }
// };

// module.exports = sendEmail;