import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddCropForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zones, setZones] = useState([]); 

  // 1. Initial state (Added new operational fields)
  const [formData, setFormData] = useState({
    cropVariety: '',
    assetCategory: 'CROP',
    quantityPlanted: '',
    zoneId: '', 
    status: 'ACTIVE',
    irrigationFrequencyDays: '', // NEW
    expectedHarvestDate: ''      // NEW
  });

  useEffect(() => {
    fetch('${import.meta.env.VITE_API_URL}/api/zones')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch zones');
        return res.json();
      })
      .then(data => {
        setZones(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, zoneId: data[0].zoneId }));
        }
      })
      .catch(error => {
        console.error("Error fetching zones:", error);
        toast.error("Could not load land zones.");
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.zoneId) {
      toast.error("Please select a land zone.");
      return;
    }

    setIsSubmitting(true);

    // Added the new fields to the Spring Boot payload
    const payload = {
      cropVariety: formData.cropVariety,
      assetCategory: formData.assetCategory,
      quantityPlanted: parseInt(formData.quantityPlanted),
      status: formData.status,
      dateAcquired: new Date().toISOString().split('T')[0],
      irrigationFrequencyDays: formData.irrigationFrequencyDays ? parseInt(formData.irrigationFrequencyDays) : null,
      expectedHarvestDate: formData.expectedHarvestDate || null,
      landZone: {
        zoneId: parseInt(formData.zoneId) 
      }
    };

    fetch('${import.meta.env.VITE_API_URL}/api/crops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (response.ok) {
          toast.success('Asset added successfully! 🌿');
          navigate('/crops'); 
        } else {
          toast.error('Failed to add asset.');
        }
      })
      .catch(error => {
        console.error("Error:", error);
        toast.error('Network error occurred.');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Register New Asset</h2>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Variety (e.g., Banganapalli Mango)</label>
          <input type="text" name="cropVariety" required value={formData.cropVariety} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Land Zone</label>
          <select name="zoneId" required value={formData.zoneId} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none">
            {zones.length === 0 ? (
              <option disabled>Loading zones...</option>
            ) : (
              zones.map(zone => (
                <option key={zone.zoneId} value={zone.zoneId}>{zone.zoneName} ({zone.sizeAcres} Acres)</option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="assetCategory" value={formData.assetCategory} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 focus:outline-none">
              <option value="CROP">Crop</option>
              <option value="TIMBER">Timber</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Planted</label>
            <input type="number" name="quantityPlanted" required min="1" value={formData.quantityPlanted} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
          </div>
        </div>

        {/* --- NEW OPERATIONAL FIELDS --- */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Watering Frequency (Days)</label>
            <input type="number" name="irrigationFrequencyDays" min="1" placeholder="e.g. 2" value={formData.irrigationFrequencyDays} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
            <p className="text-xs text-gray-400 mt-1">Leave blank if rain-fed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
            <input type="date" name="expectedHarvestDate" value={formData.expectedHarvestDate} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button type="button" onClick={() => navigate('/crops')} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors disabled:bg-green-300">
            {isSubmitting ? 'Saving...' : 'Save Asset'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddCropForm;