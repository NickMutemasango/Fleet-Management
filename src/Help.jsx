import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, QrCode, MessageCircle, AlertTriangle, CheckCircle, 
  Clock, Users, DollarSign, BarChart3, Settings, 
  Bell, Plus, Search, Filter, Calendar, 
  MapPin, Wrench, Camera, ChevronLeft, X 
} from 'lucide-react';

const FleetManagementApp = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'rented', 'maintenance'
  const [scanMode, setScanMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Vehicle data
  const [vehicles, setVehicles] = useState([
    {
      id: 'V001',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      licensePlate: 'ABC-123',
      status: 'available',
      location: 'Downtown Branch',
      mileage: 15420,
      fuelLevel: 85,
      lastService: '2024-05-15',
      dailyRate: 45,
      category: 'Economy',
      qrCode: 'QR001',
      whatsappListed: true
    },
    {
      id: 'V002',
      make: 'Honda',
      model: 'CR-V',
      year: 2022,
      licensePlate: 'XYZ-789',
      status: 'rented',
      location: 'Airport Branch',
      mileage: 28750,
      fuelLevel: 60,
      returnDate: '2025-06-22',
      customer: 'John Smith',
      dailyRate: 65,
      category: 'SUV',
      qrCode: 'QR002',
      whatsappListed: false
    },
    {
      id: 'V003',
      make: 'Ford',
      model: 'Mustang',
      year: 2024,
      licensePlate: 'DEF-456',
      status: 'maintenance',
      location: 'Service Center',
      mileage: 8900,
      fuelLevel: 40,
      issue: 'Brake inspection due',
      dailyRate: 85,
      category: 'Premium',
      qrCode: 'QR003',
      whatsappListed: false
    }
  ]);

  // Other state
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'return', message: 'Vehicle ABC-123 due for return in 2 hours', time: '10 min ago', read: false },
    { id: 2, type: 'maintenance', message: 'DEF-456 maintenance completed', time: '1 hour ago', read: false },
    { id: 3, type: 'booking', message: 'New WhatsApp booking request received', time: '2 hours ago', read: false }
  ]);

  const [checkInData, setCheckInData] = useState({
    vehicleId: '',
    mileage: '',
    fuelLevel: '',
    condition: 'good',
    notes: ''
  });

  // Computed values
  const stats = useMemo(() => ({
    totalVehicles: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    rented: vehicles.filter(v => v.status === 'rented').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    revenue: vehicles.reduce((sum, vehicle) => sum + (vehicle.status === 'rented' ? vehicle.dailyRate : 0), 0),
    whatsappActive: vehicles.filter(v => v.whatsappListed).length,
    unreadNotifications: notifications.filter(n => !n.read).length
  }), [vehicles, notifications]);

  const filteredVehicles = useMemo(() => {
    if (filter === 'all') return vehicles;
    return vehicles.filter(v => v.status === filter);
  }, [vehicles, filter]);

  // Handlers
  const handleScan = (code) => {
    const vehicle = vehicles.find(v => v.qrCode === code);
    if (vehicle) {
      setCheckInData(prev => ({ ...prev, vehicleId: vehicle.id }));
      setScanMode(false);
    }
  };

  const handleCheckIn = () => {
    setVehicles(prev => prev.map(v => 
      v.id === checkInData.vehicleId 
        ? { 
            ...v, 
            status: 'available', 
            mileage: parseInt(checkInData.mileage) || v.mileage,
            fuelLevel: parseInt(checkInData.fuelLevel) || v.fuelLevel,
            whatsappListed: true,
            returnDate: undefined,
            customer: undefined,
            issue: undefined
          }
        : v
    ));
    
    setNotifications(prev => [{
      id: Date.now(),
      type: 'checkin',
      message: `Vehicle ${checkInData.vehicleId} checked in and added to WhatsApp catalog`,
      time: 'Just now',
      read: false
    }, ...prev.slice(0, 4)]);
    
    setCheckInData({ vehicleId: '', mileage: '', fuelLevel: '', condition: 'good', notes: '' });
  };

  const handleNotificationClick = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'rented': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Components
  const StatCard = ({ icon: Icon, value, label, color = 'text-gray-600', onClick }) => (
    <div 
      className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
    </div>
  );

  const VehicleCard = ({ vehicle }) => (
    <div key={vehicle.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
              </span>
              {vehicle.whatsappListed && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold">${vehicle.dailyRate}/day</p>
            <p className="text-xs text-gray-500">{vehicle.category}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mt-3">
          <div>
            <span className="font-medium">License:</span> {vehicle.licensePlate}
          </div>
          <div>
            <span className="font-medium">Location:</span> {vehicle.location}
          </div>
          <div>
            <span className="font-medium">Mileage:</span> {vehicle.mileage.toLocaleString()} mi
          </div>
          <div>
            <span className="font-medium">Fuel:</span> {vehicle.fuelLevel}%
          </div>
        </div>

        {vehicle.status === 'rented' && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
            <p><span className="font-medium">Customer:</span> {vehicle.customer}</p>
            <p><span className="font-medium">Return Date:</span> {vehicle.returnDate}</p>
          </div>
        )}

        {vehicle.status === 'maintenance' && (
          <div className="mt-3 p-2 bg-orange-50 rounded text-sm">
            <p><span className="font-medium">Issue:</span> {vehicle.issue}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Car} 
          value={stats.totalVehicles} 
          label="Total Fleet" 
          onClick={() => {
            setActiveTab('fleet');
            setFilter('all');
          }}
        />
        
        <StatCard 
          icon={CheckCircle} 
          value={stats.available} 
          label="Available" 
          color="text-green-600"
          onClick={() => {
            setActiveTab('fleet');
            setFilter('available');
          }}
        />

        <StatCard 
          icon={Users} 
          value={stats.rented} 
          label="Rented Out" 
          color="text-blue-600"
          onClick={() => {
            setActiveTab('fleet');
            setFilter('rented');
          }}
        />

        <StatCard 
          icon={DollarSign} 
          value={`$${stats.revenue}`} 
          label="Today's Revenue" 
          color="text-green-600"
        />
      </div>

      {/* WhatsApp Integration Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Business Integration
          </h3>
          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Vehicles in Catalog</p>
            <p className="text-xl font-bold">{stats.whatsappActive}/{stats.totalVehicles}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Auto-sync Status</p>
            <p className="text-sm text-green-600">Real-time updates enabled</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {notifications.slice(0, 5).map(notif => (
            <div 
              key={notif.id} 
              className={`flex items-center gap-3 p-3 rounded cursor-pointer ${notif.read ? 'bg-white' : 'bg-blue-50'}`}
              onClick={() => handleNotificationClick(notif.id)}
            >
              <div className="flex-1">
                <p className="text-sm">{notif.message}</p>
                <p className="text-xs text-gray-500">{notif.time}</p>
              </div>
              {!notif.read && <div className="h-2 w-2 bg-blue-500 rounded-full"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFleetView = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Fleet Management</h2>
          {filter !== 'all' && (
            <p className="text-sm text-gray-600 mt-1">
              Showing {filter} vehicles only
              <button 
                onClick={() => setFilter('all')} 
                className="ml-2 text-blue-600 hover:underline"
              >
                Show all
              </button>
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
            <p className="text-gray-500">There are no {filter} vehicles in your fleet</p>
            <button 
              onClick={() => setFilter('all')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View All Vehicles
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCheckIn = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Vehicle Check-In</h2>
      
      {!scanMode ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <button 
            onClick={() => setScanMode(true)}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-700">Scan Vehicle QR Code</p>
            <p className="text-sm text-gray-500 mt-1">Point camera at vehicle's QR code to begin check-in</p>
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center mb-4">
            <Camera className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Camera Active</p>
            <p className="text-sm text-gray-500">Scanning for QR code...</p>
          </div>
          
          {/* Simulate scan buttons for demo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
            {vehicles.map(v => (
              <button
                key={v.id}
                onClick={() => handleScan(v.qrCode)}
                className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                Scan {v.id}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setScanMode(false)}
            className="w-full mt-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel Scan
          </button>
        </div>
      )}

      {checkInData.vehicleId && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Check-In Details</h3>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded">
              <p className="font-medium">Vehicle: {checkInData.vehicleId}</p>
              <p className="text-sm text-gray-600">
                {vehicles.find(v => v.id === checkInData.vehicleId)?.year} {' '}
                {vehicles.find(v => v.id === checkInData.vehicleId)?.make} {' '}
                {vehicles.find(v => v.id === checkInData.vehicleId)?.model}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Mileage</label>
                <input
                  type="number"
                  value={checkInData.mileage}
                  onChange={(e) => setCheckInData(prev => ({...prev, mileage: e.target.value}))}
                  className="w-full p-2 border rounded"
                  placeholder="Enter mileage"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Level (%)</label>
                <input
                  type="number"
                  max="100"
                  value={checkInData.fuelLevel}
                  onChange={(e) => setCheckInData(prev => ({...prev, fuelLevel: e.target.value}))}
                  className="w-full p-2 border rounded"
                  placeholder="Enter fuel %"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Condition</label>
              <select
                value={checkInData.condition}
                onChange={(e) => setCheckInData(prev => ({...prev, condition: e.target.value}))}
                className="w-full p-2 border rounded"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair - Minor Issues</option>
                <option value="poor">Poor - Needs Attention</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={checkInData.notes}
                onChange={(e) => setCheckInData(prev => ({...prev, notes: e.target.value}))}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Any damage, issues, or special notes..."
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCheckIn}
                className="flex-1 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                Complete Check-In & Add to WhatsApp
              </button>
              <button
                onClick={() => setCheckInData({ vehicleId: '', mileage: '', fuelLevel: '', condition: 'good', notes: '' })}
                className="px-4 py-3 border text-gray-600 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'fleet', label: 'Fleet', icon: Car },
    { id: 'checkin', label: 'Check-In', icon: QrCode },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
      </button>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold">FleetPro Manager</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {stats.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {stats.unreadNotifications}
                  </span>
                )}
              </div>
              <div className="hidden md:flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600">WhatsApp Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full p-3 rounded-lg ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'fleet' && renderFleetView()}
        {activeTab === 'checkin' && renderCheckIn()}
        {activeTab === 'maintenance' && (
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Maintenance Module</h3>
            <p className="text-gray-500">Schedule and track vehicle maintenance</p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Analytics & Reports</h3>
            <p className="text-gray-500">Revenue, utilization, and performance insights</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FleetManagementApp;