import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, CheckCircle, Trash2, Eye, Filter } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DetailModal from '../components/DetailModal';
import ConfirmDialog from '../components/ConfirmDialog';
import FilterBar from '../components/FilterBar';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

const FeedbackManagement = () => {
  const { addToast } = useAdmin();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, feedback: null });

  useEffect(() => {
    const loadFeedback = async () => {
      setLoading(true);
      const data = await adminApi.getFeedback();
      setFeedbackList(data);
      setLoading(false);
    };
    loadFeedback();
  }, []);

  const handleResolve = (feedback) => {
    const newStatus = feedback.status === 'Resolved' ? 'Pending' : 'Resolved';
    setFeedbackList(prev => prev.map(f => f.id === feedback.id ? { ...f, status: newStatus } : f));
    addToast(`Feedback #${feedback.id} marked as ${newStatus}`);
  };

  const handleDelete = (feedback) => {
    setConfirmDialog({
      isOpen: true,
      feedback,
      action: () => {
        setFeedbackList(prev => prev.filter(f => f.id !== feedback.id));
        addToast(`Feedback #${feedback.id} deleted`, 'error');
      }
    });
  };

  const filteredFeedback = feedbackList.filter(f => {
    if (typeFilter && f.feedback_type !== typeFilter) return false;
    if (statusFilter && f.status !== statusFilter) return false;
    return true;
  });

  const columns = [
    { label: 'Feedback ID', key: 'id', className: 'font-mono text-slate-400' },
    {
      label: 'User',
      key: 'user_name',
      render: (val, row) => (
        <div>
          <span className="font-bold text-white block">{val}</span>
          <span className="text-[11px] text-slate-400">{row.email}</span>
        </div>
      )
    },
    {
      label: 'Feedback Type',
      key: 'feedback_type',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Message Snippet',
      key: 'message',
      render: (val) => <span className="text-slate-300 truncate max-w-xs block">{val}</span>
    },
    {
      label: 'Rating',
      key: 'rating',
      render: (val) => (
        <div className="flex items-center gap-1 text-amber-400 font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400" /> {val}/5
        </div>
      )
    },
    { label: 'Date Submitted', key: 'date', className: 'font-mono text-slate-400' },
    {
      label: 'Resolution Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      label: 'Actions',
      key: 'actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setSelectedFeedback(row); setIsDetailOpen(true); }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="View Message"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleResolve(row)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.status === 'Resolved'
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
            title={row.status === 'Resolved' ? 'Reopen Feedback' : 'Mark Resolved'}
          >
            <CheckCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete Feedback"
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
            <MessageSquare className="w-6 h-6 text-farm-green" /> User Feedback & Issue Reports
          </h2>
          <p className="text-xs text-slate-400">Review farmer user ratings, feature suggestions, and reported issues</p>
        </div>
      </div>

      <DataTable
        title="User Feedback Inbox"
        subtitle={`Showing ${filteredFeedback.length} submissions`}
        columns={columns}
        data={filteredFeedback}
        isLoading={loading}
        searchPlaceholder="Search feedback message, user, email..."
        filterComponent={
          <FilterBar
            filters={[
              { key: 'type', label: 'Type', options: ['Model Accuracy', 'UI Suggestion', 'Bug Report', 'General'] },
              { key: 'status', label: 'Status', options: ['Pending', 'Resolved'] }
            ]}
            values={{ type: typeFilter, status: statusFilter }}
            onChange={(key, val) => {
              if (key === 'type') setTypeFilter(val);
              if (key === 'status') setStatusFilter(val);
            }}
            onReset={() => { setTypeFilter(''); setStatusFilter(''); }}
          />
        }
      />

      {/* Feedback Detail View Modal */}
      {selectedFeedback && (
        <DetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Feedback Submission — ${selectedFeedback.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-farm-dark border border-slate-800">
              <div>
                <span className="text-slate-400 block font-semibold">Submitted By</span>
                <span className="text-sm font-bold text-white">{selectedFeedback.user_name}</span>
                <span className="text-slate-400 block text-[11px]">{selectedFeedback.email}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-semibold mb-1">Rating Given</span>
                <div className="flex items-center justify-end gap-1 text-amber-400 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" /> {selectedFeedback.rating} / 5
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-farm-dark border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">Feedback Message</span>
                <StatusBadge status={selectedFeedback.feedback_type} />
              </div>
              <p className="text-slate-200 text-sm leading-relaxed pt-1">"{selectedFeedback.message}"</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400 font-mono">Date: {selectedFeedback.date}</span>
              <button
                onClick={() => { handleResolve(selectedFeedback); setIsDetailOpen(false); }}
                className="px-4 py-2 bg-farm-green text-black font-bold rounded-xl text-xs shadow-lg"
              >
                {selectedFeedback.status === 'Resolved' ? 'Reopen Issue' : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </DetailModal>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, feedback: null })}
        onConfirm={confirmDialog.action || (() => {})}
        title="Delete Feedback Record"
        message="Are you sure you want to delete this feedback submission?"
        danger={true}
      />
    </div>
  );
};

export default FeedbackManagement;
