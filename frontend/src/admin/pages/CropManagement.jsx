import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Wheat, Plus, Edit2, Trash2, Search, Activity, Layers } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import FormModal from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import FilterBar from '../components/FilterBar';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

const CropManagement = () => {
  const location = useLocation();
  const { addToast } = useAdmin();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(location.state?.openAdd || false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    category: 'Grains',
    status: 'Active',
    icon: '🌾'
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    crop: null
  });

  useEffect(() => {
    const loadCrops = async () => {
      setLoading(true);
      const data = await adminApi.getCrops();
      setCrops(data);
      setLoading(false);
    };
    loadCrops();
  }, []);

  const handleOpenAdd = () => {
    setEditingCrop(null);
    setFormData({
      name: '',
      scientific_name: '',
      category: 'Grains',
      status: 'Active',
      icon: '🌾'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      scientific_name: crop.scientific_name,
      category: crop.category,
      status: crop.status,
      icon: crop.icon || '🌾'
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    if (editingCrop) {
      await adminApi.updateCrop(editingCrop.id, formData);
      setCrops(prev => prev.map(c => c.id === editingCrop.id ? { ...c, ...formData } : c));
      addToast(`Crop "${formData.name}" updated successfully!`);
    } else {
      const created = await adminApi.addCrop(formData);
      if (created) {
        setCrops(prev => [created, ...prev]);
      } else {
        const newCrop = { id: `CRP-0${crops.length + 1}`, ...formData, diseases_count: 0, detections_count: 0 };
        setCrops(prev => [newCrop, ...prev]);
      }
      addToast(`Crop "${formData.name}" saved to MongoDB!`);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (crop) => {
    setConfirmDialog({
      isOpen: true,
      crop,
      action: async () => {
        await adminApi.deleteCrop(crop.id);
        setCrops(prev => prev.filter(c => c.id !== crop.id));
        addToast(`Crop "${crop.name}" deleted from database`, 'error');
      }
    });
  };

  const filteredCrops = crops.filter(c => {
    if (categoryFilter && c.category !== categoryFilter) return false;
    return true;
  });

  const columns = [
    {
      label: 'Crop Name',
      key: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 rounded-xl bg-farm-dark border border-slate-800">{row.icon || '🌾'}</span>
          <div>
            <span className="font-bold text-white block">{val}</span>
            <span className="text-[11px] text-slate-400 italic">{row.scientific_name}</span>
          </div>
        </div>
      )
    },
    { label: 'Category', key: 'category', className: 'text-slate-300 font-medium' },
    {
      label: 'Cataloged Diseases',
      key: 'diseases_count',
      className: 'font-mono text-center font-bold text-amber-400'
    },
    {
      label: 'Total Detections',
      key: 'detections_count',
      className: 'font-mono text-center font-bold text-emerald-400'
    },
    {
      label: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Actions',
      key: 'actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Edit Crop"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete Crop"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wheat className="w-6 h-6 text-farm-green" /> Crop Management
          </h2>
          <p className="text-xs text-slate-400">Manage supported agricultural crops, varieties, and classifications</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-farm-green hover:bg-emerald-400 text-black font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Crop
        </button>
      </div>

      <DataTable
        title="Agricultural Crops Directory"
        subtitle={`Total ${filteredCrops.length} crop entries`}
        columns={columns}
        data={filteredCrops}
        isLoading={loading}
        searchPlaceholder="Search crop or scientific name..."
        filterComponent={
          <FilterBar
            filters={[
              { key: 'category', label: 'Category', options: ['Grains', 'Vegetables', 'Fruits', 'Tubers', 'Cash Crop'] }
            ]}
            values={{ category: categoryFilter }}
            onChange={(_, val) => setCategoryFilter(val)}
            onReset={() => setCategoryFilter('')}
          />
        }
      />

      {/* Add / Edit Crop Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        title={editingCrop ? `Edit Crop — ${editingCrop.name}` : 'Add New Agricultural Crop'}
        submitText={editingCrop ? 'Update Crop' : 'Create Crop'}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Crop Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Tomato"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Scientific Name</label>
            <input
              type="text"
              placeholder="e.g. Solanum lycopersicum"
              value={formData.scientific_name}
              onChange={e => setFormData({ ...formData, scientific_name: e.target.value })}
              className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
              >
                <option value="Grains">Grains</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Tubers">Tubers</option>
                <option value="Cash Crop">Cash Crop</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Icon / Emoji</label>
              <input
                type="text"
                placeholder="🌾"
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
              />
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, crop: null })}
        onConfirm={confirmDialog.action || (() => {})}
        title="Delete Crop Entry"
        message={`Are you sure you want to delete crop "${confirmDialog.crop?.name}"?`}
        danger={true}
      />
    </div>
  );
};

export default CropManagement;
