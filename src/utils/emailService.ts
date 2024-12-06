import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY as string);

/**
 * Sends an email using Resend's API.
 *
 * @param to - Recipient's email address
 * @param subject - Email subject
 * @param htmlContent - HTML content for the email
 */
export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<void> => {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL as string; // Sender's email
    if (!fromEmail) {
      throw new Error("Sender email is not defined in environment variables.");
    }

    // Send the email
    await resend.emails.send({
      from: `Khelmandu <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};
