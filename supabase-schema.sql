-- 75 Day Challenge Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly', 'specific_days'
  specific_days INTEGER[], -- Array of day numbers (0=Sunday, 6=Saturday)
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
  UNIQUE(habit_id, day_number) -- One completion per habit per day
);

-- Row Level Security (RLS) Policies
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- Challenges policies
CREATE POLICY "Users can view own challenges" ON challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges" ON challenges
  FOR DELETE USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view habits of own challenges" ON habits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = habits.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert habits to own challenges" ON habits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = habits.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update habits of own challenges" ON habits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = habits.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete habits of own challenges" ON habits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM challenges
      WHERE challenges.id = habits.challenge_id
      AND challenges.user_id = auth.uid()
    )
  );

-- Completions policies
CREATE POLICY "Users can view completions of own habits" ON completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM habits
      JOIN challenges ON challenges.id = habits.challenge_id
      WHERE habits.id = completions.habit_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert completions to own habits" ON completions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      JOIN challenges ON challenges.id = habits.challenge_id
      WHERE habits.id = completions.habit_id
      AND challenges.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete completions of own habits" ON completions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM habits
      JOIN challenges ON challenges.id = habits.challenge_id
      WHERE habits.id = completions.habit_id
      AND challenges.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_habits_challenge_id ON habits(challenge_id);
CREATE INDEX idx_completions_habit_id ON completions(habit_id);
CREATE INDEX idx_completions_day_number ON completions(day_number);
