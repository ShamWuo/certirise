# Certirise - AI-Powered Compliance Tracker

Never miss a license renewal. Automated reminders for beauty & personal care businesses.

## Features

- 🤖 **AI-Powered Onboarding**: Upload license photos and let AI extract expiration dates
- 📅 **Smart Reminders**: Automated email and SMS reminders at 90, 60, 30, 14, 7, and 0 days
- 📊 **Dashboard**: Visual overview of all compliance items with color-coded urgency
- 📁 **Document Storage**: Store and manage license documents securely
- 🔍 **Compliance Database**: Built-in knowledge of state-specific requirements

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API routes + Supabase
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4o-mini, Google Cloud Vision
- **Email**: Resend
- **SMS**: Twilio
- **Payments**: Stripe subscriptions and billing

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key
- Google Cloud Vision API key (optional, for OCR)
- Resend API key (for email)
- Twilio account (for SMS)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd Certirise
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your environment variables in `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google Cloud Vision (optional)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials_json

# Resend
RESEND_API_KEY=your_resend_api_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL migration in `lib/supabase/migrations/schema.sql`
   - Seed regulations: `npm run seed` (create a script for this)

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. In Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `lib/supabase/migrations/schema.sql`
3. Run the migration
4. Seed regulations data (create a script or run manually)

## Reminder System

The reminder system runs via cron jobs. Set up a cron job to hit:
```
GET /api/cron/reminders
```

With authorization header:
```
Authorization: Bearer YOUR_CRON_SECRET
```

Recommended schedule: Run every day at 9 AM UTC.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── onboarding/        # Onboarding flow
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   └── onboarding/       # Onboarding components
├── lib/                   # Utility functions
│   ├── ai/               # AI/OCR functions
│   ├── reminders/        # Reminder system
│   └── supabase/         # Supabase client & migrations
└── public/               # Static assets
```

## Roadmap

- [x] Stripe payment integration
- [x] Document upload to Supabase Storage
- [x] Multi-location support
- [x] Employee portal
- [ ] Regulation change monitoring
- [x] Auto-fill renewal forms

## License

MIT

## Support

For support, email support@certirise.com


