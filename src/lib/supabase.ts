import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: window.location.origin,
  },
});

// Database types
export interface Profile {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Competency {
  id: string;
  profile_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface CompetencyRating {
  id: string;
  employee_id: string;
  competency_id: string;
  rating: number;
  updated_at: string;
  competency?: Competency;
}

export interface EmployeeNote {
  id: string;
  employee_id: string;
  content: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  employee_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  goal_competencies?: { competency: Competency }[];
}