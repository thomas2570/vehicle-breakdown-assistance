import twilio from 'twilio';

// We'll use mocked credentials if environment variables aren't set
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_MOCK_ACCOUNT_SID';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'MOCK_AUTH_TOKEN';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string) {
  try {
    if (accountSid === 'AC_MOCK_ACCOUNT_SID') {
      console.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
      return { success: true, messageSid: 'SM_MOCK' };
    }

    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    });

    console.log(`[SMS] Sent to ${to} with SID ${response.sid}`);
    return { success: true, messageSid: response.sid };
  } catch (error: any) {
    console.error(`[SMS Error] Failed to send SMS to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
