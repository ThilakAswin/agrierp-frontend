import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditCropForm = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 1. Added the new fields to the initial state
  const [formData, setFormData] = useState({
    cropVariety: '',
    assetCategory: 'CROP', 
    quantityPlanted: '',
    status: 'ACTIVE',
    irrigationFrequencyDays: '', // NEW
    expectedHarvestDate: ''      // NEW
  });

  useEffect(() => {
    fetch('${import.meta.env.VITE_API_URL}/api/crops')
      .then(res => res.json())
      .then(data => {
        const cropToEdit = data.find(c => c.assetId === parseInt(id));
        if (cropToEdit) {
          // 2. Load the existing dates into the form
          setFormData({
            cropVariety: cropToEdit.cropVariety,
            assetCategory: cropToEdit.assetCategory,
            quantityPlanted: cropToEdit.quantityPlanted,
            status: cropToEdit.status,
            irrigationFrequencyDays: cropToEdit.irrigationFrequencyDays || '', // Load if exists
            expectedHarvestDate: cropToEdit.expectedHarvestDate || ''          // Load if exists
          });
        }
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 3. Add the new fields to the PUT payload
    const payload = {
      cropVariety: formData.cropVariety,
      assetCategory: formData.assetCategory,
      quantityPlanted: parseInt(formData.quantityPlanted),
      status: formData.status,
      irrigationFrequencyDays: formData.irrigationFrequencyDays ? parseInt(formData.irrigationFrequencyDays) : null,
      expectedHarvestDate: formData.expectedHarvestDate || null
    };

    fetch(`${import.meta.env.VITE_API_URL}/api/crops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (response.ok) {
          toast.success('Asset updated successfully! 🔄');
          navigate('/crops'); 
        } else {
          toast.error('Failed to update asset.');
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Asset #{id}</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
          <input type="text" name="cropVariety" required value={formData.cropVariety} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="assetCategory" value={formData.assetCategory} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 bg-white">
              <option value="CROP">CROP</option>
              <option value="TIMBER">TIMBER</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input type="number" name="quantityPlanted" required value={formData.quantityPlanted} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        {/* --- 4. Added the UI inputs for the dates --- */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Watering Frequency (Days)</label>
            <input type="number" name="irrigationFrequencyDays" min="1" placeholder="e.g. 2" value={formData.irrigationFrequencyDays} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
            <input type="date" name="expectedHarvestDate" value={formData.expectedHarvestDate} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 bg-white">
            <option value="ACTIVE">ACTIVE</option>
            <option value="MATURING">MATURING</option>
            <option value="HARVESTED">HARVESTED</option>
            <option value="DISEASED">DISEASED</option>
            <option value="SOLD">SOLD</option>
          </select>
        </div>

        <div className="pt-4 flex gap-4">
          <button type="button" onClick={() => navigate('/crops')} className="flex-1 bg-gray-100 py-2 rounded text-gray-700 hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">
            {isSubmitting ? 'Updating...' : 'Update Asset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCropForm;