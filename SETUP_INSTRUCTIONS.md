# Certirise Setup Instructions

## ✅ Step 1: Dependencies Installed
Dependencies have been successfully installed. The invalid `@radix-ui/react-calendar` package has been removed from `package.json`.

## 📋 Step 2: Set Up Supabase

### 2.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: `certirise` (or your preferred name)
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to you
4. Wait for the project to be created (takes 1-2 minutes)

### 2.2 Get Your Supabase Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
3. Go to **Settings** → **API** → **Project API keys**
4. Copy the **service_role key** (⚠️ Keep this secret! Only use server-side)

### 2.3 Run SQL Migration
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file `lib/supabase/migrations/schema.sql` in your project
4. Copy the entire contents of the file
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### 2.4 Set Up Storage Bucket
1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `compliance-documents`
4. **Uncheck** "Public bucket" (keep it private)
5. Click **Create bucket**

## 🔐 Step 3: Configure Environment Variables

### 3.1 Create .env.local File
Create a file named `.env.local` in the root directory of your project with the following content:

```env
# Supabase Configuration
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

### 3.2 Fill in Your Values

**Required:**
- **Supabase**: Use the values from Step 2.2
- **OpenAI API Key**: Get from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **CRON_SECRET**: Generate a random string (e.g., use `openssl rand -hex 32` or any random string generator)

**Optional (but recommended):**
- **Resend**: Sign up at [https://resend.com](https://resend.com) and get your API key
- **Twilio**: Sign up at [https://www.twilio.com](https://www.twilio.com) and get your credentials
- **Google Cloud Vision**: Only needed if you want OCR functionality

**Note:** For local development, you can leave optional services empty, but email/SMS reminders won't work.

## 🌱 Step 4: Seed Regulations Database

After setting up your `.env.local` file with Supabase credentials, run:

```bash
npm run seed
```

This will populate the `regulations` table with California and Texas license requirements.

## 🚀 Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⏰ Step 6: Set Up Cron Job for Daily Reminders

The reminder system needs to run daily to check for expiring compliance items and send reminders.

### Option 1: Vercel Cron (Recommended for Vercel deployments)

If deploying to Vercel, create a `vercel.json` file in the root:

```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 9 * * *"
  }]
}
```

This runs daily at 9 AM UTC. Vercel will automatically handle authentication using the `CRON_SECRET`.

### Option 2: External Cron Service (For other hosting)

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Create a new cron job
2. **URL**: `https://your-domain.com/api/cron/reminders`
3. **Method**: GET
4. **Schedule**: Daily at 9 AM UTC (`0 9 * * *`)
5. **Headers**: 
   - Key: `Authorization`
   - Value: `Bearer YOUR_CRON_SECRET` (use the value from `.env.local`)

### Option 3: Local Testing

Test the cron endpoint manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/reminders
```

Or use a tool like Postman with:
- Method: GET
- URL: `http://localhost:3000/api/cron/reminders`
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install` completed)
- [ ] Supabase project created
- [ ] SQL migration run successfully
- [ ] Storage bucket `compliance-documents` created
- [ ] `.env.local` file created with all required values
- [ ] Regulations seeded (`npm run seed` completed)
- [ ] Development server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Cron job configured (for production)

## 🎉 Next Steps

1. Visit http://localhost:3000
2. Click "Get Started" to create an account
3. Complete the onboarding flow
4. Add your first compliance item
5. Test the reminder system

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and keys are correct in `.env.local`
- Check that the SQL migration ran successfully
- Ensure you're using the correct keys (anon key for client, service role for server)

### Seed Script Fails
- Make sure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Verify the `regulations` table was created in the migration
- Check Supabase dashboard → Table Editor → regulations

### Development Server Won't Start
- Check that all environment variables are set
- Look for error messages in the terminal
- Try deleting `node_modules` and `.next` folder, then run `npm install` again

### Cron Job Not Working
- Verify the `CRON_SECRET` matches in both `.env.local` and your cron service
- Check the cron endpoint returns 200 status
- Review server logs for errors


