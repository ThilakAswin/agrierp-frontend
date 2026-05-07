import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DeleteModal from './DeleteModal';

const CropList = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Modal state remains the same, but we will use conditional logic in the UI
  const [financialModal, setFinancialModal] = useState({ 
    isOpen: false, 
    assetId: null, 
    newStatus: '', 
    quantityToHarvest: '', 
    maxQuantity: 0,
    yieldQuantity: '', 
    totalRevenue: '' 
  });

  const fetchCrops = () => {
    fetch('${import.meta.env.VITE_API_URL}/api/crops')
      .then(response => response.json())
      .then(data => {
        setCrops(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching crops:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleStatusChange = (assetId, newStatus) => {
    const crop = crops.find(c => c.assetId === assetId);
    if (!crop) return;

    if (newStatus !== crop.status) {
      setFinancialModal({ 
        isOpen: true, 
        assetId, 
        newStatus, 
        quantityToHarvest: crop.quantityPlanted, 
        maxQuantity: crop.quantityPlanted,
        yieldQuantity: '', 
        totalRevenue: '' 
      });
    }
  };

  const executeStatusUpdate = (assetId, newStatus, qtyToSplit, yieldQty, revenue) => {
    const payload = {
      status: newStatus,
      yieldQuantity: parseFloat(qtyToSplit),
      // Only send revenue/yield values if it's a financial status
      ...( (newStatus === 'HARVESTED' || newStatus === 'SOLD') && {
        // Here we map yieldQty to the yield field if needed, 
        // but for the splitter, we usually send the "affected units" as yieldQuantity
        totalRevenue: parseFloat(revenue) || 0 
      })
    };

    fetch(`${import.meta.env.VITE_API_URL}/api/crops/${assetId}/split-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (response.ok) {
        toast.success(`Units moved to ${newStatus}! 🔄`);
        setFinancialModal({ isOpen: false, assetId: null, newStatus: '', quantityToHarvest: '', maxQuantity: 0, yieldQuantity: '', totalRevenue: '' });
        fetchCrops(); 
      } else {
        toast.error('Failed to update asset batch.');
      }
    });
  };

  const groupedCrops = crops.reduce((acc, crop) => {
    const zoneName = crop.landZone?.zoneName || 'Unassigned / General Area';
    if (!acc[zoneName]) acc[zoneName] = [];
    acc[zoneName].push(crop);
    return acc;
  }, {});

  const openDeleteModal = (crop) => {
    setSelectedCrop(crop);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedCrop) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/crops/${selectedCrop.assetId}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) {
        toast.success('Asset deleted successfully!');
        fetchCrops();
      }
    })
    .finally(() => {
      setIsModalOpen(false);
      setSelectedCrop(null);
    });
  };

  if (loading) return <div className="p-8 text-green-700 font-medium">Loading Inventory...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <DeleteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} itemName={selectedCrop?.cropVariety} />

      {/* --- UNIVERSAL STATUS MODAL --- */}
      {financialModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Update Asset Status</h3>
            <p className="text-gray-500 mb-6 text-sm">
              How many units are moving to <strong className="text-gray-700 uppercase">{financialModal.newStatus}</strong>?
            </p>
            
            <div className="space-y-4">
              {/* Always show Quantity input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Quantity Affected</label>
                <input 
                  type="number" 
                  max={financialModal.maxQuantity}
                  value={financialModal.quantityToHarvest} 
                  onChange={(e) => setFinancialModal({...financialModal, quantityToHarvest: e.target.value})} 
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all" 
                />
                <p className="text-[10px] text-gray-400 mt-1">Maximum available: {financialModal.maxQuantity}</p>
              </div>

              {/* --- NEW: Conditional Rendering for Revenue/Yield --- */}
              {(financialModal.newStatus === 'HARVESTED' || financialModal.newStatus === 'SOLD') && (
                <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Actual Yield Weight (Kg)</label>
                    <input 
                      type="number" 
                      value={financialModal.yieldQuantity} 
                      onChange={(e) => setFinancialModal({...financialModal, yieldQuantity: e.target.value})} 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all" 
                      placeholder="e.g., 5000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Total Revenue (₹)</label>
                    <input 
                      type="number" 
                      value={financialModal.totalRevenue} 
                      onChange={(e) => setFinancialModal({...financialModal, totalRevenue: e.target.value})} 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all" 
                      placeholder="e.g., 25000" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setFinancialModal({isOpen: false, assetId: null, newStatus: '', quantityToHarvest: '', maxQuantity: 0, yieldQuantity: '', totalRevenue: ''})} 
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeStatusUpdate(
                    financialModal.assetId, 
                    financialModal.newStatus, 
                    financialModal.quantityToHarvest, 
                    financialModal.yieldQuantity, 
                    financialModal.totalRevenue
                )} 
                className={`flex-1 text-white py-3 rounded-lg font-bold shadow-lg transition-colors ${
                    financialModal.newStatus === 'DISEASED' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Update Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Crop & Timber Inventory</h2>
          <p className="text-gray-500 text-sm">Organized by land partitions</p>
        </div>
        <Link to="/add-crop" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-sm transition-all font-medium">+ Add Asset</Link>
      </div>

      {/* --- LISTING --- */}
      {Object.entries(groupedCrops).map(([zoneName, items]) => (
        <div key={zoneName} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-1 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wide">{zoneName}</h3>
            <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{items.length} Assets</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-wider">
                  <th className="p-4 font-semibold w-[20%]">Variety</th>
                  <th className="p-4 font-semibold w-[10%]">Category</th>
                  <th className="p-4 font-semibold w-[10%]">Quantity</th>
                  <th className="p-4 font-semibold w-[15%]">Last Watered</th>
                  <th className="p-4 font-semibold w-[15%]">Harvest Due</th>
                  <th className="p-4 font-semibold w-[15%]">Status</th>
                  <th className="p-4 font-semibold w-[15%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((crop) => (
                  <tr key={crop.assetId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{crop.cropVariety}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${crop.assetCategory === 'TIMBER' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {crop.assetCategory}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm font-bold">{crop.quantityPlanted} units</td>
                    <td className="p-4 text-gray-600 text-sm">{crop.lastWateredDate || '-'}</td>
                    <td className="p-4 text-gray-600 text-sm">{crop.expectedHarvestDate || '-'}</td>
                    <td className="p-4">
                      <select
                        value={crop.status}
                        onChange={(e) => handleStatusChange(crop.assetId, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded cursor-pointer outline-none border transition-colors ${
                          crop.status === 'HARVESTED' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          crop.status === 'MATURING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          crop.status === 'SOLD' ? 'bg-gray-50 text-gray-600 border-gray-200' : 
                          crop.status === 'DISEASED' ? 'bg-red-50 text-red-600 border-red-200' :
                          'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="MATURING">MATURING</option>
                        <option value="HARVESTED">HARVESTED</option>
                        <option value="DISEASED">DISEASED</option>
                        <option value="SOLD">SOLD</option>
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-4">
                      <Link to={`/edit-crop/${crop.assetId}`} className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors">EDIT</Link>
                      <button onClick={() => openDeleteModal(crop)} className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors">DELETE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CropList;