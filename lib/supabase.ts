import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  username: string;
  total_commands: number;
  total_accuracy: number;
  avg_typing_speed: number;
  current_level: number;
  total_xp: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface CommandHistory {
  id: string;
  user_id: string;
  command: string;
  success: boolean;
  typing_speed: number;
  accuracy: number;
  challenge_id?: string;
  executed_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  completed: boolean;
  attempts: number;
  best_time?: number;
  completed_at?: string;
}
