import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DeleteModal from './DeleteModal';

const ZoneList = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/zones`)
      .then(res => res.json())
      .then(data => {
        setZones(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const openDeleteModal = (zone) => {
    setSelectedZone(zone);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/zones/${selectedZone.zoneId}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          toast.success('Land zone removed!');
          setZones(zones.filter(z => z.zoneId !== selectedZone.zoneId));
        } else {
          toast.error('Cannot delete zone with active assets.');
        }
      })
      .finally(() => setIsModalOpen(false));
  };

  if (loading) return <div className="p-8 text-emerald-700 font-medium">Loading Land Data...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <DeleteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={confirmDelete}
        itemName={selectedZone?.zoneName}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Land Management</h2>
        <Link to="/register-land" className="bg-emerald-600 text-white px-6 py-2 rounded-lg shadow-sm transition-all font-medium hover:bg-emerald-700">
          + Register New Zone
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-tighter">
              {/* Changed ID to Zone # and added strict widths */}
              <th className="p-4 font-semibold w-[10%]">Zone #</th>
              <th className="p-4 font-semibold w-[30%]">Zone Name</th>
              <th className="p-4 font-semibold w-[20%]">Area (Acres)</th>
              <th className="p-4 font-semibold w-[25%]">Soil Type</th>
              <th className="p-4 font-semibold w-[15%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {zones.map((zone, index) => (
              <tr key={zone.zoneId} className="hover:bg-gray-50 transition-colors">
                {/* Replaced zoneId with a sequential number (index + 1) */}
                <td className="p-4 font-bold text-gray-500">{index + 1}</td>
                
                <td className="p-4 font-bold text-gray-800">{zone.zoneName}</td>
                
                {/* Fixed the variable name to match Spring Boot (sizeAcres) */}
                <td className="p-4 text-gray-600 text-sm">
                  {zone.sizeAcres ? `${zone.sizeAcres} Acres` : 'N/A'}
                </td>
                
                {/* Added the Soil Type column */}
                <td className="p-4 text-gray-600 text-sm">
                  {zone.soilType || 'N/A'}
                </td>
                
                <td className="p-4 text-right space-x-4">
                  <Link to={`/edit-zone/${zone.zoneId}`} className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors">EDIT</Link>
                  <button onClick={() => openDeleteModal(zone)} className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors">DELETE</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {zones.length === 0 && (
          <div className="p-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-b-xl">
            No land zones registered yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneList;