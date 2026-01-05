-- 75 Day Challenge Tracker Database Schema (Simple Auth)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '75 Day Challenge',
  duration INTEGER NOT NULL DEFAULT 75,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One active challenge per user
);

-- Habits table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sublabel TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  specific_days INTEGER[],
  is_weekly_goal BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Completions table
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, day_number)
);

-- Disable RLS for simplicity (only you and your gf use this)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- Allow all operations (simple auth - no Supabase auth)
CREATE POLICY "Allow all on challenges" ON challenges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on habits" ON habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on completions" ON completions FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_habits_challenge_id ON habits(challenge_id);
CREATE INDEX idx_completions_habit_id ON completions(habit_id);
CREATE INDEX idx_completions_day_number ON completions(day_number);
