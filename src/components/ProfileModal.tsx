import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase, Profile, Competency } from '../lib/supabase';

interface ProfileModalProps {
  profile: Profile | null;
  onClose: () => void;
}

export function ProfileModal({ profile, onClose }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [competencies, setCompetencies] = useState<{ name: string; description: string; id?: string }[]>([
    { name: '', description: '' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setDescription(profile.description);
      fetchCompetencies();
    }
  }, [profile]);

  const fetchCompetencies = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('competencies')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setCompetencies(data.length > 0 ? data : [{ name: '', description: '' }]);
    } catch (error) {
      console.error('Error fetching competencies:', error);
    }
  };

  const handleAddCompetency = () => {
    setCompetencies([...competencies, { name: '', description: '' }]);
  };

  const handleRemoveCompetency = (index: number) => {
    setCompetencies(competencies.filter((_, i) => i !== index));
  };

  const handleCompetencyChange = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...competencies];
    updated[index] = { ...updated[index], [field]: value };
    setCompetencies(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileId = profile?.id;

      // Create or update profile
      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update({ name, description })
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .insert({ name, description })
          .select()
          .single();

        if (error) throw error;
        profileId = data.id;
      }

      // Handle competencies
      if (profile) {
        // Delete existing competencies
        await supabase
          .from('competencies')
          .delete()
          .eq('profile_id', profile.id);
      }

      // Insert new competencies
      const validCompetencies = competencies.filter(comp => comp.name.trim());
      if (validCompetencies.length > 0) {
        const competenciesToInsert = validCompetencies.map(comp => ({
          profile_id: profileId,
          name: comp.name.trim(),
          description: comp.description.trim(),
        }));

        const { error } = await supabase
          .from('competencies')
          .insert(competenciesToInsert);

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {profile ? 'Edit Profile' : 'Create Profile'}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Senior Developer, ML Engineer"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of this role profile..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Competencies
              </label>
              <button
                type="button"
                onClick={handleAddCompetency}
                className="inline-flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Competency
              </button>
            </div>

            <div className="space-y-4">
              {competencies.map((comp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Competency {index + 1}
                    </h4>
                    {competencies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetency(index)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => handleCompetencyChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Competency name (e.g., Technical Skills, Communication)"
                    />
                    <textarea
                      value={comp.description}
                      onChange={(e) => handleCompetencyChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Description of this competency..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              disabled={loading || !name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}