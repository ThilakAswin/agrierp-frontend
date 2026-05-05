import React from 'react';

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null; // Don't show anything if it's closed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4 text-red-600">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-xl font-bold">Confirm Delete</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-800">"{itemName}"</span>? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;