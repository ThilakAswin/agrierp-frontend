import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddZoneForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. State keys now match your Java Entity exactly
  const [formData, setFormData] = useState({
    zoneName: '',
    sizeAcres: '', 
    soilType: ''   
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convert sizeAcres to a number before sending to Spring Boot
    const payload = {
      ...formData,
      sizeAcres: parseFloat(formData.sizeAcres)
    };

    fetch('http://localhost:8080/api/zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          toast.success('Land Zone registered successfully! 🗺️');
          navigate('/'); // Redirect to Dashboard
        } else {
          toast.error('Failed to register zone.');
        }
      })
      .catch(error => {
        console.error("Error:", error);
        toast.error('Network error.');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Register Land Zone</h2>
      <p className="text-gray-500 mb-6">Define your farm partitions before adding assets.</p>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4 border-t-4 border-t-emerald-600">
        
        {/* Zone Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name (e.g., North Mango Grove)</label>
          <input 
            type="text" 
            required 
            value={formData.zoneName} 
            onChange={(e) => setFormData({...formData, zoneName: e.target.value})}
            className="w-full border rounded p-2 focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Size in Acres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (Acres)</label>
            <input 
              type="number" 
              required 
              step="0.01"
              value={formData.sizeAcres} 
              onChange={(e) => setFormData({...formData, sizeAcres: e.target.value})}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 5.5"
            />
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
            <input 
              type="text" 
              required
              value={formData.soilType} 
              onChange={(e) => setFormData({...formData, soilType: e.target.value})}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Red Soil"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-gray-100 py-2 rounded text-gray-700 hover:bg-gray-200">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition-colors disabled:bg-emerald-300"
          >
            {isSubmitting ? 'Registering...' : 'Register Zone'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddZoneForm;