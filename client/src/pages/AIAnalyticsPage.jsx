import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Users, DollarSign, Calendar, Target, Lightbulb, ArrowUpRight, ArrowDownRight, Download, RefreshCw, BarChart3, Activity } from 'lucide-react';
import { aiAPI, eventsAPI, bookingsAPI } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const AIAnalyticsPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [timeRange]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getAnalytics({ timeRange });
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      toast.error('Failed to load AI analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  // Mock data for charts (in production, this would come from the API)
  const performanceData = [
    { month: 'Jan', revenue: 4500, attendees: 120, satisfaction: 85 },
    { month: 'Feb', revenue: 7200, attendees: 180, satisfaction: 88 },
    { month: 'Mar', revenue: 5800, attendees: 150, satisfaction: 82 },
    { month: 'Apr', revenue: 8900, attendees: 220, satisfaction: 90 },
    { month: 'May', revenue: 6700, attendees: 170, satisfaction: 86 },
    { month: 'Jun', revenue: 9500, attendees: 250, satisfaction: 92 },
  ];

  const categoryPerformance = [
    { category: 'Conferences', revenue: 25000, growth: 15, satisfaction: 88 },
    { category: 'Parties', revenue: 18000, growth: 22, satisfaction: 85 },
    { category: 'Workshops', revenue: 12000, growth: 8, satisfaction: 90 },
    { category: 'Sports', revenue: 15000, growth: 18, satisfaction: 87 },
    { category: 'Concerts', revenue: 22000, growth: 25, satisfaction: 92 },
  ];

  const audienceData = [
    { subject: 'Age 18-24', A: 120, B: 110, fullMark: 150 },
    { subject: 'Age 25-34', A: 98, B: 130, fullMark: 150 },
    { subject: 'Age 35-44', A: 86, B: 70, fullMark: 150 },
    { subject: 'Age 45-54', A: 65, B: 60, fullMark: 150 },
    { subject: 'Age 55+', A: 40, B: 45, fullMark: 150 },
  ];

  const recommendations = [
    {
      type: 'opportunity',
      icon: TrendingUp,
      title: 'Increase Weekend Events',
      description: 'Weekend events show 35% higher attendance. Consider scheduling more events on Saturdays and Sundays.',
      impact: 'High',
      effort: 'Medium'
    },
    {
      type: 'optimization',
      icon: DollarSign,
      title: 'Optimize Ticket Pricing',
      description: 'Dynamic pricing could increase revenue by 12-18% based on demand patterns.',
      impact: 'High',
      effort: 'Low'
    },
    {
      type: 'engagement',
      icon: Users,
      title: 'Boost Early Bird Sales',
      description: 'Early bird promotions drive 40% more conversions. Launch campaigns 2 weeks before events.',
      impact: 'Medium',
      effort: 'Low'
    },
    {
      type: 'trend',
      icon: Calendar,
      title: 'Seasonal Patterns Detected',
      description: 'Q4 shows highest demand. Plan major events in October-December for maximum impact.',
      impact: 'High',
      effort: 'Medium'
    },
  ];

  const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#34d399', '#fbbf24', '#f87171'];

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
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold mb-1">AI Analytics</h1>
              <p className="text-slate-400">AI-powered insights and recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              icon={RefreshCw}
              loading={refreshing}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
            >
              Export
            </Button>
          </div>
        </motion.div>

        {/* AI Insights Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-400 text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+24%</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">94%</p>
            <p className="text-slate-400 text-sm">AI Confidence Score</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-400 text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+18%</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">₹42.5K</p>
            <p className="text-slate-400 text-sm">Predicted Revenue</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-400 text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+12%</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">1,250</p>
            <p className="text-slate-400 text-sm">Expected Attendees</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-400 text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+8%</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">89%</p>
            <p className="text-slate-400 text-sm">Conversion Rate</p>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-bold">AI Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      rec.type === 'opportunity' ? 'bg-green-500/10' :
                      rec.type === 'optimization' ? 'bg-blue-500/10' :
                      rec.type === 'engagement' ? 'bg-purple-500/10' : 'bg-orange-500/10'
                    }`}>
                      <rec.icon className={`h-5 w-5 ${
                        rec.type === 'opportunity' ? 'text-green-400' :
                        rec.type === 'optimization' ? 'text-blue-400' :
                        rec.type === 'engagement' ? 'text-purple-400' : 'text-orange-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{rec.title}</h3>
                      <p className="text-sm text-slate-400">{rec.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      rec.impact === 'High' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      Impact: {rec.impact}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${
                      rec.effort === 'Low' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      Effort: {rec.effort}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Performance Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#818cf8" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Category Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="category" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="revenue" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Audience Demographics</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={audienceData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                  <PolarRadiusAxis stroke="#9ca3af" />
                  <Radar name="This Period" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.6} />
                  <Radar name="Last Period" dataKey="B" stroke="#c084fc" fill="#c084fc" fillOpacity={0.6} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Key Metrics Comparison</h2>
              <div className="space-y-4">
                {[
                  { label: 'Revenue Growth', current: 24, previous: 18, color: 'green' },
                  { label: 'Attendance Rate', current: 85, previous: 78, color: 'blue' },
                  { label: 'Customer Satisfaction', current: 92, previous: 88, color: 'purple' },
                  { label: 'Conversion Rate', current: 12, previous: 9, color: 'orange' },
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{metric.label}</span>
                      <span className="font-semibold">{metric.current}% vs {metric.previous}%</span>
                    </div>
                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.current}%` }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className={`absolute h-full rounded-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Predictive Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-bold">Predictive Analytics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Next Month Revenue</p>
                <p className="text-2xl font-bold text-green-400">₹48,200</p>
                <p className="text-xs text-slate-400 mt-1">+13% predicted</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Peak Event Day</p>
                <p className="text-2xl font-bold text-blue-400">Saturday</p>
                <p className="text-xs text-slate-400 mt-1">Based on historical data</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Optimal Price Range</p>
                <p className="text-2xl font-bold text-purple-400">₹25-₹45</p>
                <p className="text-xs text-slate-400 mt-1">For maximum conversion</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AIAnalyticsPage;
