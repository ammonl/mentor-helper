import React from 'react';
import { Users, Briefcase, UserCheck } from 'lucide-react';

interface NavigationProps {
  activeTab: 'profiles' | 'employees' | 'evaluate';
  onTabChange: (tab: 'profiles' | 'employees' | 'evaluate') => void;
  selectedEmployee?: any;
}

export function Navigation({ activeTab, onTabChange, selectedEmployee }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          <button
            onClick={() => onTabChange('profiles')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profiles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Profiles</span>
          </button>
          
          <button
            onClick={() => onTabChange('employees')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'employees'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Employees</span>
          </button>
          
          {selectedEmployee && (
            <button
              onClick={() => onTabChange('evaluate')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'evaluate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Evaluate: {selectedEmployee.name}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}