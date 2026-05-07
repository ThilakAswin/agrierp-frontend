import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddLivestockForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zones, setZones] = useState([]); 

  // 1. Initial state (Added Vaccination Date)
  const [formData, setFormData] = useState({
    species: '',
    headCount: '',
    dailyFeedKg: '',
    zoneId: '', 
    status: 'ACTIVE',
    lastVaccinationDate: '' // NEW
  });

  useEffect(() => {
    fetch('${import.meta.env.VITE_API_URL}/api/zones')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch zones');
        return res.json();
      })
      .then(data => {
        if (data.length === 0) {
          toast.error("Register a Land Zone before adding livestock!");
          navigate('/register-land');
          return;
        }
        setZones(data);
        setFormData(prev => ({ ...prev, zoneId: data[0].zoneId }));
      })
      .catch(error => {
        console.error("Error fetching zones:", error);
        toast.error("Could not load land zones.");
      });
  }, [navigate]);

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

    const payload = {
      assetCategory: 'LIVESTOCK',
      species: formData.species,
      headCount: parseInt(formData.headCount),
      dailyFeedKg: parseFloat(formData.dailyFeedKg),
      status: formData.status,
      dateAcquired: new Date().toISOString().split('T')[0],
      lastVaccinationDate: formData.lastVaccinationDate || null, // NEW
      landZone: {
        zoneId: parseInt(formData.zoneId)
      }
    };

    fetch('${import.meta.env.VITE_API_URL}/api/livestock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (response.ok) {
          toast.success('Livestock added successfully! 🐄');
          navigate('/livestock'); 
        } else {
          toast.error('Failed to add livestock.');
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Register New Livestock</h2>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 border-t-4 border-t-blue-500">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Species/Breed (e.g., Kangayam Cattle)</label>
          <input type="text" name="species" required value={formData.species} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Land Zone</label>
          <select name="zoneId" required value={formData.zoneId} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Head Count</label>
            <input type="number" name="headCount" required min="1" value={formData.headCount} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Feed per animal (Kg)</label>
            <input type="number" name="dailyFeedKg" required min="0" step="0.1" value={formData.dailyFeedKg} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        {/* --- NEW VACCINATION FIELD --- */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Vaccination Date</label>
            <input type="date" name="lastVaccinationDate" value={formData.lastVaccinationDate} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="ACTIVE">ACTIVE</option>
              <option value="QUARANTINED">QUARANTINED</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button type="button" onClick={() => navigate('/livestock')} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300">
            {isSubmitting ? 'Saving...' : 'Save Livestock'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddLivestockForm;