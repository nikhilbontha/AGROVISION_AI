import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, Plus, Edit2, Trash2, Eye, ShieldAlert, AlertTriangle } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import FormModal from '../components/FormModal';
import DetailModal from '../components/DetailModal';
import ConfirmDialog from '../components/ConfirmDialog';
import FilterBar from '../components/FilterBar';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

const DiseaseManagement = () => {
  const location = useLocation();
  const { addToast } = useAdmin();
  const [diseases, setDiseases] = useState([]);
  const [crops, setCrops] = useState([]);
  const [cropFilter, setCropFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Modals state
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(location.state?.openAdd || false);
  const [editingDisease, setEditingDisease] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    crop: 'Tomato',
    severity: 'High',
    symptoms: '',
    description: '',
    prevention: '',
    treatment: '',
    status: 'Active'
  });

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, disease: null });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const dData = await adminApi.getDiseases();
      const cData = await adminApi.getCrops();
      setDiseases(dData);
      setCrops(cData);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDisease(null);
    setFormData({
      name: '',
      crop: crops[0]?.name || 'Tomato',
      severity: 'High',
      symptoms: '',
      description: '',
      prevention: '',
      treatment: '',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (disease) => {
    setEditingDisease(disease);
    setFormData({ ...disease });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    if (editingDisease) {
      await adminApi.updateDisease(editingDisease.id, formData);
      setDiseases(prev => prev.map(d => d.id === editingDisease.id ? { ...d, ...formData } : d));
      addToast(`Disease "${formData.name}" updated!`);
    } else {
      const created = await adminApi.addDisease(formData);
      if (created) {
        setDiseases(prev => [created, ...prev]);
      } else {
        const newDisease = { id: `DIS-${diseases.length + 101}`, ...formData, detections: 0 };
        setDiseases(prev => [newDisease, ...prev]);
      }
      addToast(`Disease "${formData.name}" saved to MongoDB!`);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (disease) => {
    setConfirmDialog({
      isOpen: true,
      disease,
      action: async () => {
        await adminApi.deleteDisease(disease.id);
        setDiseases(prev => prev.filter(d => d.id !== disease.id));
        addToast(`Disease "${disease.name}" deleted from database`, 'error');
      }
    });
  };

  const filteredDiseases = diseases.filter(d => {
    if (cropFilter && d.crop !== cropFilter) return false;
    if (severityFilter && d.severity !== severityFilter) return false;
    return true;
  });

  const columns = [
    {
      label: 'Disease Name',
      key: 'name',
      render: (val, row) => (
        <div>
          <span className="font-bold text-white block">{val}</span>
          <span className="text-[11px] text-slate-400">Crop: {row.crop}</span>
        </div>
      )
    },
    {
      label: 'Severity Level',
      key: 'severity',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Total Detections',
      key: 'detections',
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
            onClick={() => { setSelectedDisease(row); setIsDetailOpen(true); }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="View Full Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Edit Disease"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete Disease"
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
            <Activity className="w-6 h-6 text-farm-green" /> Disease Catalog Management
          </h2>
          <p className="text-xs text-slate-400">Manage plant pathogens, symptoms, preventive measures, and treatments</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-farm-green hover:bg-emerald-400 text-black font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Disease Record
        </button>
      </div>

      <DataTable
        title="Plant Pathogen Catalog"
        subtitle={`Showing ${filteredDiseases.length} cataloged plant diseases`}
        columns={columns}
        data={filteredDiseases}
        isLoading={loading}
        searchPlaceholder="Search disease, crop, or symptoms..."
        filterComponent={
          <FilterBar
            filters={[
              { key: 'crop', label: 'Crop', options: crops.map(c => c.name) },
              { key: 'severity', label: 'Severity', options: ['High', 'Medium', 'Low'] }
            ]}
            values={{ crop: cropFilter, severity: severityFilter }}
            onChange={(key, val) => {
              if (key === 'crop') setCropFilter(val);
              if (key === 'severity') setSeverityFilter(val);
            }}
            onReset={() => { setCropFilter(''); setSeverityFilter(''); }}
          />
        }
      />

      {/* Disease Detail View Modal */}
      {selectedDisease && (
        <DetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Disease Overview — ${selectedDisease.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-farm-dark border border-slate-800">
              <div>
                <span className="text-slate-400 block font-medium">Target Crop</span>
                <span className="text-sm font-bold text-white">{selectedDisease.crop}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Severity</span>
                <StatusBadge status={selectedDisease.severity} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">🔍 Visible Symptoms</span>
              <p className="text-slate-200 leading-relaxed">{selectedDisease.symptoms}</p>
            </div>

            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">📖 Pathogen Description</span>
              <p className="text-slate-200 leading-relaxed">{selectedDisease.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">🛡️ Preventive Measures</span>
              <p className="text-slate-200 leading-relaxed">{selectedDisease.prevention}</p>
            </div>

            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800">
              <span className="text-rose-400 font-bold block mb-1">💊 Recommended Treatment</span>
              <p className="text-slate-200 leading-relaxed">{selectedDisease.treatment}</p>
            </div>
          </div>
        </DetailModal>
      )}

      {/* Add / Edit Disease Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        title={editingDisease ? `Edit Disease — ${editingDisease.name}` : 'Add New Plant Disease'}
        submitText={editingDisease ? 'Update Disease' : 'Save Disease'}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Disease Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Tomato Early Blight"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Crop</label>
              <select
                value={formData.crop}
                onChange={e => setFormData({ ...formData, crop: e.target.value })}
                className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
              >
                {crops.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Visible Symptoms</label>
            <textarea
              rows={2}
              value={formData.symptoms}
              onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Preventive Measures</label>
            <textarea
              rows={2}
              value={formData.prevention}
              onChange={e => setFormData({ ...formData, prevention: e.target.value })}
              className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Recommended Treatment</label>
            <textarea
              rows={2}
              value={formData.treatment}
              onChange={e => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-3 py-2 bg-farm-dark border border-slate-700 rounded-xl text-white focus:border-farm-green focus:outline-none"
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, disease: null })}
        onConfirm={confirmDialog.action || (() => {})}
        title="Delete Disease Record"
        message={`Are you sure you want to delete disease "${confirmDialog.disease?.name}"?`}
        danger={true}
      />
    </div>
  );
};

export default DiseaseManagement;
