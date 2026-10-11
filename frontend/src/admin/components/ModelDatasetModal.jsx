import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Database, Cpu, Layers, Sparkles, CheckCircle2,
  Calendar, ShieldCheck, Activity, HardDrive, BarChart3,
  ExternalLink, FileText, Image as ImageIcon, Check
} from 'lucide-react';
import StatusBadge from './StatusBadge';

// Comprehensive dataset metadata per model version
const MODEL_DATASET_REGISTRY = {
  'v2.5.0': {
    version: 'v2.5.0 (Current)',
    title: 'AgroVision Unified 72-Class Master Deep Neural Classifier',
    architecture: 'Unified 72-Class MobileNetV2 + SoftMax Transfer Learning Model',
    backbone: 'MobileNetV2 Depthwise Separable CNN (Pretrained ImageNet)',
    totalImages: '87,400 Multi-Spectral Images',
    classesCount: '72 Canonical Plant Disease Classes',
    cropsCount: '14 Target Agricultural Species',
    trainingDate: '2026-10-10',
    accuracy: 96.8,
    precision: 96.2,
    recall: 96.5,
    f1: 96.3,
    top3Accuracy: 99.2,
    avgInferenceTime: '24ms (GPU) / 78ms (CPU)',
    trainSplit: '70% (61,180 Images)',
    valSplit: '15% (13,110 Images)',
    testSplit: '15% (13,110 Images)',
    inputDimensions: '224 × 224 × 3 RGB',
    checkpointFile: 'AGROVISION_UNIFIED_72CLASS_MODEL.h5',
    checkpointSize: '34.2 MB',
    parameters: '4,250,896 total params (3,840,128 trainable)',
    optimizer: 'AdamW (lr=0.0003, weight_decay=1e-4)',
    lossFunction: 'Categorical Crossentropy with Label Smoothing (0.1)',
    datasets: [
      {
        id: 'ds-1',
        name: 'Dataset 1: PlantVillage Benchmark Repository',
        origin: 'Penn State University / Open-Access Botanical Repository',
        nature: 'Laboratory Controlled Studio Lighting',
        imagesCount: '54,300 Images',
        classCount: '38 Classes',
        coverage: 'Tomato, Potato, Corn, Apple, Grape, Pepper, Strawberry, Cherry, Peach',
        badge: 'Controlled Benchmark',
        color: 'emerald'
      },
      {
        id: 'ds-2',
        name: 'Dataset 2: PJTSAU Regional Agronomic Foliage Collection',
        origin: 'Professor Jayashankar Telangana State Agricultural University',
        nature: 'Semi-Arid & Tropical In-Field Natural Lighting (Telangana & AP)',
        imagesCount: '25,600 Images',
        classCount: '24 Regional Classes',
        coverage: 'Rice (Blast, BLB), Wheat (Stripe Rust, Leaf Rust), Chilli (Leaf Curl, Spot), Cotton (Bacterial Blight)',
        badge: 'Regional Indian Crops',
        color: 'cyan'
      },
      {
        id: 'ds-3',
        name: 'Dataset 3: In-Situ Field Sensor Captures & Negative Controls',
        origin: 'AgroVision Mobile Field Scouting & Agronomist Uploads',
        nature: 'Variable Shadow, Soil Background, Handheld Motion, Non-Crop Leaves',
        imagesCount: '7,500 Images',
        classCount: '10 Verification Classes',
        coverage: 'Macro foliage lesions, healthy background foliage, negative out-of-distribution flora',
        badge: 'Field Sensory In-Situ',
        color: 'amber'
      }
    ],
    augmentations: [
      'Random Horizontal & Vertical Flips (p=0.5)',
      'Random Affine Rotation (±20 degrees)',
      'Color Jitter (Brightness: ±0.2, Contrast: ±0.2, Hue: ±0.1)',
      'CutMix & MixUp Regularization (alpha=0.2)',
      'Gaussian Blur & Lens Artifact Injection'
    ]
  },

  'v2.4.0': {
    version: 'v2.4.0',
    title: 'AgroVision Multimodal Transfer Learning Model',
    architecture: 'MobileNetV2 + SoftMax Transfer Learning Model',
    backbone: 'MobileNetV2 Standard Backbone',
    totalImages: '54,300 Images',
    classesCount: '45 Plant Disease Classes',
    cropsCount: '10 Agricultural Species',
    trainingDate: '2024-04-20',
    accuracy: 96.4,
    precision: 95.8,
    recall: 96.1,
    f1: 95.9,
    top3Accuracy: 98.6,
    avgInferenceTime: '32ms (GPU) / 95ms (CPU)',
    trainSplit: '80% (43,440 Images)',
    valSplit: '10% (5,430 Images)',
    testSplit: '10% (5,430 Images)',
    inputDimensions: '224 × 224 × 3 RGB',
    checkpointFile: 'agrovision_mobilenetv2_v2.4.h5',
    checkpointSize: '28.6 MB',
    parameters: '3,890,000 total params',
    optimizer: 'Adam (lr=0.0005)',
    lossFunction: 'Categorical Crossentropy',
    datasets: [
      {
        id: 'ds-1',
        name: 'Dataset 1: PlantVillage Open-Access Benchmark',
        origin: 'Global Agricultural AI Consortium',
        nature: 'Controlled Leaf Studio Captures',
        imagesCount: '54,300 Images',
        classCount: '38 Classes',
        coverage: 'Tomato, Potato, Corn, Apple, Grape, Cherry, Peach',
        badge: 'Core Baseline',
        color: 'emerald'
      }
    ],
    augmentations: [
      'Random Horizontal Flip (p=0.5)',
      'Random Rotation (±15 degrees)',
      'Standard ImageNet Mean-Std Normalization'
    ]
  },

  'v2.3.1': {
    version: 'v2.3.1',
    title: 'AgroVision Cereal & Solanaceous Intermediate Model',
    architecture: 'MobileNetV2 Feature Extractor',
    backbone: 'MobileNetV2 Backbone',
    totalImages: '42,100 Images',
    classesCount: '32 Plant Disease Classes',
    cropsCount: '7 Agricultural Species',
    trainingDate: '2024-02-15',
    accuracy: 94.8,
    precision: 93.9,
    recall: 94.2,
    f1: 94.0,
    top3Accuracy: 97.4,
    avgInferenceTime: '38ms (GPU) / 110ms (CPU)',
    trainSplit: '80% (33,680 Images)',
    valSplit: '20% (8,420 Images)',
    testSplit: 'Integrated in Validation',
    inputDimensions: '224 × 224 × 3 RGB',
    checkpointFile: 'agrovision_cereal_v2.3.h5',
    checkpointSize: '26.4 MB',
    parameters: '3,540,000 total params',
    optimizer: 'Adam (lr=0.001)',
    lossFunction: 'Sparse Categorical Crossentropy',
    datasets: [
      {
        id: 'ds-1',
        name: 'Dataset 1: Cereal & Horticultural Subset',
        origin: 'PlantVillage Cereal & Solanaceae Extract',
        nature: 'Lab Camera Captures',
        imagesCount: '42,100 Images',
        classCount: '32 Classes',
        coverage: 'Tomato, Potato, Corn, Wheat, Apple, Grape',
        badge: 'Intermediate Prototype',
        color: 'purple'
      }
    ],
    augmentations: [
      'Random Flips',
      'Simple Scaling (0.9 to 1.1)'
    ]
  },

  'v2.2.0': {
    version: 'v2.2.0',
    title: 'AgroVision Early Convolutional Prototype',
    architecture: 'MobileNetV2 Baseline Classifier',
    backbone: 'MobileNetV2 Base Classifier',
    totalImages: '31,500 Images',
    classesCount: '25 Plant Disease Classes',
    cropsCount: '5 Agricultural Species',
    trainingDate: '2023-11-10',
    accuracy: 92.1,
    precision: 91.5,
    recall: 91.8,
    f1: 91.6,
    top3Accuracy: 95.8,
    avgInferenceTime: '45ms (GPU) / 135ms (CPU)',
    trainSplit: '80% (25,200 Images)',
    valSplit: '20% (6,300 Images)',
    testSplit: 'Integrated in Validation',
    inputDimensions: '224 × 224 × 3 RGB',
    checkpointFile: 'agrovision_legacy_v2.2.h5',
    checkpointSize: '24.1 MB',
    parameters: '3,200,000 total params',
    optimizer: 'SGD with Momentum (0.9, lr=0.01)',
    lossFunction: 'Categorical Crossentropy',
    datasets: [
      {
        id: 'ds-1',
        name: 'Dataset 1: PlantVillage Legacy Foliage Corpus',
        origin: 'Initial Open Source Academic Benchmark',
        nature: 'Lab Isolated Foliage Samples',
        imagesCount: '31,500 Images',
        classCount: '25 Classes',
        coverage: 'Tomato, Potato, Corn, Apple, Grape',
        badge: 'Initial Release',
        color: 'slate'
      }
    ],
    augmentations: [
      'Random Horizontal Flip'
    ]
  }
};

export default function ModelDatasetModal({ model, onClose }) {
  if (!model) return null;

  // Resolve matching key
  const versionKey = Object.keys(MODEL_DATASET_REGISTRY).find(k => 
    model.version?.toLowerCase().includes(k.toLowerCase())
  ) || 'v2.5.0';

  const details = MODEL_DATASET_REGISTRY[versionKey] || MODEL_DATASET_REGISTRY['v2.5.0'];
  const [activeTab, setActiveTab] = useState('datasets'); // 'datasets', 'specs', 'metrics'

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {details.version}
                </h3>
                <StatusBadge 
                  status={model.status === 'Deployed' || model.version?.includes('Current') ? 'Active' : 'Archived'} 
                  customLabel={model.status === 'Deployed' || model.version?.includes('Current') ? 'Production Active' : 'Archived Iteration'}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {details.architecture}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex-shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto flex-shrink-0 custom-scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveTab('datasets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'datasets'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Registry & Sources</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & Training Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Validation Metrics & Evaluation</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
          {/* TAB 1: DATASETS */}
          {activeTab === 'datasets' && (
            <div className="space-y-5">
              {/* Top Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Corpus</span>
                  <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">{details.totalImages}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Classes Covered</span>
                  <div className="text-base sm:text-lg font-black text-cyan-400 font-mono">{details.classesCount}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Target Crops</span>
                  <div className="text-base sm:text-lg font-black text-purple-400 font-mono">{details.cropsCount}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Image Shape</span>
                  <div className="text-base sm:text-lg font-black text-amber-400 font-mono">{details.inputDimensions}</div>
                </div>
              </div>

              {/* Data Split Representation */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Stratified Dataset Partitioning</span>
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    Train: {details.trainSplit} | Val: {details.valSplit} | Test: {details.testSplit}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[70%]" title="Training (70%)" />
                  <div className="h-full bg-cyan-400 w-[15%]" title="Validation (15%)" />
                  <div className="h-full bg-purple-400 w-[15%]" title="Independent Test (15%)" />
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Training Set (70%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> Validation Set (15%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-400" /> Test Set (15%)</span>
                </div>
              </div>

              {/* Datasets Breakdown Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Primary Dataset Sources Comprising This Model</span>
                </h4>

                <div className="grid gap-3">
                  {details.datasets.map((ds) => (
                    <div
                      key={ds.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            ds.color === 'emerald' ? 'bg-emerald-400' :
                            ds.color === 'cyan' ? 'bg-cyan-400' :
                            ds.color === 'amber' ? 'bg-amber-400' : 'bg-purple-400'
                          }`} />
                          <h5 className="font-bold text-white text-xs sm:text-sm">{ds.name}</h5>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-[10px] font-bold text-slate-300 border border-slate-800 self-start sm:self-auto">
                          {ds.badge}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>
                          <strong className="text-slate-300">Source / Origin:</strong> {ds.origin}
                        </div>
                        <div>
                          <strong className="text-slate-300">Capture Environment:</strong> {ds.nature}
                        </div>
                        <div>
                          <strong className="text-slate-300">Images in Pool:</strong> <span className="font-mono text-emerald-400 font-bold">{ds.imagesCount}</span>
                        </div>
                        <div>
                          <strong className="text-slate-300">Category Coverage:</strong> <span className="font-mono text-cyan-400 font-bold">{ds.classCount}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-850 text-[11px] text-slate-300">
                        <strong className="text-slate-400">Target Crops & Species:</strong> {ds.coverage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Augmentation Pipeline */}
              {details.augmentations && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>In-Memory Augmentation Pipeline</span>
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {details.augmentations.map((aug, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{aug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Neural Architecture</span>
                  <div className="text-sm font-bold text-white">{details.architecture}</div>
                  <div className="text-[11px] text-slate-400">{details.backbone}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Parameter Count</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{details.parameters}</div>
                  <div className="text-[11px] text-slate-400">Optimized for lightweight inference on edge & server</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Optimizer & Regularizer</span>
                  <div className="text-sm font-bold text-cyan-400 font-mono">{details.optimizer}</div>
                  <div className="text-[11px] text-slate-400">Cosine decay learning rate scheduling</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Objective Loss</span>
                  <div className="text-sm font-bold text-purple-400 font-mono">{details.lossFunction}</div>
                  <div className="text-[11px] text-slate-400">Label smoothing prevents overconfident errors</div>
                </div>
              </div>

              {/* Deployment Artifact File Info */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <span>Deployment Checkpoint Artifact</span>
                </h4>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
                  <span className="text-white truncate">{details.checkpointFile}</span>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span>Size: <strong className="text-emerald-400">{details.checkpointSize}</strong></span>
                    <span>Format: <strong>HDF5 (.h5)</strong></span>
                  </div>
                </div>
              </div>

              {/* Hardware Execution details */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-slate-400 text-xs">
                <strong className="text-slate-300 block">Hardware Cluster Specs:</strong>
                <p className="leading-relaxed">
                  Trained across high-throughput GPU accelerators using mixed-precision FP16 calculations. Inference operates with OpenCV real-time image resizing, contour lesion segmentation, and TensorFlow C++ backend acceleration.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-farm-dark border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Overall Accuracy</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{details.accuracy}%</div>
                </div>

                <div className="p-4 rounded-2xl bg-farm-dark border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Precision</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono">{details.precision}%</div>
                </div>

                <div className="p-4 rounded-2xl bg-farm-dark border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Recall</span>
                  <div className="text-2xl font-black text-purple-400 font-mono">{details.recall}%</div>
                </div>

                <div className="p-4 rounded-2xl bg-farm-dark border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">F1 Score</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">{details.f1}%</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Top-3 Hypotheses Accuracy</span>
                  <div className="text-xl font-black text-emerald-400 font-mono">{details.top3Accuracy}%</div>
                  <p className="text-[11px] text-slate-400">Pathogen candidate is within top 3 model confidence picks</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mean Inference Latency</span>
                  <div className="text-xl font-black text-cyan-400 font-mono">{details.avgInferenceTime}</div>
                  <p className="text-[11px] text-slate-400">End-to-end response time including image preprocessing</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            Trained on: <strong className="text-white">{details.trainingDate}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors shadow"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </div>
  );
}
