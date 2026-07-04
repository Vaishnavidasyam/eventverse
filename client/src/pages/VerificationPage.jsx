import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Clock, Search, Filter, User, Calendar, Store, AlertCircle, FileText, MapPin, Phone, Mail, Building } from 'lucide-react';
import { adminAPI } from '../lib/api';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const VerificationPage = () => {
  const location = useLocation();
  const getInitialTab = () => {
    if (location.pathname.includes('/events')) return 'events';
    if (location.pathname.includes('/vendors')) return 'vendors';
    return 'organizers';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'organizers') {
        const response = await adminAPI.getOrganizers();
        setOrganizers(response.data.organizers || []);
      } else if (activeTab === 'events') {
        const response = await adminAPI.getEvents();
        setEvents(response.data.events || []);
      } else if (activeTab === 'vendors') {
        const response = await adminAPI.getVendors();
        setVendors(response.data.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching verification data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === 'organizer') {
        await adminAPI.approveOrganizer(id);
      } else if (type === 'event') {
        await adminAPI.approveEvent(id);
      } else if (type === 'vendor') {
        await adminAPI.approveVendor(id);
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} approved successfully`);
      fetchData();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id, type) => {
    try {
      if (type === 'organizer') {
        await adminAPI.rejectOrganizer(id);
      } else if (type === 'event') {
        await adminAPI.rejectEvent(id);
      } else if (type === 'vendor') {
        await adminAPI.rejectVendor(id);
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} rejected`);
      fetchData();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('Failed to reject');
    }
  };

  const filteredData = () => {
    let data = activeTab === 'organizers' ? organizers : 
                activeTab === 'events' ? events : vendors;
    
    return data.filter(item => {
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'pending' && !item.isApproved && !item.isRejected) ||
        (filterStatus === 'approved' && item.isApproved) ||
        (filterStatus === 'rejected' && item.isRejected);
      
      return matchesSearch && matchesStatus;
    });
  };

  const tabs = [
    { id: 'organizers', label: 'Organizers', icon: User, count: organizers.filter(o => !o.isApproved).length },
    { id: 'events', label: 'Events', icon: Calendar, count: events.filter(e => !e.isApproved).length },
    { id: 'vendors', label: 'Vendors', icon: Store, count: vendors.filter(v => !v.isApproved).length },
  ];

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {selectedItem.name || selectedItem.title}
              </h3>
              <p className="text-slate-400">Verification Details</p>
            </div>
            <button
              onClick={() => setShowDetailModal(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {selectedItem.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="font-medium">{selectedItem.email}</p>
                </div>
              </div>
            )}

            {selectedItem.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="font-medium">{selectedItem.phone}</p>
                </div>
              </div>
            )}

            {selectedItem.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Address</p>
                  <p className="font-medium">{selectedItem.address}</p>
                </div>
              </div>
            )}

            {selectedItem.description && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Description</p>
                  <p className="font-medium">{selectedItem.description}</p>
                </div>
              </div>
            )}

            {selectedItem.documents && selectedItem.documents.length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Documents</p>
                <div className="space-y-2">
                  {selectedItem.documents.map((doc, index) => (
                    <div key={index} className="bg-slate-800 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm">{doc.name}</span>
                      <Button variant="secondary" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItem.createdAt && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Submitted On</p>
                  <p className="font-medium">{formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="success"
              className="flex-1"
              onClick={() => {
                handleApprove(selectedItem._id, activeTab.slice(0, -1));
                setShowDetailModal(false);
              }}
              icon={CheckCircle}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                handleReject(selectedItem._id, activeTab.slice(0, -1));
                setShowDetailModal(false);
              }}
              icon={XCircle}
            >
              Reject
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Verification System</h1>
          </div>
          <p className="text-slate-400">Review and approve organizers, events, and vendors</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mt-6 mb-8 border-b border-slate-700"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </Card>
        </motion.div>

        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold capitalize">{activeTab} ({filteredData().length})</h2>
            </div>

            {filteredData().length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-slate-400">No {activeTab} match your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData().map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {(item.name || item.title || 'Unknown').charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{item.name || item.title}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              item.isApproved
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : item.isRejected
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            }`}>
                              {item.isApproved ? 'Approved' : item.isRejected ? 'Rejected' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{item.email || item.description?.substring(0, 100)}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            {item.createdAt && (
                              <span>Submitted {formatDate(item.createdAt)}</span>
                            )}
                            {item.city && (
                              <span>• {item.city}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost-dark"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDetailModal(true);
                          }}
                        >
                          View Details
                        </Button>
                        {!item.isApproved && !item.isRejected && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(item._id, activeTab.slice(0, -1))}
                              icon={CheckCircle}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(item._id, activeTab.slice(0, -1))}
                              icon={XCircle}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {showDetailModal && renderDetailModal()}
      </div>
    </div>
  );
};

export default VerificationPage;
