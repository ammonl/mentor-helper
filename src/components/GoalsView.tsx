import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import { supabase, Employee, Goal, Competency } from '../lib/supabase';
import { GoalModal } from './GoalModal';

interface GoalsViewProps {
  employee: Employee;
}

export function GoalsView({ employee }: GoalsViewProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchData();
  }, [employee]);

  const fetchData = async () => {
    try {
      // Fetch goals for this employee
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select(`
          *,
          goal_competencies(
            competency:competencies(*)
          )
        `)
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Fetch available competencies for the employee's profile
      let competenciesData: Competency[] = [];
      if (employee.profile_id) {
        const { data, error: competenciesError } = await supabase
          .from('competencies')
          .select('*')
          .eq('profile_id', employee.profile_id)
          .order('name', { ascending: true });

        if (competenciesError) throw competenciesError;
        competenciesData = data || [];
      }

      setGoals(goalsData || []);
      setCompetencies(competenciesData);
    } catch (error) {
      console.error('Error fetching goals data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setShowModal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowModal(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingGoal(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Development Goals</h3>
          <p className="text-gray-600">Set and track employee goals with linked competencies</p>
        </div>
        <button
          onClick={handleCreateGoal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </button>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-gray-900 mb-3">{goal.description}</p>
                
                {goal.goal_competencies && goal.goal_competencies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Related Competencies:</p>
                    <div className="flex flex-wrap gap-2">
                      {goal.goal_competencies.map((gc, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {gc.competency?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEditGoal(goal)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit goal"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Created: {new Date(goal.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
          <p className="text-gray-600 mb-4">
            Create development goals to help guide this employee's growth.
          </p>
          <button
            onClick={handleCreateGoal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Goal
          </button>
        </div>
      )}

      {showModal && (
        <GoalModal
          goal={editingGoal}
          employee={employee}
          competencies={competencies}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}