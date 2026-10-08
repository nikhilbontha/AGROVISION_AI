import React, { useState, useEffect } from 'react';
import { Scan, Eye, Image as ImageIcon, CheckCircle, AlertTriangle, Calendar, User, Shield } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DetailModal from '../components/DetailModal';
import FilterBar from '../components/FilterBar';
import { adminApi } from '../services/adminApi';

const DetectionRecords = () => {
  const [detections, setDetections] = useState([]);
  const [crops, setCrops] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [cropFilter, setCropFilter] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');

  // Selected item modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const detData = await adminApi.getDetections();
      const cropData = await adminApi.getCrops();
      const disData = await adminApi.getDiseases();
      setDetections(detData);
      setCrops(cropData);
      setDiseases(disData);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredDetections = detections.filter(d => {
    if (cropFilter && d.crop !== cropFilter) return false;
    if (diseaseFilter && !d.disease.toLowerCase().includes(diseaseFilter.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { label: 'Farmer / User', key: 'user_name', className: 'font-semibold text-white' },
    { label: 'Crop', key: 'crop', className: 'text-slate-300' },
    {
      label: 'Uploaded Leaf Image',
      key: 'image_url',
      sortable: false,
      render: (val) => (
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
          {val ? (
            <img src={val} alt="Leaf scan" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-500" />
          )}
        </div>
      )
    },
    {
      label: 'Detected Pathogen',
      key: 'disease',
      render: (val) => (
        <span className={`font-bold ${val.toLowerCase().includes('healthy') ? 'text-emerald-400' : 'text-amber-400'}`}>
          {val}
        </span>
      )
    },
    {
      label: 'AI Confidence',
      key: 'confidence',
      render: (val) => (
        <span className="font-mono font-bold text-emerald-400">
          {val}%
        </span>
      )
    },
    { label: 'Timestamp', key: 'date', className: 'font-mono text-slate-400' },
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
        <button
          onClick={() => { setSelectedRecord(row); setIsDetailOpen(true); }}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" /> Detail
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scan className="w-6 h-6 text-farm-green" /> Crop Disease Detection Audit Log
          </h2>
          <p className="text-xs text-slate-400">Comprehensive real-time log of all computer vision crop scans</p>
        </div>
      </div>

      <DataTable
        title="Leaf Scan Detections Log"
        subtitle={`Showing ${filteredDetections.length} recorded scans`}
        columns={columns}
        data={filteredDetections}
        isLoading={loading}
        searchPlaceholder="Search detection ID, user, disease..."
        filterComponent={
          <FilterBar
            filters={[
              { key: 'crop', label: 'Crop', options: crops.map(c => c.name) }
            ]}
            values={{ crop: cropFilter }}
            onChange={(_, val) => setCropFilter(val)}
            onReset={() => setCropFilter('')}
          />
        }
      />

      {/* Detection Detail Modal */}
      {selectedRecord && (
        <DetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Detection Inspection — ${selectedRecord.id}`}
        >
          <div className="space-y-4 text-xs">
            {/* Image Preview & Result Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-farm-dark p-4 rounded-xl border border-slate-800">
              <div className="md:col-span-1 rounded-xl overflow-hidden border border-slate-700 aspect-square bg-slate-900 flex items-center justify-center">
                {selectedRecord.image_url ? (
                  <img src={selectedRecord.image_url} alt="Leaf scan detail" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-slate-600" />
                )}
              </div>

              <div className="md:col-span-2 space-y-3 flex flex-col justify-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Detected Condition</span>
                  <h4 className="text-lg font-extrabold text-amber-400">{selectedRecord.disease}</h4>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block font-medium">Confidence Score</span>
                    <span className="font-mono text-base font-extrabold text-emerald-400">{selectedRecord.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Scan Status</span>
                    <StatusBadge status={selectedRecord.status} />
                  </div>
                </div>

                <div className="text-slate-400 flex items-center gap-2 pt-1">
                  <User className="w-3.5 h-3.5" /> {selectedRecord.user_name} | <Calendar className="w-3.5 h-3.5" /> {selectedRecord.date}
                </div>
              </div>
            </div>

            {/* Diagnostic Information */}
            <div className="p-3.5 rounded-xl bg-farm-dark border border-slate-800 space-y-2">
              <h5 className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Pathogen Symptoms & Diagnostic Features
              </h5>
              <p className="text-slate-200 leading-relaxed">
                Leaf imagery analysis revealed characteristic lesions, leaf spots, and tissue discoloration consistent with {selectedRecord.disease} on {selectedRecord.crop}.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-farm-dark border border-slate-800 space-y-2">
              <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Recommended Treatment Plan
              </h5>
              <p className="text-slate-200 leading-relaxed">
                Apply targeted organic or copper-based fungicide spray every 7-10 days during high humidity. Ensure proper plant spacing to facilitate airflow and reduce foliar moisture.
              </p>
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
};

export default DetectionRecords;
