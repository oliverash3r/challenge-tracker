# 75 Day Challenge Tracker

A mobile-first PWA to track your 75 day habit challenge. Built with React, Vite, Tailwind CSS, and Supabase.

## Features

- Custom challenge setup (21/30/60/75/90/100 days)
- Configurable habits with daily/weekly/specific day schedules
- Daily habit tracking with progress rings
- Calendar view with color-coded completion
- Statistics and streak tracking
- Offline support with sync
- PWA installable on mobile

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Copy your project URL and anon key from Settings > API

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Deployment

### Vercel

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Netlify

1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy

## Default Habits

The app comes with sensible Spanish defaults:

- Levantarme temprano (7:00 AM) - daily
- Comida saludable - daily
- Lectura - daily
- Meditar - daily
- Oración / Biblia - daily
- Learning progress - daily
- Acostarme temprano (10:45 PM) - daily
- Ejercicio (3x semana) - weekly goal
- Church - Sundays only

All habits are fully customizable during challenge setup.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Supabase (Auth + Postgres)
- Lucide React (icons)
- PWA with Workbox
