# Mentor-Helper

## Overview

Mentor Helper is an Engineering Evaluation Platform designed to manage and evaluate engineering competencies. It provides a basic system for managing mentee profiles, competencies, goals, and performance evaluations.

## Features

- **User Authentication**: Secure access through Google OAuth.
- **Profile Management**: Create and manage engineering profiles with associated competencies.
- **Competency Ratings**: Track and manage competency ratings for employees, including historical data.
- **Goal Management**: Set and track goals for employees, with competency associations.
- **Employee Notes**: Maintain detailed notes for each employee.

## Architecture

- **Frontend**: Built with React and Tailwind CSS for a responsive and modern user interface.
- **Backend**: Utilizes Supabase for database management and authentication.
- **Database**: PostgreSQL with tables for profiles, competencies, employees, goals, and notes.

## Getting Started

### Prerequisites

- Node.js and npm installed
- Supabase account for backend services

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ammonl/mentor-helper.git
   cd skills
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables for Supabase:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

- Access the platform locally or hosted at `http://mentor-helper.netlify.app`. 
- Sign in using Google OAuth to access the evaluation dashboard.
- Navigate through profiles, employees, and evaluation tabs to manage and evaluate engineering competencies.
