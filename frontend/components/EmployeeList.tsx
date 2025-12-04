import React, { useState } from 'react';
import { Employee, EmployeeRole } from '../types';
import { Plus, Edit2, Trash2, X, User, IdCard } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onAdd: (employee: Omit<Employee, 'employee_id'>) => void;
  onUpdate: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const initialFormState = {
    first_name: '',
    last_name: '',
    role: 'Driver' as EmployeeRole,
    license_number: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.employee_id);
      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        role: employee.role,
        license_number: employee.license_number || ''
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    if (dataToSubmit.role !== 'Driver') {
      delete dataToSubmit.license_number; // Clear license if not driver
    }

    if (editingId) {
      onUpdate({ ...dataToSubmit, employee_id: editingId });
    } else {
      onAdd(dataToSubmit);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 h-full bg-navy-50 dark:bg-carbon-950 overflow-y-auto relative transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Employee Directory</h1>
          <p className="text-navy-600 dark:text-carbon-400 mt-1">Manage personnel, drivers, and helpers.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-navy-900 dark:bg-white hover:bg-navy-800 dark:hover:bg-gray-200 text-white dark:text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-navy-900/20 dark:shadow-none text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => (
          <div key={emp.employee_id} className="bg-white dark:bg-carbon-900 border border-navy-100 dark:border-carbon-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-navy-50 dark:bg-carbon-800 rounded-full flex items-center justify-center text-navy-400 dark:text-carbon-400">
                <User className="w-6 h-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(emp)}
                  className="p-1.5 text-navy-400 hover:text-navy-900 dark:text-carbon-400 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-carbon-800 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(emp.employee_id)}
                  className="p-1.5 text-navy-400 hover:text-red-600 dark:text-carbon-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-1">{emp.first_name} {emp.last_name}</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border
                ${emp.role === 'Driver' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' : 
                  emp.role === 'Helper' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' : 
                  'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'}`}>
                {emp.role}
              </span>
              <span className="text-navy-400 dark:text-carbon-500 text-xs">ID: {emp.employee_id}</span>
            </div>

            {emp.role === 'Driver' && (
              <div className="pt-4 border-t border-navy-50 dark:border-carbon-800 mt-4">
                <div className="flex items-center gap-2 text-navy-500 dark:text-carbon-400 text-sm">
                  <IdCard className="w-4 h-4" />
                  <span className="font-mono">{emp.license_number || 'No License'}</span>
                </div>
              </div>
            )}
          </div>
        ))}
        {employees.length === 0 && (
          <div className="col-span-full p-12 text-center text-navy-500 border border-dashed border-navy-200 dark:border-carbon-800 rounded-lg">
            No employees found. Add one to get started.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-carbon-900 rounded-lg border border-navy-100 dark:border-carbon-800 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-navy-100 dark:border-carbon-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">
                {editingId ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-navy-400 hover:text-navy-800 dark:text-carbon-400 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">First Name</label>
                  <input 
                    type="text" 
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-navy-400 dark:focus:ring-carbon-600 transition-all"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-navy-400 dark:focus:ring-carbon-600 transition-all"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as EmployeeRole})}
                  className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                >
                  <option value="Driver">Driver</option>
                  <option value="Helper">Helper</option>
                  <option value="Encoder">Encoder</option>
                </select>
              </div>
              
              {formData.role === 'Driver' && (
                <div>
                  <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">License Number</label>
                  <input 
                    type="text" 
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-navy-400 dark:focus:ring-carbon-600 transition-all"
                    placeholder="L00-00-000000"
                    required={formData.role === 'Driver'}
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-navy-200 dark:bg-carbon-800 dark:border-carbon-700 hover:bg-navy-50 dark:hover:bg-carbon-700 text-navy-700 dark:text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-navy-900 dark:bg-white hover:bg-navy-800 dark:hover:bg-gray-200 text-white dark:text-black py-2.5 rounded-lg transition-colors text-sm font-semibold shadow-md shadow-navy-900/10 dark:shadow-none"
                >
                  {editingId ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;