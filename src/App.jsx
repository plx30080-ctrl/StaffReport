import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { signOut } from './firebase/auth';
import { Login } from './components/Login';
import { TeamMemberForm } from './components/TeamMemberForm';
import { ManagerDashboard } from './components/ManagerDashboard';
import { ConfigTab } from './components/ConfigTab';
import { Button, LoadingSpinner } from './components/ui';

function App() {
  const { user, loading, isManager } = useAuth();
  const [view, setView] = useState('auto'); // 'auto', 'team', 'manager', 'config'

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Determine which view to show
  const currentView = view === 'auto' ? (isManager ? 'manager' : 'team') : view;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-primary-700">
                Team KPI Tracker
              </h1>
              {isManager && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('manager')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentView === 'manager'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setView('team')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentView === 'team'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Submit Report
                  </button>
                  <button
                    onClick={() => setView('config')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentView === 'config'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Config
                  </button>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={handleSignOut} className="text-sm">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'manager' && <ManagerDashboard user={user} />}
        {currentView === 'team' && <TeamMemberForm user={user} />}
        {currentView === 'config' && <ConfigTab user={user} />}
      </main>
    </div>
  );
}

export default App;
