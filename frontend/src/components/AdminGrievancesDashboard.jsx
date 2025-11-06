import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, AlertCircle, User, Mail, Calendar, Filter, RefreshCw } from 'lucide-react';

const AdminGrievancesDashboard = ({ isOpen, onClose }) => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  // React Query for admin grievances
  const { data: grievances = [], isLoading: loading, error: errorObj, isFetching: isRefreshing, refetch } = useQuery({
    queryKey: ['adminGrievances'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/grievances/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch grievances');
      }
      return data.grievances;
    },
    enabled: isOpen,
    refetchInterval: isOpen ? 5000 : false, // Auto-refresh every 5 seconds only when open
    staleTime: 3000,
  });

  const error = errorObj ? errorObj.message : '';

  const handleUpdateStatus = async (grievanceId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/grievances/${grievanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.success) {
        refetch(); // Refresh the list
        setSelectedGrievance(null);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating status');
    }
  };

  const handleAddNotes = async (grievanceId, adminNotes) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/grievances/${grievanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminNotes })
      });

      const data = await response.json();

      if (data.success) {
        refetch();
        setSelectedGrievance(null);
      } else {
        alert(data.message || 'Failed to add notes');
      }
    } catch (error) {
      console.error('Error adding notes:', error);
      alert('An error occurred while adding notes');
    }
  };

  const filteredGrievances = grievances.filter(g => {
    const statusMatch = filterStatus === 'All' || g.status === filterStatus;
    const priorityMatch = filterPriority === 'All' || g.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-300';
      case 'Closed': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-300';
      case 'Medium': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🛡️ Admin Grievance Dashboard
              {isRefreshing && (
                <span className="text-xs font-normal bg-white/20 px-2 py-1 rounded-full animate-pulse">
                  Updating...
                </span>
              )}
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              {filteredGrievances.length} grievance(s) 
              {filterStatus !== 'All' && ` - ${filterStatus}`}
              {filterPriority !== 'All' && ` - ${filterPriority} Priority`}
              <span className="ml-2 text-purple-200 text-xs">• Auto-updates every 5s</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className={`text-white hover:bg-white/20 p-2 rounded-xl transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl mb-4">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-4">Loading grievances...</p>
            </div>
          ) : filteredGrievances.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No grievances found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGrievances.map(grievance => (
                <div
                  key={grievance._id}
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 ease-in-out bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-800 flex-1">
                          {grievance.subject}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getPriorityColor(grievance.priority)}`}>
                          {grievance.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(grievance.status)}`}>
                          {grievance.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{grievance.userName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          <span>{grievance.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(grievance.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">
                          {grievance.category}
                        </span>
                      </div>

                      <p className="text-gray-700 text-sm mb-3 bg-gray-50 p-3 rounded-lg">
                        {grievance.description}
                      </p>

                      {grievance.adminNotes && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-yellow-800 mb-1">Admin Notes:</p>
                          <p className="text-sm text-yellow-700">{grievance.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    {grievance.status === 'Open' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(grievance._id, 'In Progress')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all text-sm"
                        >
                          Start Working
                        </button>
                        <button
                          onClick={() => setSelectedGrievance(grievance)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-all text-sm"
                        >
                          Add Notes
                        </button>
                      </>
                    )}
                    {grievance.status === 'In Progress' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(grievance._id, 'Resolved')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-all text-sm"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => setSelectedGrievance(grievance)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-all text-sm"
                        >
                          Add Notes
                        </button>
                      </>
                    )}
                    {grievance.status === 'Resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(grievance._id, 'Closed')}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-all text-sm"
                      >
                        Close Grievance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Notes Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Admin Notes</h3>
            <textarea
              defaultValue={selectedGrievance.adminNotes}
              placeholder="Enter your notes here..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows="5"
              id="adminNotesInput"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedGrievance(null)}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const notes = document.getElementById('adminNotesInput').value;
                  handleAddNotes(selectedGrievance._id, notes);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-all"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGrievancesDashboard;
