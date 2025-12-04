import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TripList from './components/TripList';
import Login from './components/Login';
import TruckList from './components/TruckList';
import EmployeeList from './components/EmployeeList';
import Hub from './components/Hub';
import UserManagement from './components/UserManagement';
import AppNavbar from './components/AppNavbar';
import { ClipboardList, Package, DollarSign, Moon, Sun } from 'lucide-react';
import { 
  Trip, Employee, Customer, Location, Truck, TripFuel, 
  SystemUser, AppModule, Theme 
} from './types';

// --- MOCK DATABASE INITIALIZATION ---

// Initial System Users
const INITIAL_USERS: SystemUser[] = [
  { 
    id: 1, 
    username: 'SuperAdmin', 
    password: 'admin123', 
    role: 'SuperAdmin', 
    permissions: ['inventory', 'trip_scheduling', 'billing'] 
  },
  { 
    id: 2, 
    username: 'Dispatcher', 
    password: 'user123', 
    role: 'User', 
    permissions: ['trip_scheduling'] 
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  { employee_id: 1, first_name: 'John', last_name: 'Doe', role: 'Driver', license_number: 'L123456' },
  { employee_id: 2, first_name: 'Jane', last_name: 'Smith', role: 'Driver', license_number: 'L987654' },
  { employee_id: 3, first_name: 'Bob', last_name: 'Johnson', role: 'Helper' },
  { employee_id: 4, first_name: 'Alice', last_name: 'Williams', role: 'Encoder' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { customer_id: 1, name: 'Acme Logistics', contact_name: 'Mike Ross', contact_phone: '555-0100' },
  { customer_id: 2, name: 'Global Foods Inc', contact_name: 'Rachel Zane', contact_phone: '555-0101' },
];

const INITIAL_LOCATIONS: Location[] = [
  { location_id: 1, name: 'Manila Hub', address_line_1: 'Port Area', city: 'Manila', latitude: 14.5995, longitude: 120.9842, is_hub: true },
  { location_id: 2, name: 'Quezon City Warehouse', address_line_1: 'Araneta Ave', city: 'Quezon City', latitude: 14.6760, longitude: 121.0437, is_hub: false },
  { location_id: 3, name: 'Batangas Port', address_line_1: 'Sta Clara', city: 'Batangas', latitude: 13.7565, longitude: 121.0583, is_hub: false },
  { location_id: 4, name: 'Cebu Distribution Center', address_line_1: 'Mandaue', city: 'Cebu', latitude: 10.3157, longitude: 123.8854, is_hub: true },
];

const INITIAL_TRUCKS: Truck[] = [
  { truck_id: 1, license_plate: 'ABC-1234', vin: 'VN1001', tonner_capacity: 10, status: 'In Use' },
  { truck_id: 2, license_plate: 'XYZ-5678', vin: 'VN1002', tonner_capacity: 6, status: 'Available' },
  { truck_id: 3, license_plate: 'RST-9012', vin: 'VN1003', tonner_capacity: 12, status: 'Maintenance' },
];

const INITIAL_TRIPS: Trip[] = [
  {
    trip_id: 101,
    trip_code: 'TRIP-2023-001',
    customer_id: 1,
    truck_id: 1,
    driver_id: 1,
    origin_location_id: 1,
    destination_location_id: 3,
    scheduled_start_time: '2023-10-25T08:00:00',
    status: 'In Transit',
    load_type: 'Dry',
    net_weight: 8500,
    loading_ref_no: 'REF-1001'
  },
  {
    trip_id: 102,
    trip_code: 'TRIP-2023-002',
    customer_id: 2,
    truck_id: 2,
    driver_id: 2,
    origin_location_id: 4,
    destination_location_id: 2,
    scheduled_start_time: '2023-10-26T14:00:00',
    status: 'Scheduled',
    load_type: 'Chilled',
    net_weight: 5000,
    loading_ref_no: 'REF-1002'
  }
];

const INITIAL_FUELS: TripFuel[] = [
  { fuel_id: 1, trip_id: 101, encoder_id: 4, fuel_ref_no: 'F-555', liters: 150.5, total_amount: 8500.00 }
];

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Navigation State
  const [activeModule, setActiveModule] = useState<AppModule | 'hub' | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Theme State
  const [theme, setTheme] = useState<Theme>('dark');

  // Database State
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [locations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);
  const [fuels] = useState<TripFuel[]>(INITIAL_FUELS);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- AUTH HANDLERS ---
  const handleLogin = (username: string, password: string) => {
    const user = systemUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setActiveModule('hub');
      setLoginError(null);
    } else {
      setLoginError("Invalid credentials. Try 'SuperAdmin' / 'admin123'");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveModule(null);
    setCurrentView('dashboard');
  };

  const handleModuleSelect = (module: AppModule | 'hub') => {
    setActiveModule(module);
    if (module !== 'hub') {
      setCurrentView('dashboard'); // Reset inner view when switching apps
    }
  };

  // --- USER MANAGEMENT HANDLERS ---
  const handleAddUser = (newUser: Omit<SystemUser, 'id'>) => {
    const id = Math.max(...systemUsers.map(u => u.id), 0) + 1;
    setSystemUsers([...systemUsers, { ...newUser, id }]);
  };

  const handleUpdateUser = (updatedUser: SystemUser) => {
    setSystemUsers(systemUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (id: number) => {
    setSystemUsers(systemUsers.filter(u => u.id !== id));
  };

  // --- ASSET CRUD HANDLERS ---
  const handleAddTruck = (newTruck: Omit<Truck, 'truck_id'>) => {
    const id = Math.max(...trucks.map(t => t.truck_id), 0) + 1;
    setTrucks([...trucks, { ...newTruck, truck_id: id }]);
  };

  const handleUpdateTruck = (updatedTruck: Truck) => {
    setTrucks(trucks.map(t => t.truck_id === updatedTruck.truck_id ? updatedTruck : t));
  };

  const handleDeleteTruck = (id: number) => {
    setTrucks(trucks.filter(t => t.truck_id !== id));
  };

  const handleAddEmployee = (newEmp: Omit<Employee, 'employee_id'>) => {
    const id = Math.max(...employees.map(e => e.employee_id), 0) + 1;
    setEmployees([...employees, { ...newEmp, employee_id: id }]);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees(employees.map(e => e.employee_id === updatedEmp.employee_id ? updatedEmp : e));
  };

  const handleDeleteEmployee = (id: number) => {
    setEmployees(employees.filter(e => e.employee_id !== id));
  };

  // --- RENDER LOGIC ---

  if (!currentUser) {
    return (
      <Login 
        onLogin={handleLogin} 
        error={loginError} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (activeModule === 'hub') {
    return (
      <Hub 
        user={currentUser} 
        onSelectModule={handleModuleSelect} 
        onLogout={handleLogout} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Placeholder Screens for Other Modules
  if (activeModule === 'inventory') {
    return (
      <div className="h-screen bg-navy-50 dark:bg-carbon-950 flex flex-col transition-colors duration-300">
        <AppNavbar activeModule={activeModule} onSelectModule={handleModuleSelect} />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-emerald-600 dark:text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">Inventory Management</h1>
            <p className="text-navy-600 dark:text-carbon-400 text-lg mb-8">This module is currently under development. Check back later for stock tracking and warehouse operations.</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeModule === 'billing') {
     return (
      <div className="h-screen bg-navy-50 dark:bg-carbon-950 flex flex-col transition-colors duration-300">
        <AppNavbar activeModule={activeModule} onSelectModule={handleModuleSelect} />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-10 h-10 text-purple-600 dark:text-purple-500" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-4">Billing System</h1>
            <p className="text-navy-600 dark:text-carbon-400 text-lg mb-8">Financial modules, invoicing, and cost tracking are coming in the next release.</p>
          </div>
        </div>
      </div>
    );
  }

  // LOGITRACK AI APP LOGIC
  const renderLogiTrackView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard trips={trips} trucks={trucks} fuels={fuels} theme={theme} />;
      case 'trip-management':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-navy-50 dark:bg-carbon-950 transition-colors duration-300">
            <div className="text-center p-8 bg-white dark:bg-carbon-900 rounded-xl border border-navy-100 dark:border-carbon-800 shadow-xl max-w-md">
              <div className="w-16 h-16 bg-navy-100 dark:bg-carbon-800 rounded-full flex items-center justify-center mx-auto mb-6 text-navy-600 dark:text-white">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Trip Management</h2>
              <p className="text-navy-600 dark:text-carbon-400">Advanced features for trip planning and execution.</p>
              <div className="mt-6 px-4 py-2 bg-navy-50 dark:bg-carbon-950 rounded-lg border border-navy-100 dark:border-carbon-800 text-xs font-mono text-navy-500 dark:text-carbon-500">Status: Coming Soon</div>
            </div>
          </div>
        );
      case 'trips':
        return (
          <TripList 
            trips={trips} 
            setTrips={setTrips} 
            employees={employees}
            customers={customers}
            locations={locations}
            trucks={trucks}
            theme={theme}
          />
        );
      case 'trucks':
        return (
          <TruckList 
            trucks={trucks}
            onAdd={handleAddTruck}
            onUpdate={handleUpdateTruck}
            onDelete={handleDeleteTruck}
          />
        );
      case 'employees':
        return (
          <EmployeeList 
            employees={employees}
            onAdd={handleAddEmployee}
            onUpdate={handleUpdateEmployee}
            onDelete={handleDeleteEmployee}
          />
        );
      case 'settings':
        return (
           <div className="p-8 h-full overflow-y-auto bg-navy-50 dark:bg-carbon-950 transition-colors duration-300">
             <h2 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">System Settings</h2>
             <p className="text-navy-600 dark:text-carbon-400 mb-8">Configure application preferences and access control.</p>
             
             {/* THEME SETTING */}
             <div className="mb-8 bg-white dark:bg-carbon-900 border border-navy-100 dark:border-carbon-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">Appearance</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-carbon-800 text-white' : 'bg-navy-100 text-navy-600'}`}>
                       {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-navy-900 dark:text-white">Interface Theme</p>
                      <p className="text-sm text-navy-500 dark:text-carbon-400">
                        Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className="px-4 py-2 rounded-lg bg-navy-50 dark:bg-carbon-800 text-navy-900 dark:text-white border border-navy-100 dark:border-carbon-700 hover:bg-navy-100 dark:hover:bg-carbon-700 transition-colors text-sm font-medium"
                  >
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                </div>
             </div>

             {/* USER MANAGEMENT SECTION (SUPER ADMIN ONLY) */}
             {currentUser.role === 'SuperAdmin' && (
               <div className="mb-10">
                 <div className="bg-gradient-to-r from-navy-50 to-white dark:from-carbon-900 dark:to-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-xl p-6 shadow-sm">
                    <UserManagement 
                      users={systemUsers}
                      onAddUser={handleAddUser}
                      onUpdateUser={handleUpdateUser}
                      onDeleteUser={handleDeleteUser}
                    />
                 </div>
               </div>
             )}

             <div className="bg-white dark:bg-carbon-900 border border-navy-100 dark:border-carbon-800 p-6 rounded-lg max-w-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-navy-800 dark:text-gray-200 mb-2">Application Info</h3>
                <div className="p-4 bg-navy-50 dark:bg-carbon-950 rounded border border-navy-100 dark:border-carbon-800">
                  <h4 className="text-sm font-semibold text-navy-600 dark:text-carbon-400 mb-2">Current Configuration:</h4>
                  <ul className="list-disc list-inside text-xs text-navy-500 dark:text-carbon-500 space-y-1 font-mono">
                    <li>Environment: Production (Mock)</li>
                    <li>API Status: Connected (Gemini 2.5)</li>
                    <li>Database Schema: PostgreSQL Compatible</li>
                    <li>User: {currentUser.username} ({currentUser.role})</li>
                  </ul>
                </div>
             </div>
           </div>
        );
      default:
        return <Dashboard trips={trips} trucks={trucks} fuels={fuels} theme={theme} />;
    }
  };

  return (
    <div className="flex h-screen bg-navy-50 dark:bg-carbon-950 transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={handleLogout}
        username={currentUser.username}
        userRole={currentUser.role}
        theme={theme}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AppNavbar activeModule="trip_scheduling" onSelectModule={handleModuleSelect} />
        <div className="flex-1 overflow-hidden relative">
          {renderLogiTrackView()}
        </div>
      </main>
    </div>
  );
};

export default App;