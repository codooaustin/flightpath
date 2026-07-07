# Flight Path

A personal aviation career companion that guides student pilots from their first discovery flight through professional airline certification.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (Auth, PostgreSQL, Storage)
- **Vercel** (deployment)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run database migrations

Link your Supabase project and apply migrations:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

In the Supabase dashboard, add your redirect URL under **Authentication > URL Configuration**:

- `http://localhost:3000/auth/callback` (local)
- `https://your-domain.vercel.app/auth/callback` (production)

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MVP Features

- Email/password authentication (student & parent roles)
- Dashboard with progress, costs, and upcoming events
- Career roadmap with 10 stages
- Mission tracking with status progression
- Calendar for flights, study, tests, and checkrides
- Expense tracking with receipt uploads
- Journal for personal reflections
- Hangar for document and photo storage
- Parent accounts can link to and view student progress

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the three environment variables from `.env.example`
4. Deploy

## Project Structure

```
src/
├── app/           # Next.js routes
├── components/    # UI components by feature
├── lib/           # Supabase, auth, actions, calculations
└── types/         # TypeScript types
supabase/
└── migrations/    # Database schema and seed data
```
