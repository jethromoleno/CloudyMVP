import React, { useState } from 'react';
import { Truck, TruckStatus } from '../types';
import { Plus, Edit2, Trash2, X, Search, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface TruckListProps {
  trucks: Truck[];
  onAdd: (truck: Omit<Truck, 'truck_id'>) => void;
  onUpdate: (truck: Truck) => void;
  onDelete: (id: number) => void;
}

const TruckList: React.FC<TruckListProps> = ({ trucks, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const initialFormState = {
    license_plate: '',
    vin: '',
    tonner_capacity: 0,
    status: 'Available' as TruckStatus
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = (truck?: Truck) => {
    if (truck) {
      setEditingId(truck.truck_id);
      setFormData({
        license_plate: truck.license_plate,
        vin: truck.vin,
        tonner_capacity: truck.tonner_capacity,
        status: truck.status
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, truck_id: editingId });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
  };

  const getStatusIcon = (status: TruckStatus) => {
    switch (status) {
      case 'Available': return <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />;
      case 'In Use': return <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-500" />;
      case 'Maintenance': return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-500" />;
    }
  };

  return (
    <div className="p-8 h-full bg-navy-50 dark:bg-carbon-950 overflow-y-auto relative transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Truck Management</h1>
          <p className="text-navy-600 dark:text-carbon-400 mt-1">Manage fleet inventory and vehicle status.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-navy-900 dark:bg-white hover:bg-navy-800 dark:hover:bg-gray-200 text-white dark:text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-navy-900/20 dark:shadow-none text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="bg-white dark:bg-carbon-900 rounded-lg border border-navy-100 dark:border-carbon-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-50 dark:bg-carbon-950/50 border-b border-navy-100 dark:border-carbon-800 text-navy-500 dark:text-carbon-400 text-xs uppercase tracking-wider font-semibold">
              <th className="p-4">Vehicle Details</th>
              <th className="p-4">VIN</th>
              <th className="p-4">Capacity</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50 dark:divide-carbon-800 text-sm">
            {trucks.map((truck) => (
              <tr key={truck.truck_id} className="hover:bg-navy-50 dark:hover:bg-carbon-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-navy-900 dark:text-white text-base">{truck.license_plate}</div>
                  <div className="text-navy-500 text-xs mt-0.5">ID: {truck.truck_id}</div>
                </td>
                <td className="p-4 text-navy-600 dark:text-carbon-300 font-mono">{truck.vin}</td>
                <td className="p-4 text-navy-600 dark:text-carbon-300">{truck.tonner_capacity} Tonner</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(truck.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border
                      ${truck.status === 'Available' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 
                        truck.status === 'In Use' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' : 
                        'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                      {truck.status}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(truck)}
                      className="p-2 text-navy-400 hover:text-navy-900 dark:text-carbon-400 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-carbon-800 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(truck.truck_id)}
                      className="p-2 text-navy-400 hover:text-red-600 dark:text-carbon-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {trucks.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-navy-500">
                  No trucks found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-carbon-900 rounded-lg border border-navy-100 dark:border-carbon-800 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-navy-100 dark:border-carbon-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">
                {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-navy-400 hover:text-navy-800 dark:text-carbon-400 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">License Plate</label>
                <input 
                  type="text" 
                  value={formData.license_plate}
                  onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                  className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-navy-400 dark:focus:ring-carbon-600 transition-all"
                  placeholder="ABC-1234"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">VIN</label>
                <input 
                  type="text" 
                  value={formData.vin}
                  onChange={(e) => setFormData({...formData, vin: e.target.value})}
                  className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-navy-400 dark:focus:ring-carbon-600 transition-all"
                  placeholder="Vehicle Identification Number"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">Capacity (Tons)</label>
                  <input 
                    type="number" 
                    value={formData.tonner_capacity}
                    onChange={(e) => setFormData({...formData, tonner_capacity: Number(e.target.value)})}
                    className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-navy-400 dark:focus:ring-carbon-600 transition-all"
                    required 
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as TruckStatus})}
                    className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

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
                  {editingId ? 'Save Changes' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckList;