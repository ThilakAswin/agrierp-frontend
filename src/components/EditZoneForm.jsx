import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditZoneForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Initial state matches your Java Entity fields
  const [formData, setFormData] = useState({
    zoneName: '',
    sizeAcres: '', 
    soilType: ''   
  });

  // 2. Fetch existing data and map it to the state
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/zones`)
      .then(res => res.json())
      .then(data => {
        // Find the specific zone by ID
        const zone = data.find(z => z.zoneId === parseInt(id));
        if (zone) {
          setFormData({
            zoneName: zone.zoneName,
            sizeAcres: zone.sizeAcres,
            soilType: zone.soilType
          });
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        toast.error("Failed to load zone data.");
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Ensure sizeAcres is sent as a number for the Double field in Java
    const payload = {
      ...formData,
      sizeAcres: parseFloat(formData.sizeAcres)
    };

    fetch(`${import.meta.env.VITE_API_URL}/api/zones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (res.ok) {
        toast.success('Zone updated successfully! 🔄');
        navigate('/zones');
      } else {
        toast.error('Failed to update zone.');
      }
    })
    .catch(err => {
      console.error("Update error:", err);
      toast.error("Network error.");
    })
    .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Zone #{id}</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-4 border-t-4 border-t-emerald-600">
        
        {/* Zone Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
          <input 
            type="text" 
            required
            value={formData.zoneName} 
            onChange={e => setFormData({...formData, zoneName: e.target.value})} 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Size in Acres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (Acres)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={formData.sizeAcres} 
              onChange={e => setFormData({...formData, sizeAcres: e.target.value})} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
            <input 
              type="text" 
              required
              value={formData.soilType} 
              onChange={e => setFormData({...formData, soilType: e.target.value})} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/zones')} 
            className="flex-1 bg-gray-100 py-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
          >
            {isSubmitting ? 'Updating...' : 'Update Zone'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditZoneForm;