import { transporter } from "../../lib/nodemailer";
import { responseType } from "../../types/responseType";


export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<responseType> {
    try {
        // HTML template for the email
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Threadify - Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="color: #333; font-size: 28px; font-weight: bold; margin: 0;">Welcome to Threadify!</h1>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hello <strong>${username}</strong>,
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for registering with Threadify! To complete your account verification, please use the following 6-digit code:
                    </p>
                </div>
                
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000; margin: 0;">
                        ${verifyCode}
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        This code will expire in <strong>10 minutes</strong> for your security.
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        If you didn't request this verification code, please ignore this email.
                    </p>
                </div>
                
                <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e9ecef;">
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                        Best regards,<br>
                        The Threadify Team
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Threadify - Verification Code',
            html: htmlContent,
        };

        const result = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully:', result.messageId);
        return { success: true, message: "Verification email sent successfully" };
    } catch (emailError) {
        console.error("Error sending verification email", emailError);
        return { success: false, message: "Failed to send verification email" };
    }
}