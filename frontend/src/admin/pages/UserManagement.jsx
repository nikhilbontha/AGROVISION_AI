import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Trash2, Eye, History, Shield, Search } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import DetailModal from '../components/DetailModal';
import FilterBar from '../components/FilterBar';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

const UserManagement = () => {
  const { addToast } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [userHistory, setUserHistory] = useState([]);

  // Confirm action dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    danger: false,
    action: null
  });

  const loadUsers = async () => {
    setLoading(true);
    const data = await adminApi.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setConfirmDialog({
      isOpen: true,
      title: `${newStatus === 'Active' ? 'Activate' : 'Deactivate'} User`,
      message: `Are you sure you want to change status of "${user.name}" to ${newStatus}?`,
      danger: newStatus === 'Inactive',
      action: async () => {
        await adminApi.toggle_user_status?.(user.id, { status: newStatus });
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        addToast(`User ${user.name} is now ${newStatus}`);
      }
    });
  };

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user "${user.name}"? This action cannot be undone.`,
      danger: true,
      action: async () => {
        await adminApi.delete_user?.(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        addToast(`User ${user.name} deleted successfully`, 'error');
      }
    });
  };

  const handleViewHistory = async (user) => {
    setSelectedUser(user);
    const detections = await adminApi.getDetections();
    const userDetections = detections.filter(d => d.user_id === user.id || d.user_name === user.name);
    setUserHistory(userDetections);
    setIsHistoryOpen(true);
  };

  // Filtered dataset
  const filteredUsers = users.filter(user => {
    if (statusFilter && user.status !== statusFilter) return false;
    if (roleFilter && user.role !== roleFilter) return false;
    return true;
  });

  const columns = [
    {
      label: 'Name',
      key: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
            {val.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-white block">{val}</span>
            <span className="text-[10px] text-slate-400">{row.role}</span>
          </div>
        </div>
      )
    },
    { label: 'Email', key: 'email', className: 'text-slate-300' },
    { label: 'Registered', key: 'registration_date', className: 'text-slate-400 font-mono' },
    {
      label: 'Total Predictions',
      key: 'total_predictions',
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
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setSelectedUser(row); setIsDetailOpen(true); }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleViewHistory(row)}
            className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors"
            title="Prediction History"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.status === 'Active'
                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
            title={row.status === 'Active' ? 'Deactivate User' : 'Activate User'}
          >
            {row.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleDeleteUser(row)}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Delete User"
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
            <Users className="w-6 h-6 text-farm-green" /> User Management
          </h2>
          <p className="text-xs text-slate-400">Manage, monitor, and regulate platform users and farmers</p>
        </div>
      </div>

      <DataTable
        title="Registered Users Directory"
        subtitle={`Showing ${filteredUsers.length} platform users`}
        columns={columns}
        data={filteredUsers}
        isLoading={loading}
        searchPlaceholder="Search by name, email, phone, ID..."
        filterComponent={
          <FilterBar
            filters={[
              { key: 'status', label: 'Status', options: ['Active', 'Inactive'] },
              { key: 'role', label: 'Role', options: ['Farmer', 'Agronomist', 'Researcher', 'Extension Officer'] }
            ]}
            values={{ status: statusFilter, role: roleFilter }}
            onChange={(key, val) => {
              if (key === 'status') setStatusFilter(val);
              if (key === 'role') setRoleFilter(val);
            }}
            onReset={() => { setStatusFilter(''); setRoleFilter(''); }}
          />
        }
      />

      {/* User Details Modal */}
      {selectedUser && (
        <DetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`User Details — ${selectedUser.name}`}
        >
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">User ID</span>
              <p className="font-mono font-bold text-white">{selectedUser.id}</p>
            </div>
            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Full Name</span>
              <p className="font-bold text-white">{selectedUser.name}</p>
            </div>
            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Email Address</span>
              <p className="text-emerald-400 font-medium">{selectedUser.email}</p>
            </div>
            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Phone Number</span>
              <p className="text-slate-200">{selectedUser.phone || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Location</span>
              <p className="text-slate-200">{selectedUser.location || 'India'}</p>
            </div>
            <div className="p-3 rounded-xl bg-farm-dark border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold">Registration Date</span>
              <p className="font-mono text-slate-300">{selectedUser.registration_date}</p>
            </div>
          </div>
        </DetailModal>
      )}

      {/* User Prediction History Modal */}
      {selectedUser && (
        <DetailModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          title={`Prediction History — ${selectedUser.name}`}
        >
          {userHistory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No disease detections recorded for this user yet.</p>
          ) : (
            <div className="space-y-2">
              {userHistory.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-farm-dark border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{item.crop}</span> — <span className="text-emerald-400">{item.disease}</span>
                    <p className="text-[11px] text-slate-400">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white">{item.confidence}%</span>
                    <div className="mt-0.5"><StatusBadge status={item.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailModal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action || (() => {})}
        title={confirmDialog.title}
        message={confirmDialog.message}
        danger={confirmDialog.danger}
      />
    </div>
  );
};

export default UserManagement;
