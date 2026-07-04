import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, MapPin, Users, DollarSign, Clock, Send, Loader2, Download, RefreshCw, Lightbulb, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { aiAPI, categoriesAPI } from '../lib/api';
import { EVENT_CATEGORIES } from '../config/constants';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const AIPlannerPage = () => {
  const [categories, setCategories] = useState(EVENT_CATEGORIES);
  const [formData, setFormData] = useState({
    eventType: '',
    budget: '',
    city: '',
    guestCount: '',
    preferredDate: '',
    preferences: '',
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const apiCategories = response.data.categories || [];
      
      if (apiCategories.length > 0) {
        const transformedCategories = apiCategories.map(cat => ({
          name: cat.name,
          icon: cat.icon || '📅',
          label: cat.label,
          color: cat.color || 'from-purple-500 to-indigo-500'
        }));
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(EVENT_CATEGORIES);
    }
  };

  const promptSuggestions = [
    {
      id: 1,
      title: 'Corporate Conference',
      description: 'Professional conference with networking sessions',
      template: { eventType: 'Conference', budget: '10000', city: 'Mumbai', guestCount: '200', preferences: 'Need AV equipment, catering, and breakout rooms' }
    },
    {
      id: 2,
      title: 'Wedding Reception',
      description: 'Elegant wedding with dinner and dancing',
      template: { eventType: 'Wedding', budget: '25000', city: 'Delhi', guestCount: '150', preferences: 'Outdoor venue, live band, premium catering' }
    },
    {
      id: 3,
      title: 'Birthday Party',
      description: 'Fun birthday celebration for adults',
      template: { eventType: 'Party', budget: '5000', city: 'Bangalore', guestCount: '50', preferences: 'DJ, photo booth, open bar' }
    },
    {
      id: 4,
      title: 'Music Festival',
      description: 'Outdoor music event with multiple stages',
      template: { eventType: 'Concert', budget: '50000', city: 'Hyderabad', guestCount: '1000', preferences: 'Multiple stages, food vendors, camping area' }
    },
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const applyPrompt = (template) => {
    setFormData(template);
    setSelectedPrompt(template);
    toast.success('Template applied!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await aiAPI.planEvent({
        eventType: formData.eventType,
        budget: Number(formData.budget),
        city: formData.city,
        guestCount: Number(formData.guestCount),
        preferredDate: formData.preferredDate,
        preferences: formData.preferences,
      });
      setPlan(response.data.plan);
      setExpandedSections({
        cost: true,
        venues: true,
        vendors: true,
        timeline: true
      });
      toast.success('AI plan generated successfully!');
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPlan = () => {
    const planText = JSON.stringify(plan, null, 2);
    navigator.clipboard.writeText(planText);
    setCopied(true);
    toast.success('Plan copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPlan = () => {
    const planText = JSON.stringify(plan, null, 2);
    const blob = new Blob([planText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-plan-${Date.now()}.json`;
    link.click();
    toast.success('Plan downloaded!');
  };

  const handleReset = () => {
    setPlan(null);
    setFormData({
      eventType: '',
      budget: '',
      city: '',
      guestCount: '',
      preferredDate: '',
      preferences: '',
    });
    setSelectedPrompt(null);
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Event Planner</h1>
          </div>
          <p className="text-slate-400 text-lg">Let AI create the perfect event plan for you</p>
        </motion.div>

        {/* Prompt Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold">Quick Start Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {promptSuggestions.map((prompt) => (
              <Card
                key={prompt.id}
                hover
                className="p-4 cursor-pointer border-2 border-transparent hover:border-purple-500/50"
                onClick={() => applyPrompt(prompt.template)}
              >
                <h4 className="font-semibold mb-1">{prompt.title}</h4>
                <p className="text-sm text-slate-400">{prompt.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Tell us about your event</h2>
                {selectedPrompt && (
                  <Button
                    variant="ghost-dark"
                    size="sm"
                    onClick={handleReset}
                    icon={RefreshCw}
                  >
                    Reset
                  </Button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Event Type</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select event type</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Budget</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="5000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Guest Count</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Additional Preferences (Optional)</label>
                  <textarea
                    value={formData.preferences}
                    onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-purple-500 focus:outline-none transition-colors min-h-[100px]"
                    placeholder="Any specific requirements or preferences..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  icon={Sparkles}
                  className="w-full py-4"
                >
                  Generate AI Plan
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* AI Plan Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {plan ? (
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyPlan}
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied!' : 'Copy Plan'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadPlan}
                    icon={Download}
                  >
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReset}
                    icon={RefreshCw}
                  >
                    New Plan
                  </Button>
                </div>

                {/* Cost Breakdown */}
                <Card className="p-6">
                  <button
                    onClick={() => toggleSection('cost')}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <h3 className="text-xl font-bold flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                      Cost Breakdown
                    </h3>
                    {expandedSections.cost ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  <AnimatePresence>
                    {expandedSections.cost && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="space-y-3">
                          {plan.costBreakdown && Object.entries(plan.costBreakdown).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-slate-700">
                              <span className="text-slate-400 capitalize">{key}</span>
                              <span className="font-semibold">{formatCurrency(value)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-slate-600 mt-4 pt-4 flex justify-between items-center">
                          <span className="font-bold">Total Estimated</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            {formatCurrency(plan.totalEstimatedBudget || 0)}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Venue Suggestions */}
                {plan.venues && (
                  <Card className="p-6">
                    <button
                      onClick={() => toggleSection('venues')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="text-xl font-bold flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                        Venue Suggestions
                      </h3>
                      {expandedSections.venues ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    <AnimatePresence>
                      {expandedSections.venues && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="space-y-4">
                            {plan.venues.map((venue, index) => (
                              <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <h4 className="font-semibold">{venue.name}</h4>
                                <p className="text-sm text-slate-400">{venue.type}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-sm text-slate-400">Capacity: {venue.capacity}</span>
                                  <span className="font-semibold text-purple-400">{formatCurrency(venue.estimatedCost)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )}

                {/* Vendor Recommendations */}
                {plan.vendors && (
                  <Card className="p-6">
                    <button
                      onClick={() => toggleSection('vendors')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="text-xl font-bold flex items-center">
                        <Users className="h-5 w-5 mr-2 text-purple-400" />
                        Vendor Recommendations
                      </h3>
                      {expandedSections.vendors ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    <AnimatePresence>
                      {expandedSections.vendors && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="space-y-4">
                            {plan.vendors.map((vendor, index) => (
                              <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <h4 className="font-semibold">{vendor.name}</h4>
                                <p className="text-sm text-slate-400 capitalize">{vendor.category}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-sm text-slate-400">{vendor.description}</span>
                                  <span className="font-semibold text-purple-400">{formatCurrency(vendor.estimatedCost)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )}

                {/* Timeline */}
                {plan.timeline && (
                  <Card className="p-6">
                    <button
                      onClick={() => toggleSection('timeline')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="text-xl font-bold flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-orange-400" />
                        Event Timeline
                      </h3>
                      {expandedSections.timeline ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    <AnimatePresence>
                      {expandedSections.timeline && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="space-y-3">
                            {plan.timeline.map((item, index) => (
                              <div key={index} className="flex items-start space-x-3 py-2 border-b border-slate-700">
                                <div className="w-20 text-sm font-semibold text-purple-400">{item.time}</div>
                                <div className="flex-1 text-sm">{item.activity}</div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Your AI Plan</h3>
                <p className="text-slate-400">Fill in the form to generate a personalized event plan</p>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIPlannerPage;
