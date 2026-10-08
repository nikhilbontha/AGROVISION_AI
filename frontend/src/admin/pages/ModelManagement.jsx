import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, RefreshCw, BarChart2, Database, Calendar, Server, Layers } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

const ModelManagement = () => {
  const { addToast } = useAdmin();
  const [modelHistory, setModelHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await adminApi.getModelHistory();
      setModelHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, []);

  const handleSimulateRetrain = () => {
    setIsRetraining(true);
    addToast('Initiating model retraining pipeline on GPU cluster...', 'warning');
    setTimeout(() => {
      setIsRetraining(false);
      addToast('Model retrained successfully! Accuracy improved to 97.1% (v2.5.0)', 'success');
    }, 3000);
  };

  const currentModel = modelHistory[0] || {
    version: 'v2.4.0',
    accuracy: 96.4,
    precision: 95.8,
    recall: 96.1,
    f1_score: 95.9,
    dataset_size: '54,300 Images',
    training_date: '2024-04-20',
    status: 'Deployed'
  };

  const classPerformanceData = [
    { class: 'Tomato Early Blight', accuracy: 98.2, f1: 98.0 },
    { class: 'Corn Leaf Blight', accuracy: 96.5, f1: 96.1 },
    { class: 'Potato Late Blight', accuracy: 95.8, f1: 95.4 },
    { class: 'Grape Black Rot', accuracy: 97.1, f1: 96.9 },
    { class: 'Apple Scab', accuracy: 94.6, f1: 94.2 }
  ];

  const columns = [
    {
      label: 'Model Version',
      key: 'version',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="font-mono font-bold text-white">{val}</span>
        </div>
      )
    },
    { label: 'Validation Accuracy', key: 'accuracy', render: (val) => <span className="font-mono font-bold text-emerald-400">{val}%</span> },
    { label: 'Precision', key: 'precision', render: (val) => <span className="font-mono text-cyan-400">{val}%</span> },
    { label: 'Recall', key: 'recall', render: (val) => <span className="font-mono text-purple-400">{val}%</span> },
    { label: 'F1 Score', key: 'f1_score', render: (val) => <span className="font-mono font-bold text-amber-400">{val}%</span> },
    { label: 'Dataset Size', key: 'dataset_size', className: 'text-slate-300' },
    { label: 'Training Date', key: 'training_date', className: 'font-mono text-slate-400' },
    { label: 'Deployment Status', key: 'status', render: (val) => <StatusBadge status={val} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-farm-green" /> ML Model Architecture & Performance
          </h2>
          <p className="text-xs text-slate-400">Deep Learning MobileNetV2 / ResNet CNN Model monitoring and version control</p>
        </div>

        <button
          onClick={handleSimulateRetrain}
          disabled={isRetraining}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-farm-green hover:bg-emerald-400 text-black font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'Retraining Pipeline Running...' : 'Retrain Model on Latest Data'}
        </button>
      </div>

      {/* Active Model Summary Banner */}
      <div className="bg-gradient-to-r from-farm-card via-slate-900 to-farm-card p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">AgroVision-CNN Classifier</h3>
                <StatusBadge status="Active" customLabel="Production Active" />
              </div>
              <p className="text-xs text-slate-400">Architecture: MobileNetV2 + SoftMax Transfer Learning Model</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-farm-dark border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CURRENT VERSION</span>
              <strong className="text-emerald-400">{currentModel.version}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-farm-dark border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TRAINED ON</span>
              <strong className="text-white">{currentModel.training_date}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-farm-dark border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DATASET SIZE</span>
              <strong className="text-cyan-400">{currentModel.dataset_size}</strong>
            </div>
          </div>
        </div>

        {/* Metric Cards (Accuracy, Precision, Recall, F1 Score) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-farm-dark border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Overall Accuracy</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{currentModel.accuracy}%</div>
          </div>

          <div className="p-4 rounded-xl bg-farm-dark border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Precision</span>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono">{currentModel.precision}%</div>
          </div>

          <div className="p-4 rounded-xl bg-farm-dark border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Recall</span>
            <div className="text-2xl font-extrabold text-purple-400 font-mono">{currentModel.recall}%</div>
          </div>

          <div className="p-4 rounded-xl bg-farm-dark border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">F1 Score</span>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">{currentModel.f1_score}%</div>
          </div>
        </div>
      </div>

      {/* Model Class F1 Score Breakdown Chart */}
      <ChartCard title="Class-Level Accuracy & F1 Score Metrics" subtitle="Model confidence per plant disease category">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={classPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="class" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis domain={[90, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
            <Bar dataKey="accuracy" fill="#2ecc71" radius={[4, 4, 0, 0]} name="Accuracy %" />
            <Bar dataKey="f1" fill="#3b82f6" radius={[4, 4, 0, 0]} name="F1 Score %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Model Version History Table */}
      <DataTable
        title="Model Version Deployment History"
        subtitle="Historical log of trained convolutional neural network iterations"
        columns={columns}
        data={modelHistory}
        isLoading={loading}
        searchPlaceholder="Search model version..."
      />
    </div>
  );
};

export default ModelManagement;
