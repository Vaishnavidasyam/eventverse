import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, TrendingUp, CheckCircle, XCircle, Shield, MoreVertical, ArrowUpRight, ArrowDownRight, Search, Filter, Ban, Check, AlertTriangle, Activity } from 'lucide-react';
import { adminAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const location = useLocation();
  const getInitialTab = () => {
    if (location.pathname.includes('/users')) return 'users';
    if (location.pathname.includes('/analytics')) return 'analytics';
    return 'overview';
  };

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await adminAPI.blockUser(userId);
      toast.success('User blocked successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await adminAPI.verifyUser(userId);
      toast.success('User verified successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Failed to verify user');
    }
  };

  const categoryData = stats?.categoryStats ? Object.entries(stats.categoryStats).map(([name, value]) => ({ name, value })) : [];
  const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa'];

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
	  user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-bg-main via-bg-secondary to-bg-main">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-text-muted">Platform overview and management</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mt-6 mb-8 border-b border-slate-700"
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Analytics
          </button>
        </motion.div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>+12%</span>
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{stats?.stats?.totalUsers || 0}</p>
                <p className="text-slate-400 text-sm">Total Users</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>+8%</span>
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{stats?.stats?.totalEvents || 0}</p>
                <p className="text-slate-400 text-sm">Total Events</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>+24%</span>
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{formatCurrency(stats?.stats?.totalRevenue || 0)}</p>
                <p className="text-slate-400 text-sm">Total Revenue</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>{stats?.stats?.growthRate || 0}%</span>
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{stats?.stats?.newUsers || 0}</p>
                <p className="text-slate-400 text-sm">New Users (30d)</p>
              </Card>
            </motion.div>

            {/* Pending Approvals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid lg:grid-cols-2 gap-6 mb-8"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Pending Events</h2>
                  <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm border border-yellow-500/20">
                    {stats?.stats?.pendingEvents || 0}
                  </span>
                </div>
                <p className="text-slate-400">Events awaiting approval</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Pending Vendors</h2>
                  <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm border border-yellow-500/20">
                    {stats?.stats?.pendingVendors || 0}
                  </span>
                </div>
                <p className="text-slate-400">Vendors awaiting verification</p>
              </Card>
            </motion.div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Event Categories Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Platform Statistics</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-2xl font-bold mb-1">{stats?.stats?.totalOrganizers || 0}</p>
                      <p className="text-slate-400 text-sm">Organizers</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-2xl font-bold mb-1">{stats?.stats?.totalBookings || 0}</p>
                      <p className="text-slate-400 text-sm">Total Bookings</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-2xl font-bold mb-1">{stats?.stats?.totalVendors || 0}</p>
                      <p className="text-slate-400 text-sm">Vendors</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <p className="text-2xl font-bold mb-1">{stats?.stats?.newUsers || 0}</p>
                      <p className="text-slate-400 text-sm">New Users (30d)</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name || 'Unknown'}</h3>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' :
                              user.role === 'organizer' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-slate-500/10 text-slate-400'
                            }`}>
                              {user.role}
                            </span>
                            {user.isVerified && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                                Verified
                              </span>
                            )}
                            {user.isBlocked && (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400">
                                Blocked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!user.isVerified && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleVerifyUser(user._id)}
                            icon={Check}
                          >
                            Verify
                          </Button>
                        )}
                        <Button
                          variant={user.isBlocked ? 'success' : 'danger'}
                          size="sm"
                          onClick={() => handleBlockUser(user._id)}
                          icon={user.isBlocked ? Check : Ban}
                        >
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Platform Analytics</h2>
              <p className="text-slate-400">Detailed analytics and reports coming soon...</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
