# Email Migration: Resend to Nodemailer

## Changes Made

### 1. Dependencies
- **Removed**: `resend`, `@react-email/components`
- **Added**: `nodemailer`, `@types/nodemailer`

### 2. Configuration Files
- **Renamed**: `lib/resend.ts` → `lib/nodemailer.ts`
- **Updated**: Configuration to use Nodemailer transporter

### 3. Email Helpers
- **Updated**: `src/helpers/sendVerificationEmail.ts`
  - Replaced Resend API calls with Nodemailer
  - Added HTML email template directly in the function
- **Updated**: `src/helpers/sendVerificationEmailHtml.ts`
  - Replaced Resend API calls with Nodemailer

### 4. Removed Files
- **Deleted**: `emails/verificationEmail.tsx` (React Email component)

### 5. Environment Variables
- **Added**: `EMAIL_USER` and `EMAIL_PASS` to `.env.example`
- **Updated**: README.md with email configuration instructions

## Required Environment Variables

Add these to your `.env.local` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Copy the generated 16-character password
3. **Use App Password** as `EMAIL_PASS` (not your regular password)

## Other Email Providers

To use other email providers, update `lib/nodemailer.ts`:

```typescript
// For Outlook/Hotmail
export const transporter = nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// For custom SMTP
export const transporter = nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## Testing

Run the email test script:
```bash
npm run test-email
```

Note: Update the test email address in `test-email.js` before running.

## Benefits of Nodemailer over Resend

1. **Free**: No API limits or costs
2. **Flexible**: Works with any SMTP provider
3. **Reliable**: Direct SMTP connection
4. **Customizable**: Full control over email configuration
5. **No external dependencies**: Reduces third-party service dependencies

## API Endpoints That Use Email

The following API routes use the email functionality:
- `/api/auth/register` - Sends verification email on registration
- `/api/resend-verification` - Resends verification email

Both endpoints will now use Nodemailer instead of Resend.
