import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { supabase, Employee } from '../lib/supabase';

interface NotesViewProps {
  employee: Employee;
}

export function NotesView({ employee }: NotesViewProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [employee]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_notes')
        .select('*')
        .eq('employee_id', employee.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setContent(data?.content || '');
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('employee_notes')
        .upsert({
          employee_id: employee.id,
          content: content,
        });

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
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
          <h3 className="text-lg font-semibold text-gray-900">Employee Notes</h3>
          <p className="text-gray-600">Add detailed notes and observations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>

      <div className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Add your notes about this employee's performance, development areas, achievements, feedback from reviews, etc..."
        />

        {lastSaved && (
          <div className="flex items-center text-sm text-gray-500">
            <FileText className="w-4 h-4 mr-1" />
            Last saved: {lastSaved.toLocaleString()}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Notes Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include specific examples and observations</li>
          <li>• Note areas of strength and improvement opportunities</li>
          <li>• Record feedback from 1:1s and performance reviews</li>
          <li>• Track progress on development goals</li>
          <li>• Document any coaching or mentoring provided</li>
        </ul>
      </div>
    </div>
  );
}