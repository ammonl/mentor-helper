import React from 'react';
import { Shield, AlertTriangle, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getUnauthorizedMessage } from '../lib/auth';

interface UnauthorizedScreenProps {
  user: any;
}

export function UnauthorizedScreen({ user }: UnauthorizedScreenProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Access Denied
          </h1>
          <p className="text-gray-600 mt-2">Mentor Helper - Engineering Evaluation Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Unauthorized Access</h2>
            <p className="text-gray-600 mb-6">
              {getUnauthorizedMessage(user)}
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-900">Signed in as:</p>
                  <p className="text-sm text-red-700">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out and Return to Login
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              If you believe you should have access, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}