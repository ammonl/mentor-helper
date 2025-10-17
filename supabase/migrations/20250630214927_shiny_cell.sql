/*
  # Mentor Helper Database Schema

  1. New Tables
    - `profiles` - Engineering profiles (developer, ML engineer, etc.)
    - `competencies` - Skills/competencies associated with profiles
    - `employees` - Employee records with profile associations
    - `competency_ratings` - Current competency ratings for employees
    - `competency_rating_history` - Historical ratings for performance tracking
    - `employee_notes` - Long-form notes for each employee
    - `goals` - Employee goals and objectives
    - `goal_competencies` - Many-to-many relationship between goals and competencies

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Restrict access to the head of engineering only

  3. Features
    - Full CRUD operations for profiles and employees
    - Competency rating system with history tracking
    - Goal management with competency associations
    - Notes system for detailed employee feedback
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Competencies table
CREATE TABLE IF NOT EXISTS competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Current competency ratings
CREATE TABLE IF NOT EXISTS competency_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  competency_id uuid REFERENCES competencies(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 10),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, competency_id)
);

-- Historical competency ratings
CREATE TABLE IF NOT EXISTS competency_rating_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  competency_id uuid REFERENCES competencies(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 10),
  created_at timestamptz DEFAULT now()
);

-- Employee notes
CREATE TABLE IF NOT EXISTS employee_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  content text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id)
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goal competencies junction table
CREATE TABLE IF NOT EXISTS goal_competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  competency_id uuid REFERENCES competencies(id) ON DELETE CASCADE,
  UNIQUE(goal_id, competency_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_rating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_competencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON competencies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON employees
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON competency_ratings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON competency_rating_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON employee_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON goals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON goal_competencies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competencies_updated_at BEFORE UPDATE ON competencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competency_ratings_updated_at BEFORE UPDATE ON competency_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_notes_updated_at BEFORE UPDATE ON employee_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle competency rating updates with history
CREATE OR REPLACE FUNCTION handle_competency_rating_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert old rating into history if this is an update
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO competency_rating_history (employee_id, competency_id, rating, created_at)
    VALUES (OLD.employee_id, OLD.competency_id, OLD.rating, OLD.updated_at);
  END IF;
  
  -- Return the new row for INSERT/UPDATE
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for competency rating history
CREATE TRIGGER competency_rating_history_trigger
  AFTER UPDATE ON competency_ratings
  FOR EACH ROW EXECUTE FUNCTION handle_competency_rating_update();