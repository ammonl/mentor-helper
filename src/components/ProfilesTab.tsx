import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, Users } from 'lucide-react';
import { supabase, Profile, Competency } from '../lib/supabase';
import { ProfileModal } from './ProfileModal';

export function ProfilesTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [competencies, setCompetencies] = useState<{ [key: string]: Competency[] }>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: competenciesData, error: competenciesError } = await supabase
        .from('competencies')
        .select('*')
        .order('created_at', { ascending: true });

      if (competenciesError) throw competenciesError;

      setProfiles(profilesData || []);
      
      // Group competencies by profile_id
      const groupedCompetencies: { [key: string]: Competency[] } = {};
      (competenciesData || []).forEach((comp) => {
        if (!groupedCompetencies[comp.profile_id]) {
          groupedCompetencies[comp.profile_id] = [];
        }
        groupedCompetencies[comp.profile_id].push(comp);
      });
      setCompetencies(groupedCompetencies);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setShowModal(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setShowModal(true);
  };

  const handleDuplicateProfile = async (profile: Profile) => {
    try {
      // Create new profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: `${profile.name} (Copy)`,
          description: profile.description,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Copy competencies
      const profileCompetencies = competencies[profile.id] || [];
      if (profileCompetencies.length > 0) {
        const competenciesToCopy = profileCompetencies.map((comp) => ({
          profile_id: newProfile.id,
          name: comp.name,
          description: comp.description,
        }));

        const { error: competenciesError } = await supabase
          .from('competencies')
          .insert(competenciesToCopy);

        if (competenciesError) throw competenciesError;
      }

      fetchProfiles();
    } catch (error) {
      console.error('Error duplicating profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This will also delete all associated competencies.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProfile(null);
    fetchProfiles();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Engineering Profiles</h2>
          <p className="text-gray-600">Manage role profiles and their competencies</p>
        </div>
        <button
          onClick={handleCreateProfile}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{profile.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{profile.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Users className="w-4 h-4 mr-1" />
                  {(competencies[profile.id] || []).length} competencies
                </div>
                {(competencies[profile.id] || []).slice(0, 3).map((comp) => (
                  <div key={comp.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mb-1">
                    {comp.name}
                  </div>
                ))}
                {(competencies[profile.id] || []).length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{(competencies[profile.id] || []).length - 3} more
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProfile(profile)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateProfile(profile)}
                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Duplicate profile"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles yet</h3>
          <p className="text-gray-600 mb-4">Create your first engineering profile to get started.</p>
          <button
            onClick={handleCreateProfile}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Profile
          </button>
        </div>
      )}

      {showModal && (
        <ProfileModal
          profile={editingProfile}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}