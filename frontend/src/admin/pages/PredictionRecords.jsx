import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Thermometer, Droplets, CloudRain, Maximize2, Calendar, User } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DetailModal from '../components/DetailModal';
import FilterBar from '../components/FilterBar';
import { adminApi } from '../services/adminApi';

const PredictionRecords = () => {
  const [predictions, setPredictions] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cropFilter, setCropFilter] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const pData = await adminApi.getPredictions();
      const cData = await adminApi.getCrops();
      setPredictions(pData);
      setCrops(cData);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredPredictions = predictions.filter(p => {
    if (cropFilter && p.crop !== cropFilter) return false;
    return true;
  });

  const columns = [
    { label: 'Farmer / User', key: 'user_name', className: 'font-semibold text-white' },
    { label: 'Crop', key: 'crop', className: 'text-slate-300' },
    { label: 'Plot Area (Acres)', key: 'area', className: 'font-mono text-center' },
    {
      label: 'Input Environmental Params',
      key: 'params',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>🌡️ {row.temperature}°C</span>
          <span>💧 {row.humidity}%</span>
          <span>🌧️ {row.rainfall}mm</span>
        </div>
      )
    },
    {
      label: 'Predicted Metric Yield',
      key: 'predicted_yield',
      render: (val, row) => (
        <span className="font-mono font-extrabold text-cyan-400 text-sm">
          {val} <span className="text-[10px] text-slate-400 font-normal">{row.unit || 'Tons/Hectare'}</span>
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
          onClick={() => { setSelectedPrediction(row); setIsDetailOpen(true); }}
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
            <TrendingUp className="w-6 h-6 text-farm-green" /> Yield Prediction Management
          </h2>
          <p className="text-xs text-slate-400">Log of machine learning crop harvest and yield forecasts</p>
        </div>
      </div>

      <DataTable
        title="Crop Yield Forecasts Log"
        subtitle={`Showing ${filteredPredictions.length} predictions`}
        columns={columns}
        data={filteredPredictions}
        isLoading={loading}
        searchPlaceholder="Search prediction ID, user, crop..."
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

      {/* Yield Prediction Detail View Modal */}
      {selectedPrediction && (
        <DetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Prediction Breakdown — ${selectedPrediction.id}`}
        >
          <div className="space-y-4 text-xs">
            {/* Forecast Highlight */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-farm-dark to-farm-dark border border-cyan-500/30 text-center space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Estimated Crop Harvest Forecast
              </span>
              <div className="text-3xl font-extrabold text-cyan-400 font-mono">
                {selectedPrediction.predicted_yield} <span className="text-sm text-slate-300">Tons / Hectare</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Generated for <strong className="text-white">{selectedPrediction.crop}</strong> ({selectedPrediction.area} Acres Plot)
              </p>
            </div>

            {/* Parameter Cards */}
            <h5 className="font-bold text-slate-200">Input Feature Matrix</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Thermometer className="w-4 h-4" /> Temp
                </div>
                <p className="font-mono text-base font-bold text-white">{selectedPrediction.temperature}°C</p>
              </div>

              <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <Droplets className="w-4 h-4" /> Humidity
                </div>
                <p className="font-mono text-base font-bold text-white">{selectedPrediction.humidity}%</p>
              </div>

              <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <CloudRain className="w-4 h-4" /> Rainfall
                </div>
                <p className="font-mono text-base font-bold text-white">{selectedPrediction.rainfall} mm</p>
              </div>

              <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Maximize2 className="w-4 h-4" /> Plot Area
                </div>
                <p className="font-mono text-base font-bold text-white">{selectedPrediction.area} Acres</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedPrediction.user_name}</span>
              <span className="flex items-center gap-1.5 font-mono"><Calendar className="w-3.5 h-3.5" /> {selectedPrediction.date}</span>
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
};

export default PredictionRecords;
