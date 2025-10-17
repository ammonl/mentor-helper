import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck, Users } from 'lucide-react';
import { supabase, Employee, Profile } from '../lib/supabase';
import { EmployeeModal } from './EmployeeModal';

interface EmployeesTabProps {
  onSelectEmployee: (employee: Employee) => void;
  selectedEmployee?: Employee;
}

export function EmployeesTab({ onSelectEmployee, selectedEmployee }: EmployeesTabProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesResponse, profilesResponse] = await Promise.all([
        supabase
          .from('employees')
          .select(`
            *,
            profile:profiles(*)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .order('name', { ascending: true })
      ]);

      if (employeesResponse.error) throw employeesResponse.error;
      if (profilesResponse.error) throw profilesResponse.error;

      setEmployees(employeesResponse.data || []);
      setProfiles(profilesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This will also delete all associated ratings, notes, and goals.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;
      fetchData();
      
      // Clear selection if deleted employee was selected
      if (selectedEmployee?.id === employeeId) {
        onSelectEmployee(null as any);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEmployee(null);
    fetchData();
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
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          <p className="text-gray-600">Manage employee records and assignments</p>
        </div>
        <button
          onClick={handleCreateEmployee}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div 
            key={employee.id} 
            className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer ${
              selectedEmployee?.id === employee.id
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                : 'border-gray-200 hover:shadow-md hover:border-gray-300'
            }`}
            onClick={() => onSelectEmployee(employee)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-gray-600 text-sm">{employee.title}</p>
                  </div>
                </div>
                {selectedEmployee?.id === employee.id && (
                  <div className="flex items-center text-blue-600">
                    <UserCheck className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="mb-4">
                {employee.profile ? (
                  <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {employee.profile.name}
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    No profile assigned
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEmployee(employee);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit employee"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEmployee(employee.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(employee.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
          <p className="text-gray-600 mb-4">Add your first team member to get started with evaluations.</p>
          <button
            onClick={handleCreateEmployee}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      )}

      {selectedEmployee && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">
                Selected: {selectedEmployee.name}
              </p>
              <p className="text-sm text-blue-700">
                Click the "Evaluate" tab to start the evaluation process
              </p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          profiles={profiles}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}