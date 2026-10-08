import React from 'react';
import { X } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-farm-card border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-farm-dark border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="py-4 text-sm text-slate-200 custom-scrollbar max-h-[75vh] overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
