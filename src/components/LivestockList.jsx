import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DeleteModal from './DeleteModal';

const LivestockList = () => {
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // Modal state now tracks headsToMove and handles any status transition
  const [financialModal, setFinancialModal] = useState({ 
    isOpen: false, 
    assetId: null, 
    newStatus: '', 
    headsToMove: '', 
    maxHeads: 0,
    totalRevenue: '' 
  });

  const fetchLivestock = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/livestock`)
      .then(response => response.json())
      .then(data => {
        setLivestock(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching livestock:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLivestock();
  }, []);

  // --- TRIGGER MODAL FOR ALL STATUS CHANGES ---
  const handleStatusChange = (assetId, newStatus) => {
    const animal = livestock.find(a => a.assetId === assetId);
    if (!animal) return;

    // Only open modal if the status is actually different from current
    if (newStatus !== animal.status) {
      setFinancialModal({ 
        isOpen: true, 
        assetId, 
        newStatus, 
        headsToMove: animal.headCount, 
        maxHeads: animal.headCount,
        totalRevenue: '' 
      });
    }
  };

  const executeStatusUpdate = (assetId, newStatus, headsToMove, revenue) => {
    // This payload matches your updated SellLivestockDTO
    const payload = {
      status: newStatus,
      headsSold: parseInt(headsToMove), // Backend uses this field for quantity splitting
      ...(newStatus === 'SOLD' && { totalRevenue: parseFloat(revenue) || 0 })
    };

    fetch(`${import.meta.env.VITE_API_URL}/api/livestock/${assetId}/split-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (response.ok) {
        toast.success(`Livestock batch updated to ${newStatus}! 🐄`);
        setFinancialModal({ isOpen: false, assetId: null, newStatus: '', headsToMove: '', maxHeads: 0, totalRevenue: '' });
        fetchLivestock(); // Refresh to show merged/split rows
      } else {
        toast.error('Failed to update livestock batch.');
      }
    })
    .catch(err => toast.error('Network error.'));
  };

  const groupedLivestock = livestock.reduce((acc, animal) => {
    const zoneName = animal.landZone?.zoneName || 'Unassigned / General Area';
    if (!acc[zoneName]) acc[zoneName] = [];
    acc[zoneName].push(animal);
    return acc;
  }, {});

  const openDeleteModal = (animal) => {
    setSelectedAnimal(animal);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedAnimal) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/livestock/${selectedAnimal.assetId}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) {
        toast.success('Record deleted successfully!');
        fetchLivestock();
      }
    })
    .finally(() => {
      setIsModalOpen(false);
      setSelectedAnimal(null);
    });
  };

  if (loading) return <div className="p-8 text-blue-700 font-bold animate-pulse">Syncing Herd Data...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <DeleteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} itemName={selectedAnimal?.species} />

      {/* --- UNIVERSAL LIVESTOCK MODAL --- */}
      {financialModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200 border-t-4 border-t-blue-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Update Herd</h3>
            <p className="text-gray-500 mb-6 text-sm">
              How many animals are moving to <strong className="text-blue-600 uppercase">{financialModal.newStatus}</strong>?
            </p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Number of Heads</label>
                <input 
                  type="number" 
                  max={financialModal.maxHeads}
                  min="1"
                  value={financialModal.headsToMove} 
                  onChange={(e) => setFinancialModal({...financialModal, headsToMove: e.target.value})} 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500 transition-all" 
                />
                <p className="text-[10px] text-gray-400 mt-1">Available in this batch: {financialModal.maxHeads}</p>
              </div>

              {/* --- CONDITIONAL: Only show revenue for SALES --- */}
              {financialModal.newStatus === 'SOLD' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Total Sale Revenue (₹)</label>
                  <input 
                    type="number" 
                    value={financialModal.totalRevenue} 
                    onChange={(e) => setFinancialModal({...financialModal, totalRevenue: e.target.value})} 
                    className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-emerald-500 transition-all" 
                    placeholder="e.g., 85000" 
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setFinancialModal({isOpen: false, assetId: null, newStatus: '', headsToMove: '', maxHeads: 0, totalRevenue: ''})} 
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeStatusUpdate(
                    financialModal.assetId, 
                    financialModal.newStatus, 
                    financialModal.headsToMove, 
                    financialModal.totalRevenue
                )} 
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors"
              >
                Update Herd
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAGE UI --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Livestock Inventory</h2>
          <p className="text-gray-500 text-sm">Organized by land partitions</p>
        </div>
        <Link to="/add-livestock" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm transition-all font-medium">+ Add Livestock</Link>
      </div>

      {livestock.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300 text-gray-500">
          No livestock found. Start by adding animals to your zones.
        </div>
      ) : (
        Object.entries(groupedLivestock).map(([zoneName, items]) => (
          <div key={zoneName} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wide">{zoneName}</h3>
              <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{items.length} Batches</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-wider">
                    <th className="p-4 font-semibold w-[25%]">Species</th>
                    <th className="p-4 font-semibold w-[15%]">Head Count</th>
                    <th className="p-4 font-semibold w-[20%]">Last Vax Date</th>
                    <th className="p-4 font-semibold w-[20%]">Status</th>
                    <th className="p-4 font-semibold w-[20%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((animal) => (
                    <tr key={animal.assetId} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-800">{animal.species}</td>
                      <td className="p-4 text-gray-600 text-sm font-bold">{animal.headCount} units</td>
                      <td className="p-4 text-gray-600 text-sm">{animal.lastVaccinationDate || 'No record'}</td>
                      <td className="p-4">
                        <select
                          value={animal.status}
                          onChange={(e) => handleStatusChange(animal.assetId, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded cursor-pointer outline-none border transition-colors ${
                            animal.status === 'QUARANTINED' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            animal.status === 'SOLD' ? 'bg-gray-50 text-gray-600 border-gray-200' : 
                            'bg-blue-50 text-blue-600 border-blue-200'
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="QUARANTINED">QUARANTINED</option>
                          <option value="SOLD">SOLD</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-4">
                        <Link to={`/edit-livestock/${animal.assetId}`} className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors">EDIT</Link>
                        <button onClick={() => openDeleteModal(animal)} className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors">DELETE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LivestockList;