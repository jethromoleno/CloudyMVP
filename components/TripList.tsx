import React, { useState } from 'react';
import { Trip, TripStatus, Employee, Customer, Location, Truck, LoadType, Theme } from '../types';
import { Plus, MapPin, User, FileText, Truck as TruckIcon, Settings, X } from 'lucide-react';

interface TripListProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  employees: Employee[];
  customers: Customer[];
  locations: Location[];
  trucks: Truck[];
  theme: Theme;
}

const TripList: React.FC<TripListProps> = ({ 
  trips, setTrips, employees, customers, locations, trucks, theme
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const initialFormState: Partial<Trip> = {
    trip_code: '',
    customer_id: undefined,
    truck_id: undefined,
    driver_id: undefined,
    origin_location_id: undefined,
    destination_location_id: undefined,
    scheduled_start_time: '',
    status: 'Scheduled',
    load_type: 'Dry',
    net_weight: 0,
    loading_ref_no: ''
  };

  const [formData, setFormData] = useState<Partial<Trip>>(initialFormState);

  const handleOpenModal = (trip?: Trip) => {
    if (trip) {
      setEditingId(trip.trip_id);
      // Format date for datetime-local input (YYYY-MM-DDThh:mm)
      const formattedDate = trip.scheduled_start_time.length > 16 
        ? trip.scheduled_start_time.slice(0, 16) 
        : trip.scheduled_start_time;

      setFormData({
        ...trip,
        scheduled_start_time: formattedDate
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.truck_id || !formData.origin_location_id) return;

    if (editingId) {
      // Update Existing Trip
      const updatedTrip: Trip = {
        ...formData as Trip,
        trip_id: editingId, // Ensure ID persists
        scheduled_start_time: formData.scheduled_start_time || new Date().toISOString()
      };
      
      setTrips(trips.map(t => t.trip_id === editingId ? updatedTrip : t));
    } else {
      // Create New Trip
      const newTrip: Trip = {
        trip_id: Math.floor(Math.random() * 10000) + 1000,
        trip_code: formData.trip_code || `TRIP-${Math.floor(Math.random() * 1000)}`,
        customer_id: Number(formData.customer_id),
        truck_id: Number(formData.truck_id),
        driver_id: Number(formData.driver_id),
        origin_location_id: Number(formData.origin_location_id),
        destination_location_id: Number(formData.destination_location_id),
        scheduled_start_time: formData.scheduled_start_time || new Date().toISOString(),
        status: formData.status || 'Scheduled',
        load_type: formData.load_type as LoadType,
        net_weight: Number(formData.net_weight),
        loading_ref_no: formData.loading_ref_no
      };
      setTrips([...trips, newTrip]);
    }

    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'In Transit': return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 border-blue-200 dark:border-blue-400/20';
      case 'Completed': return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20';
      case 'Cancelled': return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
      case 'Scheduled': return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20';
      default: return 'text-navy-600 dark:text-carbon-400 bg-navy-100 dark:bg-carbon-800 border-navy-200 dark:border-carbon-700';
    }
  };

  const drivers = employees.filter(e => e.role === 'Driver');

  return (
    <div className="p-8 h-full bg-navy-50 dark:bg-carbon-950 overflow-y-auto relative transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Trip Schedule</h1>
          <p className="text-navy-600 dark:text-carbon-400 mt-1">Manage dispatching and route logistics.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-navy-900 dark:bg-white hover:bg-navy-800 dark:hover:bg-gray-200 text-white dark:text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-navy-900/20 dark:shadow-none text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Trip Advice
        </button>
      </div>

      <div className="bg-white dark:bg-carbon-900 rounded-lg border border-navy-100 dark:border-carbon-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-50 dark:bg-carbon-900 border-b border-navy-100 dark:border-carbon-800 text-navy-500 dark:text-carbon-400 text-xs uppercase tracking-wider font-semibold">
              <th className="p-4">Trip Code</th>
              <th className="p-4">Route</th>
              <th className="p-4">Assets (Truck/Driver)</th>
              <th className="p-4">Customer/Load</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Modify</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50 dark:divide-carbon-800 text-sm">
            {trips.map((trip) => {
              const customer = customers.find(c => c.customer_id === trip.customer_id);
              const driver = employees.find(e => e.employee_id === trip.driver_id);
              const truck = trucks.find(t => t.truck_id === trip.truck_id);
              const origin = locations.find(l => l.location_id === trip.origin_location_id);
              const dest = locations.find(l => l.location_id === trip.destination_location_id);

              return (
                <React.Fragment key={trip.trip_id}>
                  <tr className="hover:bg-navy-50 dark:hover:bg-carbon-800/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-mono text-navy-900 dark:text-white font-medium">{trip.trip_code}</div>
                      <div className="text-navy-500 dark:text-carbon-500 text-xs mt-1">{new Date(trip.scheduled_start_time).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-navy-600 dark:text-carbon-300">
                          <span className={`w-2 h-2 rounded-full ${origin?.is_hub ? 'bg-purple-500' : 'bg-navy-400'}`}></span>
                          {origin?.name}
                        </div>
                        <div className="ml-1 border-l border-navy-200 dark:border-carbon-700 h-3"></div>
                        <div className="flex items-center gap-2 text-navy-900 dark:text-white font-medium">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {dest?.name}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-navy-600 dark:text-carbon-300 flex items-center gap-2">
                        <TruckIcon className="w-3 h-3" /> {truck?.license_plate} <span className="text-navy-400 dark:text-carbon-500 text-xs">({truck?.tonner_capacity}T)</span>
                      </div>
                      <div className="text-navy-500 dark:text-carbon-500 text-xs mt-1 flex items-center gap-2">
                         <User className="w-3 h-3" /> {driver?.first_name} {driver?.last_name}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-navy-900 dark:text-white font-medium">{customer?.name}</div>
                      <div className="text-navy-500 dark:text-carbon-500 text-xs mt-1">{trip.load_type} • {trip.net_weight?.toLocaleString()} kg</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleOpenModal(trip)}
                        className="text-navy-400 hover:text-navy-900 dark:text-carbon-400 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-navy-100 dark:hover:bg-carbon-800"
                        title="Modify Trip"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CREATE/EDIT TRIP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-carbon-900 rounded-lg border border-navy-100 dark:border-carbon-800 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-navy-100 dark:border-carbon-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">
                {editingId ? 'Modify Trip Details' : 'Create New Trip Advice'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-navy-400 hover:text-navy-800 dark:text-carbon-400 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">Trip Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. TRIP-2024-001"
                    className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:border-navy-400 dark:focus:border-carbon-600 focus:outline-none focus:ring-1 focus:ring-navy-400 dark:focus:ring-carbon-600 transition-all"
                    value={formData.trip_code}
                    onChange={(e) => setFormData({...formData, trip_code: e.target.value})}
                    required 
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-navy-500 dark:text-carbon-400 mb-2 uppercase">Scheduled Date</label>
                  <input 
                    type="datetime-local" 
                    className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:border-navy-400 dark:focus:border-carbon-600 focus:outline-none focus:ring-1 focus:ring-navy-400 dark:focus:ring-carbon-600 transition-all"
                    value={formData.scheduled_start_time}
                    onChange={(e) => setFormData({...formData, scheduled_start_time: e.target.value})}
                    required 
                  />
                </div>

                <div className="col-span-2 border-t border-navy-100 dark:border-carbon-800 pt-4">
                   <h3 className="text-sm font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                     <FileText className="w-4 h-4 text-navy-400 dark:text-carbon-400" /> Logistics Details
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-navy-500 dark:text-carbon-400 mb-1">Customer</label>
                        <select 
                          className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                          value={formData.customer_id || ''}
                          onChange={(e) => setFormData({...formData, customer_id: Number(e.target.value)})}
                          required
                        >
                          <option value="">Select Customer</option>
                          {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-500 dark:text-carbon-400 mb-1">Load Type</label>
                        <select 
                          className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                          value={formData.load_type}
                          onChange={(e) => setFormData({...formData, load_type: e.target.value as LoadType})}
                        >
                          <option value="Dry">Dry Goods</option>
                          <option value="Chilled">Chilled</option>
                          <option value="Ref">Frozen/Reefer</option>
                          <option value="Combi">Combi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-500 dark:text-carbon-400 mb-1">Origin (Pickup)</label>
                        <select 
                          className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                          value={formData.origin_location_id || ''}
                          onChange={(e) => setFormData({...formData, origin_location_id: Number(e.target.value)})}
                          required
                        >
                          <option value="">Select Origin</option>
                          {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name} {l.is_hub ? '(Hub)' : ''}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-500 dark:text-carbon-400 mb-1">Destination (Drop)</label>
                        <select 
                          className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                          value={formData.destination_location_id || ''}
                          onChange={(e) => setFormData({...formData, destination_location_id: Number(e.target.value)})}
                          required
                        >
                          <option value="">Select Destination</option>
                          {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name}</option>)}
                        </select>
                      </div>
                   </div>
                </div>

                <div className="col-span-2 border-t border-navy-100 dark:border-carbon-800 pt-4">
                   <h3 className="text-sm font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                     <TruckIcon className="w-4 h-4 text-navy-400 dark:text-carbon-400" /> Asset Assignment
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-navy-500 dark:text-carbon-400 mb-1">Assign Truck</label>
                        <select 
                          className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                          value={formData.truck_id || ''}
                          onChange={(e) => setFormData({...formData, truck_id: Number(e.target.value)})}
                          required
                        >
                          <option value="">Select Truck</option>
                          {trucks.map(t => <option key={t.truck_id} value={t.truck_id}>{t.license_plate} ({t.tonner_capacity}T)</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-500 dark:text-carbon-400 mb-1">Assign Driver</label>
                        <select 
                          className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                          value={formData.driver_id || ''}
                          onChange={(e) => setFormData({...formData, driver_id: Number(e.target.value)})}
                          required
                        >
                          <option value="">Select Driver</option>
                          {drivers.map(d => <option key={d.employee_id} value={d.employee_id}>{d.first_name} {d.last_name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-500 dark:text-carbon-400 mb-1">Net Weight (kg)</label>
                        <input 
                          type="number" 
                          className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                          value={formData.net_weight}
                          onChange={(e) => setFormData({...formData, net_weight: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-500 dark:text-carbon-400 mb-1">Ref No.</label>
                        <input 
                          type="text" 
                          className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                          value={formData.loading_ref_no}
                          onChange={(e) => setFormData({...formData, loading_ref_no: e.target.value})}
                          placeholder="Doc #"
                        />
                      </div>
                      
                      {editingId && (
                        <div className="col-span-2">
                           <label className="block text-xs font-medium text-navy-500 dark:text-carbon-400 mb-1">Trip Status</label>
                           <select 
                              className="w-full bg-navy-50 dark:bg-carbon-950 border border-navy-200 dark:border-carbon-800 rounded-md p-2.5 text-navy-900 dark:text-white focus:outline-none"
                              value={formData.status}
                              onChange={(e) => setFormData({...formData, status: e.target.value as TripStatus})}
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Rescue">Rescue</option>
                            </select>
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
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
                  {editingId ? 'Save Changes' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripList;