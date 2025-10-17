import React, { useState } from 'react';
import { User, FileText, Target } from 'lucide-react';
import { Employee } from '../lib/supabase';
import { CompetenciesView } from './CompetenciesView';
import { NotesView } from './NotesView';
import { GoalsView } from './GoalsView';

interface EvaluationTabProps {
  employee: Employee;
}

type EvaluationView = 'competencies' | 'notes' | 'goals';

export function EvaluationTab({ employee }: EvaluationTabProps) {
  const [activeView, setActiveView] = useState<EvaluationView>('competencies');

  const views = [
    { id: 'competencies', label: 'Competencies', icon: User },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'goals', label: 'Goals', icon: Target },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xl">
              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
            <p className="text-gray-600">{employee.title}</p>
            {employee.profile && (
              <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm mt-2">
                {employee.profile.name}
              </div>
            )}
          </div>
        </div>

        <nav className="flex space-x-1">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeView === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {activeView === 'competencies' && <CompetenciesView employee={employee} />}
        {activeView === 'notes' && <NotesView employee={employee} />}
        {activeView === 'goals' && <GoalsView employee={employee} />}
      </div>
    </div>
  );
}