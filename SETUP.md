# Certirise Setup Guide

This guide will walk you through setting up Certirise locally and deploying it.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier works)
- OpenAI API key
- (Optional) Google Cloud Vision API key for OCR
- Resend account for emails
- Twilio account for SMS

## Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd Certirise
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to Settings → API
3. Copy your project URL and anon key
4. Go to Settings → Database → Connection string
5. Copy your service role key (keep this secret!)

## Step 3: Create Database Tables

1. In Supabase dashboard, go to SQL Editor
2. Copy the entire contents of `lib/supabase/migrations/schema.sql`
3. Paste and run it in the SQL Editor
4. This will create all necessary tables

## Step 4: Set Up Storage Bucket

1. In Supabase dashboard, go to Storage
2. Create a new bucket named `compliance-documents`
3. Make it private (don't enable public access)
4. Set up Row Level Security (RLS) policies if needed

## Step 5: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (for emails and links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (required for AI extraction)
OPENAI_API_KEY=sk-your-openai-api-key

# Google Cloud Vision (optional, for OCR)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json

# Resend (for email reminders)
RESEND_API_KEY=re_your-resend-api-key

# Twilio (for SMS reminders)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Cron Secret (for reminder cron job)
CRON_SECRET=your-random-secret-string
```

## Step 6: Seed Regulations Database

```bash
npm run seed
```

This will populate the regulations table with California and Texas license requirements.

## Step 7: Set Up Google Cloud Vision (Optional)

If you want to use Google Cloud Vision for OCR:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Cloud Vision API
4. Create a service account and download the JSON key file
5. Place the JSON file in your project root
6. Update `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local` with the path to the file

**Note:** If you skip this, the OCR feature will not work, but you can still manually enter license information.

## Step 8: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 9: Set Up Reminder Cron Job

The reminder system needs to run daily. You can:

1. **Using Vercel Cron (Recommended for Vercel deployments):**
   - Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/reminders",
       "schedule": "0 9 * * *"
     }]
   }
   ```

2. **Using a service like EasyCron or cron-job.org:**
   - Set up a daily job at 9 AM UTC
   - URL: `https://your-domain.com/api/cron/reminders`
   - Method: GET
   - Header: `Authorization: Bearer YOUR_CRON_SECRET`

3. **Local testing:**
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/reminders
   ```

## Step 10: Create Your First Account

1. Go to http://localhost:3000
2. Click "Get Started"
3. Sign up with your email
4. Complete the onboarding flow
5. Add your first compliance item

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Check that the tables were created successfully
- Make sure RLS policies allow access if you've enabled them

### OCR Not Working
- Verify your Google Cloud Vision credentials are correct
- Check that the API is enabled in Google Cloud Console
- Ensure the service account has proper permissions

### Emails Not Sending
- Verify your Resend API key
- Check your Resend dashboard for delivery status
- Make sure the "from" email domain is verified in Resend

### SMS Not Sending
- Verify your Twilio credentials
- Ensure your Twilio phone number is active
- Check that you have sufficient credits in Twilio

## Next Steps

- Customize the branding and colors in `tailwind.config.ts`
- Add more states to the regulations database
- Set up Stripe for payments (see TODO in code)
- Deploy to Vercel or your preferred hosting platform

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Ensure:
- Environment variables are set
- Cron job is configured to hit `/api/cron/reminders` daily
- Database connection is secure (use connection pooling for Supabase)

## Security Notes

- Never commit `.env.local` to git
- Use environment variables for all secrets
- Enable Row Level Security (RLS) in Supabase for production
- Use the service role key only in server-side code
- Keep your cron secret secure


