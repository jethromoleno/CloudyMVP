import React from 'react';
import { LayoutDashboard, Map, Truck, Users, Settings, LogOut, ClipboardList } from 'lucide-react';
import { Theme } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
  username: string;
  userRole: string;
  theme: Theme;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout, username, userRole, theme }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trip-management', label: 'Trip Management', icon: ClipboardList },
    { id: 'trips', label: 'Trip Schedule', icon: Map },
    { id: 'trucks', label: 'Truck Management', icon: Truck },
    { id: 'employees', label: 'Employee Directory', icon: Users },
  ];

  return (
    <div className="w-64 bg-white dark:bg-carbon-950 h-screen border-r border-navy-100 dark:border-carbon-800 flex flex-col text-navy-600 dark:text-carbon-300 transition-colors duration-300 shrink-0 z-50">
      <div className="p-6 flex items-center space-x-3 border-b border-navy-100 dark:border-carbon-800 h-[88px]">
        <div className="w-8 h-8 bg-navy-900 dark:bg-white rounded-lg flex items-center justify-center shadow-lg shadow-navy-900/20 dark:shadow-none">
          <Truck className="text-white dark:text-carbon-900 w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-navy-900 dark:text-white tracking-tight">LogiTrack AI</span>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col overflow-y-auto">
        <div>
            <p className="px-4 text-xs font-semibold text-navy-400 dark:text-carbon-500 uppercase tracking-wider mb-2">Trip Scheduling</p>
            <div className="space-y-1">
                {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                    <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                        ? 'bg-navy-900 dark:bg-carbon-800 text-white dark:text-white font-semibold shadow-md dark:shadow-none'
                        : 'hover:bg-navy-50 dark:hover:bg-carbon-900 hover:text-navy-900 dark:hover:text-white text-navy-500 dark:text-carbon-400'
                    }`}
                    >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-navy-400 dark:text-carbon-500'}`} />
                    <span className="">{item.label}</span>
                    </button>
                );
                })}
            </div>
        </div>

        <div className="flex-1"></div>

        <div className="mt-4">
            <p className="px-4 text-xs font-semibold text-navy-400 dark:text-carbon-500 uppercase tracking-wider mb-2">System</p>
            <button
                onClick={() => setCurrentView('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentView === 'settings'
                    ? 'bg-navy-900 dark:bg-carbon-800 text-white dark:text-white font-semibold shadow-md dark:shadow-none'
                    : 'hover:bg-navy-50 dark:hover:bg-carbon-900 hover:text-navy-900 dark:hover:text-white text-navy-500 dark:text-carbon-400'
                }`}
            >
                <Settings className={`w-5 h-5 ${currentView === 'settings' ? 'text-white' : 'text-navy-400 dark:text-carbon-500'}`} />
                <span className="">Settings</span>
            </button>
        </div>
      </nav>

      <div className="p-4 border-t border-navy-100 dark:border-carbon-800">
        <div className="flex items-center mb-4 px-4">
          <div className="w-8 h-8 bg-navy-100 dark:bg-carbon-800 rounded-full flex items-center justify-center text-xs font-bold text-navy-600 dark:text-white border border-navy-200 dark:border-carbon-700">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-navy-900 dark:text-white">{username}</p>
            <p className="text-xs text-navy-500 dark:text-carbon-500">{userRole}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 p-2 rounded-md text-navy-500 dark:text-carbon-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;