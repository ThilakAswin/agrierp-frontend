import React, { useState, useEffect } from 'react';

const SalesLedger = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both Crops and Livestock to find the ones that made money
    Promise.all([
      fetch('http://localhost:8080/api/crops').then(res => res.json()),
      fetch('http://localhost:8080/api/livestock').then(res => res.json())
    ])
    .then(([crops, livestock]) => {
      
      // 1. Filter and format Crops (Looking for HARVESTED or SOLD)
      const profitableCrops = crops
        .filter(c => c.status === 'HARVESTED' || c.status === 'SOLD')
        .filter(c => c.totalRevenue > 0) // Only show items that actually generated logged revenue
        .map(c => ({
          id: `CROP-${c.assetId}`,
          name: c.cropVariety,
          category: c.assetCategory,
          yield: c.yieldQuantity ? `${c.yieldQuantity} Units` : 'N/A',
          revenue: c.totalRevenue,
          date: c.expectedHarvestDate || 'Unknown' // Using harvest date as proxy for sale date
        }));

      // 2. Filter and format Livestock (Looking for SOLD)
      const profitableLivestock = livestock
        .filter(l => l.status === 'SOLD')
        .filter(l => l.totalRevenue > 0)
        .map(l => ({
          id: `LIVE-${l.assetId}`,
          name: l.species,
          category: 'LIVESTOCK',
          yield: `${l.headCount} Heads`,
          revenue: l.totalRevenue,
          date: l.lastVaccinationDate || 'Unknown' 
        }));

      // 3. Combine them into one accounting book
      const combinedLedger = [...profitableCrops, ...profitableLivestock];
      
      // Calculate the massive total
      const total = combinedLedger.reduce((sum, item) => sum + item.revenue, 0);

      setSalesData(combinedLedger);
      setTotalRevenue(total);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching financial data:", err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-amber-600 font-bold">Loading Financial Records...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Financial Ledger</h2>
          <p className="text-gray-500 text-sm mt-1">Track your farm's lifetime yield and revenue.</p>
        </div>
      </div>

      {/* Big Revenue Summary Card */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-8 text-white flex items-center justify-between">
        <div>
          <p className="text-amber-100 font-bold uppercase tracking-wider text-sm mb-1">Total Lifetime Revenue</p>
          <h1 className="text-5xl font-extrabold flex items-center gap-2">
            ₹{totalRevenue.toLocaleString()}
          </h1>
        </div>
        <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
          <span className="text-3xl">📈</span>
        </div>
      </div>

      {/* The Accounting Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {salesData.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-b-xl">
            No revenue recorded yet. Harvest crops or sell livestock to see your ledger grow!
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="p-4 font-semibold w-[30%]">Asset Name</th>
                <th className="p-4 font-semibold w-[20%]">Category</th>
                <th className="p-4 font-semibold w-[20%]">Total Yield</th>
                <th className="p-4 font-semibold w-[30%] text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salesData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-800">{item.name}</td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                      item.category === 'TIMBER' ? 'bg-amber-100 text-amber-800' : 
                      item.category === 'LIVESTOCK' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  
                  <td className="p-4 text-gray-600 text-sm font-medium">{item.yield}</td>
                  
                  <td className="p-4 text-right">
                    <span className="font-bold text-lg text-emerald-600">
                      +₹{item.revenue.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default SalesLedger;