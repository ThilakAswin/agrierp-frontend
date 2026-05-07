import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import CropList from './components/CropList';
import LivestockList from './components/LivestockList';
import AddCropForm from './components/AddCropForm';
import EditCropForm from './components/EditCropForm';
import AddLivestockForm from './components/AddLivestockForm';
import EditLivestockForm from './components/EditLivestockForm';
import AddZoneForm from './components/AddZoneForm';
import ZoneList from './components/ZoneList';
import EditZoneForm from './components/EditZoneForm';
import SalesLedger from './components/SalesLedger';


function App() {
  return (
    // The Router component wraps everything that needs navigation
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" reverseOrder={false} />
        {/* Top Navigation Bar */}
        <nav className="bg-green-800 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
<img 
  src="/logo.png" 
  alt="Green Archive Logo" 
  className="w-9 h-9 bg-white rounded-full p-1 shadow-sm" 
/>
              <h1 className="text-xl font-bold tracking-wide">Green Archive</h1>
            </div>

            {/* Navigation Links */}
           <div className="flex gap-6 font-medium">
  <Link to="/" className="hover:text-green-300 transition-colors">Dashboard</Link>
  <Link to="/zones" className="hover:text-green-300 transition-colors">Manage Land</Link> {/* New Link */}
  <Link to="/crops" className="hover:text-green-300 transition-colors">Crops & Timber</Link>
  <Link to="/livestock" className="hover:text-green-300 transition-colors">Livestock</Link>
  <Link to="/financials" className="hover:text-amber-200 transition-colors">Financials</Link>
</div>
            
          </div>
        </nav>

        {/* Main Content Area (This changes based on the URL) */}
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crops" element={<CropList />} />
            <Route path="/livestock" element={<LivestockList />} />
            <Route path="/add-crop" element={<AddCropForm />} />
            <Route path="/edit-crop/:id" element={<EditCropForm />} />
            <Route path="/add-livestock" element={<AddLivestockForm />} />
            <Route path="/edit-livestock/:id" element={<EditLivestockForm />} />
            <Route path="/register-land" element={<AddZoneForm />} />
            <Route path="/zones" element={<ZoneList />} />
            <Route path="/edit-zone/:id" element={<EditZoneForm />} />
            <Route path="/financials" element={<SalesLedger />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;