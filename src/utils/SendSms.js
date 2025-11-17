const twilio = require("twilio");

// Use your credentials here
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

/**
 * Send SMS function
 * @param {string} message - Message content
 */
async function sendSms(to, message) {
  try {
    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`📱 SMS sent successfully to ${to}. SID: ${msg.sid}`);
  } catch (error) {
    console.error("❌ Error sending SMS:", error.message);
    throw new Error("Failed to send SMS");
  }
}


/**
 * Send WhatsApp message function
 * @param {string} message - Message content
 */
function sendWhatsAppMessage(message) {
  client.messages
    .create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // e.g., 'whatsapp:+14155238886'
      to: `whatsapp:${process.env.MY_WHATSAPP_NUMBER}`, // e.g., 'whatsapp:+919876543210'
    })
    .then((msg) => {
      console.log(`💬 WhatsApp message sent successfully. SID: ${msg.sid}`);
    })
    .catch((error) => {
      console.error("❌ Error sending WhatsApp message:", error.message);
    });
}

module.exports = { sendSms, sendWhatsAppMessage };
