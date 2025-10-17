import React, { useState, useEffect } from 'react';
import { TrendingUp, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, Employee, Competency, CompetencyRating } from '../lib/supabase';

interface CompetenciesViewProps {
  employee: Employee;
}

export function CompetenciesView({ employee }: CompetenciesViewProps) {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchData();
  }, [employee]);

  const fetchData = async () => {
    if (!employee.profile_id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch competencies for the employee's profile
      const { data: competenciesData, error: competenciesError } = await supabase
        .from('competencies')
        .select('*')
        .eq('profile_id', employee.profile_id)
        .order('created_at', { ascending: true });

      if (competenciesError) throw competenciesError;

      // Fetch current ratings for this employee
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('competency_ratings')
        .select('*')
        .eq('employee_id', employee.id);

      if (ratingsError) throw ratingsError;

      setCompetencies(competenciesData || []);
      
      // Convert ratings array to object for easy lookup
      const ratingsMap: { [key: string]: number } = {};
      (ratingsData || []).forEach(rating => {
        ratingsMap[rating.competency_id] = rating.rating;
      });
      setRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching competencies data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (competencyId: string, rating: number) => {
    setSaving({ ...saving, [competencyId]: true });

    try {
      // First, try to update existing rating
      const { data: existingRating, error: selectError } = await supabase
        .from('competency_ratings')
        .select('id')
        .eq('employee_id', employee.id)
        .eq('competency_id', competencyId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (existingRating) {
        // Update existing rating
        const { error: updateError } = await supabase
          .from('competency_ratings')
          .update({ rating: rating })
          .eq('employee_id', employee.id)
          .eq('competency_id', competencyId);

        if (updateError) throw updateError;
      } else {
        // Insert new rating
        const { error: insertError } = await supabase
          .from('competency_ratings')
          .insert({
            employee_id: employee.id,
            competency_id: competencyId,
            rating: rating,
          });

        if (insertError) throw insertError;
      }

      setRatings({ ...ratings, [competencyId]: rating });
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setSaving({ ...saving, [competencyId]: false });
    }
  };

  const toggleDescription = (competencyId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [competencyId]: !prev[competencyId]
    }));
  };

  // ROYGBIV color scheme with smooth transitions
  const getRatingButtonStyle = (rating: number, currentRating: number, isSaving: boolean) => {
    const isSelected = currentRating >= rating;
    
    // ROYGBIV colors mapped to ratings 1-10
    const colorMap = {
      1: { bg: 'from-red-500 to-red-600', border: 'border-red-500', text: 'text-red-600', hover: 'hover:bg-red-50' },
      2: { bg: 'from-orange-500 to-red-500', border: 'border-orange-500', text: 'text-orange-600', hover: 'hover:bg-orange-50' },
      3: { bg: 'from-yellow-500 to-orange-500', border: 'border-yellow-500', text: 'text-yellow-600', hover: 'hover:bg-yellow-50' },
      4: { bg: 'from-lime-500 to-yellow-500', border: 'border-lime-500', text: 'text-lime-600', hover: 'hover:bg-lime-50' },
      5: { bg: 'from-green-500 to-lime-500', border: 'border-green-500', text: 'text-green-600', hover: 'hover:bg-green-50' },
      6: { bg: 'from-emerald-500 to-green-500', border: 'border-emerald-500', text: 'text-emerald-600', hover: 'hover:bg-emerald-50' },
      7: { bg: 'from-cyan-500 to-emerald-500', border: 'border-cyan-500', text: 'text-cyan-600', hover: 'hover:bg-cyan-50' },
      8: { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-500', text: 'text-blue-600', hover: 'hover:bg-blue-50' },
      9: { bg: 'from-indigo-500 to-blue-500', border: 'border-indigo-500', text: 'text-indigo-600', hover: 'hover:bg-indigo-50' },
      10: { bg: 'from-violet-500 to-indigo-500', border: 'border-violet-500', text: 'text-violet-600', hover: 'hover:bg-violet-50' },
    };

    const colors = colorMap[rating as keyof typeof colorMap];
    
    if (isSelected) {
      return `bg-gradient-to-r ${colors.bg} border-2 ${colors.border} text-white shadow-lg transform scale-105 ${
        isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`;
    } else {
      return `border-2 border-gray-300 ${colors.text} ${colors.hover} transition-all ${
        isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:shadow-md'
      }`;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee.profile_id) {
    return (
      <div className="p-6 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Assigned</h3>
        <p className="text-gray-600">
          This employee needs a profile assignment before competencies can be evaluated.
        </p>
      </div>
    );
  }

  if (competencies.length === 0) {
    return (
      <div className="p-6 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Competencies Defined</h3>
        <p className="text-gray-600">
          The assigned profile doesn't have any competencies defined yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Competency Evaluation</h3>
          <p className="text-gray-600">Rate each competency on a scale of 1-10</p>
        </div>
      </div>

      <div className="space-y-6">
        {competencies.map((competency) => {
          const currentRating = ratings[competency.id] || 0;
          const isSaving = saving[competency.id];
          const hasDescription = competency.description && competency.description.trim() !== '';
          const isDescriptionExpanded = expandedDescriptions[competency.id];

          return (
            <div key={competency.id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">{competency.name}</h4>
                    {hasDescription && (
                      <button
                        onClick={() => toggleDescription(competency.id)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                        title={isDescriptionExpanded ? 'Hide description' : 'Show description'}
                      >
                        {isDescriptionExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {hasDescription && isDescriptionExpanded && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-700 text-sm leading-relaxed">{competency.description}</p>
                    </div>
                  )}
                </div>
                {isSaving && (
                  <div className="flex items-center text-blue-600 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Saving...
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Rating</span>
                  <span className="text-sm text-gray-500">
                    {currentRating ? `${currentRating}/10` : 'Not rated'}
                  </span>
                </div>

                <div className="grid grid-cols-10 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(competency.id, rating)}
                      disabled={isSaving}
                      className={`h-12 rounded-lg font-medium text-sm transition-all duration-200 ${getRatingButtonStyle(
                        rating,
                        currentRating,
                        isSaving
                      )}`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-xs text-gray-500 px-1">
                  <span>Beginner</span>
                  <span className="hidden sm:block">Developing</span>
                  <span className="hidden lg:block">Proficient</span>
                  <span>Expert</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}