import React, { useState, useEffect } from 'react';
import { supabase, Employee } from './lib/supabase';
import { isAuthorizedUser } from './lib/auth';
import { AuthScreen } from './components/AuthScreen';
import { UnauthorizedScreen } from './components/UnauthorizedScreen';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ProfilesTab } from './components/ProfilesTab';
import { EmployeesTab } from './components/EmployeesTab';
import { EvaluationTab } from './components/EvaluationTab';

type AppTab = 'profiles' | 'employees' | 'evaluate';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>('employees'); // Changed from 'profiles' to 'employees'
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    if (employee) {
      setActiveTab('evaluate');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Check if user is authorized
  if (!isAuthorizedUser(user)) {
    return <UnauthorizedScreen user={user} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />
      <Navigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        selectedEmployee={selectedEmployee}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profiles' && <ProfilesTab />}
        {activeTab === 'employees' && (
          <EmployeesTab 
            onSelectEmployee={handleSelectEmployee}
            selectedEmployee={selectedEmployee}
          />
        )}
        {activeTab === 'evaluate' && selectedEmployee && (
          <EvaluationTab employee={selectedEmployee} />
        )}
      </main>
    </div>
  );
}

export default App;