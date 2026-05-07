import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState({
    summary: { totalZones: 0, totalCropsAndTimber: 0, totalLivestockHeadcount: 0 },
    livestockData: [],
    cropData: [],
    tasks: []
  });
  const [loading, setLoading] = useState(true);
  
  // --- NEW: State to control the Harvest Modal ---
  const [harvestModal, setHarvestModal] = useState({ 
    isOpen: false, 
    task: null, 
    yieldQuantity: '', 
    totalRevenue: '' 
  });

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/summary`).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/livestock`).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/crops`).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/tasks`).then(res => res.json())
    ]).then(([summary, livestock, crops, tasks]) => {
      const livestockMap = livestock.reduce((acc, curr) => { acc[curr.species] = (acc[curr.species] || 0) + curr.headCount; return acc; }, {});
      const processedLivestock = Object.keys(livestockMap).map(key => ({ name: key, count: livestockMap[key] }));

      const cropMap = crops.reduce((acc, curr) => { acc[curr.assetCategory] = (acc[curr.assetCategory] || 0) + 1; return acc; }, {});
      const processedCrops = Object.keys(cropMap).map(key => ({ name: key, value: cropMap[key] }));

      setData({ summary, livestockData: processedLivestock, cropData: processedCrops, tasks });
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6'];

  // --- NEW: Intercept the button click ---
  const handleTaskClick = (task) => {
    if (task.taskType === 'HARVESTING') {
      // If it's a harvest, open the modal!
      setHarvestModal({ isOpen: true, task: task, yieldQuantity: '', totalRevenue: '' });
    } else {
      // For Watering or Vaccination, finish silently without the modal
      executeCompletion(task.taskId, {}); 
    }
  };

  // --- NEW: Process the API call with the new money data ---
  const executeCompletion = (taskId, payload) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/tasks/${taskId}/complete`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (response.ok) {
        toast.success("Task completed & data logged! 🚀");
        setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.taskId !== taskId) }));
        setHarvestModal({ isOpen: false, task: null, yieldQuantity: '', totalRevenue: '' }); 
      } else {
        toast.error("Failed to sync task.");
      }
    })
    .catch(err => toast.error("Network error."));
  };

  if (loading) return <div className="p-8 text-center text-green-700 font-bold">Generating Analytics...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      
      {/* --- THE HARVEST MODAL UI --- */}
      {harvestModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Log Harvest Data</h3>
            <p className="text-gray-500 mb-6 text-sm">Enter the yield and revenue for your <strong className="text-gray-700">{harvestModal.task?.assetName}</strong>.</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Total Yield (Kg / Units)</label>
                <input 
                  type="number" 
                  value={harvestModal.yieldQuantity} 
                  onChange={(e) => setHarvestModal({...harvestModal, yieldQuantity: e.target.value})} 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all" 
                  placeholder="e.g., 5000" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Total Revenue (₹)</label>
                <input 
                  type="number" 
                  value={harvestModal.totalRevenue} 
                  onChange={(e) => setHarvestModal({...harvestModal, totalRevenue: e.target.value})} 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all" 
                  placeholder="e.g., 25000" 
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setHarvestModal({isOpen: false, task: null, yieldQuantity: '', totalRevenue: ''})} 
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeCompletion(harvestModal.task.taskId, { 
                  yieldQuantity: parseFloat(harvestModal.yieldQuantity) || 0, 
                  totalRevenue: parseFloat(harvestModal.totalRevenue) || 0 
                })} 
                className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- END MODAL --- */}

      <h2 className="text-3xl font-bold text-gray-800">Executive Analytics</h2>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500 transition-transform hover:-translate-y-1">
          <p className="text-gray-500 text-sm font-semibold uppercase">Total Zones</p>
          <p className="text-4xl font-bold text-gray-800">{data.summary.totalZones}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500 transition-transform hover:-translate-y-1">
          <p className="text-gray-500 text-sm font-semibold uppercase">Crops & Timber</p>
          <p className="text-4xl font-bold text-gray-800">{data.summary.totalCropsAndTimber}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 transition-transform hover:-translate-y-1">
          <p className="text-gray-500 text-sm font-semibold uppercase">Livestock Headcount</p>
          <p className="text-4xl font-bold text-gray-800">{data.summary.totalLivestockHeadcount}</p>
        </div>
      </div>

      {/* Layout Grid: Tasks on the Left, Charts on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Action Required Tasks Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col max-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Action Required</h3>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{data.tasks.length}</span>
          </div>
          
          <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
            {data.tasks.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center mt-10">All caught up for today! 🎉</p>
            ) : (
              data.tasks.map(task => (
                <div key={task.taskId} className="bg-gray-50 border border-gray-100 rounded-lg p-4 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      task.taskType === 'WATERING' ? 'bg-blue-100 text-blue-700' :
                      task.taskType === 'VACCINATION' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {task.taskType}
                    </span>
                    <span className="text-red-500 font-bold text-[10px]">{task.urgency}</span>
                  </div>
                  <p className="font-bold text-sm text-gray-800">{task.assetName}</p>
                  <p className="text-xs text-gray-500 mb-3 mt-1 flex items-center gap-1">📍 {task.location}</p>
                  
                  {/* Notice we call handleTaskClick now instead of finishing immediately! */}
                  <button 
                    onClick={() => handleTaskClick(task)} 
                    className="w-full text-xs font-semibold bg-white border border-gray-200 text-gray-600 py-2 rounded hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                  >
                    Mark Complete ✓
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charts Container */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Livestock Population by Species</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.livestockData}>
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Asset Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.cropData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {data.cropData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;