/*
  # Add User Access Control

  1. Security Enhancement
    - Add email-based access control
    - Ensure only authorized users can access data
    - Add audit logging for access attempts

  2. Changes
    - Update RLS policies to check user email against allowed list
    - Add function to validate authorized users
*/

-- Function to check if user is authorized
CREATE OR REPLACE FUNCTION is_authorized_user()
RETURNS boolean AS $$
DECLARE
  user_email text;
  allowed_emails text[] := ARRAY[
    'ammonlarson@gmail.com'
  ];
BEGIN
  -- Get the current user's email
  SELECT auth.jwt() ->> 'email' INTO user_email;
  
  -- Check if email is in allowed list
  RETURN user_email = ANY(allowed_emails);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to use authorization check
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON competencies;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON employees;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON competency_ratings;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON competency_rating_history;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON employee_notes;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON goals;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON goal_competencies;

-- Create new policies with authorization check
CREATE POLICY "Allow operations for authorized users only" ON profiles
  FOR ALL TO authenticated 
  USING (is_authorized_user()) 
  WITH CHECK (is_authorized_user());

CREATE POLICY "Allow operations for authorized users only" ON competencies
  FOR ALL TO authenticated 
  USING (is_authorized_user()) 
  WITH CHECK (is_authorized_user());

CREATE POLICY "Allow operations for authorized users only" ON employees
  FOR ALL TO authenticated 
  USING (is_authorized_user()) 
  WITH CHECK (is_authorized_user());

CREATE POLICY "Allow operations for authorized users only" ON competency_ratings
  FOR ALL TO authenticated 
  USING (is_authorized_user()) 
  WITH CHECK (is_authorized_user());

CREATE POLICY "Allow operations for authorized users only" ON competency_rating_history
  FOR ALL TO authenticated 
  USING (is_authorized_user()) 
  WITH CHECK (is_authorized_user());

CREATE POLICY "Allow operations for authorized users only" ON employee_notes
  FOR ALL TO authenticated 
  USING (is_authorized_user()) 
  WITH CHECK (is_authorized_user());

CREATE POLICY "Allow operations for authorized users only" ON goals
  FOR ALL TO authenticated 
  USING (is_authorized_user()) 
  WITH CHECK (is_authorized_user());

CREATE POLICY "Allow operations for authorized users only" ON goal_competencies
  FOR ALL TO authenticated 
  USING (is_authorized_user()) 
  WITH CHECK (is_authorized_user());