import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Employee, Goal, Competency } from '../lib/supabase';

interface GoalModalProps {
  goal: Goal | null;
  employee: Employee;
  competencies: Competency[];
  onClose: () => void;
}

export function GoalModal({ goal, employee, competencies, onClose }: GoalModalProps) {
  const [description, setDescription] = useState('');
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setDescription(goal.description);
      // Extract competency IDs from the goal's competencies
      const competencyIds = (goal.goal_competencies || []).map(gc => gc.competency?.id).filter(Boolean) as string[];
      setSelectedCompetencies(competencyIds);
    }
  }, [goal]);

  const handleCompetencyToggle = (competencyId: string) => {
    setSelectedCompetencies(prev =>
      prev.includes(competencyId)
        ? prev.filter(id => id !== competencyId)
        : [...prev, competencyId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let goalId = goal?.id;

      // Create or update goal
      if (goal) {
        const { error } = await supabase
          .from('goals')
          .update({ description: description.trim() })
          .eq('id', goal.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('goals')
          .insert({
            employee_id: employee.id,
            description: description.trim(),
          })
          .select()
          .single();

        if (error) throw error;
        goalId = data.id;
      }

      // Handle competency associations
      if (goalId) {
        // Delete existing associations
        await supabase
          .from('goal_competencies')
          .delete()
          .eq('goal_id', goalId);

        // Insert new associations
        if (selectedCompetencies.length > 0) {
          const associations = selectedCompetencies.map(competencyId => ({
            goal_id: goalId,
            competency_id: competencyId,
          }));

          const { error } = await supabase
            .from('goal_competencies')
            .insert(associations);

          if (error) throw error;
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {goal ? 'Edit Goal' : 'Create Goal'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Goal Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the development goal, expected outcomes, and timeline..."
              required
            />
          </div>

          {competencies.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Related Competencies (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Select competencies that this goal will help develop
              </p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {competencies.map((competency) => (
                  <label
                    key={competency.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompetencies.includes(competency.id)}
                      onChange={() => handleCompetencyToggle(competency.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{competency.name}</div>
                      {competency.description && (
                        <div className="text-sm text-gray-600 mt-1">{competency.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}