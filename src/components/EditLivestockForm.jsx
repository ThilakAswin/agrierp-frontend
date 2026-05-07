import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditLivestockForm = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 1. Initial state includes the new Last Vaccination Date
  const [formData, setFormData] = useState({
    species: '',
    headCount: '',
    dailyFeedKg: '',
    status: 'ACTIVE',
    lastVaccinationDate: '' // NEW
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/livestock`)
      .then(res => res.json())
      .then(data => {
        const animalToEdit = data.find(a => a.assetId === parseInt(id));
        if (animalToEdit) {
          // 2. Load existing data, including the vaccination date if it exists
          setFormData({
            species: animalToEdit.species,
            headCount: animalToEdit.headCount,
            dailyFeedKg: animalToEdit.dailyFeedKg,
            status: animalToEdit.status,
            lastVaccinationDate: animalToEdit.lastVaccinationDate || '' // Load if exists
          });
        }
      })
      .catch(err => {
        console.error("Error fetching livestock data:", err);
        toast.error("Failed to load livestock data.");
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 3. Add the vaccination date to the payload
    const payload = {
      species: formData.species,
      headCount: parseInt(formData.headCount),
      dailyFeedKg: parseFloat(formData.dailyFeedKg),
      status: formData.status,
      lastVaccinationDate: formData.lastVaccinationDate || null
    };

    fetch(`${import.meta.env.VITE_API_URL}/api/livestock/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (response.ok) {
          toast.success('Livestock updated successfully! 🐄');
          navigate('/livestock'); 
        } else {
          toast.error('Failed to update livestock.');
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Livestock #{id}</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 border-t-4 border-t-blue-500">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Species/Breed</label>
          <input type="text" name="species" required value={formData.species} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Head Count</label>
            <input type="number" name="headCount" required min="1" value={formData.headCount} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Feed per animal (Kg)</label>
            <input type="number" name="dailyFeedKg" required min="0" step="0.1" value={formData.dailyFeedKg} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* --- 4. The UI input for the date --- */}
        <div className="border-t pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Vaccination Date</label>
          <input type="date" name="lastVaccinationDate" value={formData.lastVaccinationDate} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          <p className="text-xs text-gray-400 mt-1">Update this when you administer new vaccines manually.</p>
        </div>

        <div className="border-t pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 bg-white outline-none">
            <option value="ACTIVE">ACTIVE</option>
            <option value="QUARANTINED">QUARANTINED</option>
            <option value="SOLD">SOLD</option>
          </select>
        </div>

        <div className="pt-4 flex gap-4">
          <button type="button" onClick={() => navigate('/livestock')} className="flex-1 bg-gray-100 py-2 rounded text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
            {isSubmitting ? 'Updating...' : 'Update Livestock'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLivestockForm;