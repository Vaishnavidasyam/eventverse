import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, X, Calendar, MapPin, Users, DollarSign, Image, Check, AlertCircle } from 'lucide-react';
import { eventsAPI, categoriesAPI } from '../lib/api';
import { EVENT_CATEGORIES } from '../config/constants';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const CreateEventWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(EVENT_CATEGORIES);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    category: '',
    description: '',
    // Step 2: Date & Location
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    venue: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      capacity: '',
    },
    // Step 3: Tickets
    ticketTypes: [
      { name: 'General', price: 0, available: 100, description: 'Standard entry' }
    ],
    totalSeats: 100,
    // Step 4: Additional Details
    imageUrl: '',
    tags: [],
    isVirtual: false,
    meetingLink: '',
    requirements: '',
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: Calendar },
    { id: 2, title: 'Date & Location', icon: MapPin },
    { id: 3, title: 'Tickets', icon: DollarSign },
    { id: 4, title: 'Additional Details', icon: Image },
  ];

  // Autosave functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.category) {
        saveDraft();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft from localStorage on mount or load event for editing
  useEffect(() => {
    fetchCategories();
    
    const searchParams = new URLSearchParams(window.location.search);
    const editId = searchParams.get('edit');
    
    if (editId) {
      setIsEditing(true);
      setEditEventId(editId);
      loadEventForEdit(editId);
    } else {
      const savedDraft = localStorage.getItem('eventDraft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setFormData(draft);
          setLastSaved(new Date(draft.lastSaved));
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const apiCategories = response.data.categories || [];
      
      if (apiCategories.length > 0) {
        // Transform API categories to match the format expected by the form
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
      // Fall back to constants if API fails
      setCategories(EVENT_CATEGORIES);
    }
  };

  const loadEventForEdit = async (eventId) => {
    try {
      setLoading(true);
      const response = await eventsAPI.getById(eventId);
      const event = response.data.event;
      
      // Format date for input
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        title: event.title || '',
        category: event.category || '',
        description: event.description || '',
        date: formatDateForInput(event.date),
        time: event.time || '',
        endDate: formatDateForInput(event.endDate),
        endTime: event.endTime || '',
        venue: {
          name: event.venue?.name || '',
          address: event.venue?.address || '',
          city: event.venue?.city || '',
          state: event.venue?.state || '',
          country: event.venue?.country || '',
          capacity: event.venue?.capacity || '',
        },
        ticketTypes: event.ticketTypes || [
          { name: 'General', price: 0, available: 100, description: 'Standard entry' }
        ],
        totalSeats: event.totalSeats || 100,
        imageUrl: event.imageUrl || '',
        tags: event.tags || [],
        isVirtual: event.isVirtual || false,
        meetingLink: event.meetingLink || '',
        requirements: event.requirements || '',
      });
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event for editing');
      navigate('/organizer/events');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      const draftToSave = { ...formData, lastSaved: new Date().toISOString() };
      localStorage.setItem('eventDraft', JSON.stringify(draftToSave));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('eventDraft');
    setLastSaved(null);
    toast.success('Draft cleared');
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      saveDraft();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      // Log the form data for debugging
      console.log('Submitting event data:', JSON.stringify(formData, null, 2));
      
      if (isEditing && editEventId) {
        const response = await eventsAPI.update(editEventId, formData);
        toast.success('Event updated successfully!');
      } else {
        const response = await eventsAPI.create(formData);
        toast.success('Event created successfully!');
      }
      
      clearDraft();
      navigate('/organizer/events');
    } catch (error) {
      console.error('Error saving event:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [
        ...formData.ticketTypes,
        { name: '', price: 0, available: 50, description: '' }
      ]
    });
  };

  const updateTicketType = (index, field, value) => {
    const updatedTickets = [...formData.ticketTypes];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    setFormData({ ...formData, ticketTypes: updatedTickets });
  };

  const removeTicketType = (index) => {
    if (formData.ticketTypes.length > 1) {
      const updatedTickets = formData.ticketTypes.filter((_, i) => i !== index);
      setFormData({ ...formData, ticketTypes: updatedTickets });
    }
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{isEditing ? 'Edit Event' : 'Create Event'}</h1>
            <p className="text-text-muted">{isEditing ? 'Update your event details' : 'Fill in the details to create your event'}</p>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-sm text-text-muted">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={saveDraft}
              icon={Save}
              loading={saving}
            >
              Save Draft
            </Button>
            {lastSaved && (
              <Button
                variant="secondary"
                size="sm"
                onClick={clearDraft}
                icon={X}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'bg-bg-card border border-card-border text-text-muted'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <span className="text-xs mt-2 text-text-muted hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full ${
                      currentStep > step.id ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-card-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Basic Information</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">Event Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field"
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="select-field"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field min-h-[150px]"
                      placeholder="Describe your event..."
                      required
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Date & Location</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">Start Date *</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">Start Time *</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">End Time</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="border-t border-card-border pt-6">
                    <h4 className="font-semibold mb-4">Venue Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-text-secondary">Venue Name *</label>
                        <input
                          type="text"
                          value={formData.venue.name}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            venue: { ...formData.venue, name: e.target.value } 
                          })}
                          className="input-field"
                          placeholder="Venue name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-text-secondary">Address *</label>
                        <input
                          type="text"
                          value={formData.venue.address}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            venue: { ...formData.venue, address: e.target.value } 
                          })}
                          className="input-field"
                          placeholder="Street address"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-text-secondary">City *</label>
                          <input
                            type="text"
                            value={formData.venue.city}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              venue: { ...formData.venue, city: e.target.value } 
                            })}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-text-secondary">State</label>
                          <input
                            type="text"
                            value={formData.venue.state}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              venue: { ...formData.venue, state: e.target.value } 
                            })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-text-secondary">Country *</label>
                          <input
                            type="text"
                            value={formData.venue.country}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              venue: { ...formData.venue, country: e.target.value } 
                            })}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-text-secondary">Venue Capacity *</label>
                        <input
                          type="number"
                          value={formData.venue.capacity}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            venue: { ...formData.venue, capacity: e.target.value ? parseInt(e.target.value) : '' } 
                          })}
                          className="input-field"
                          placeholder="100"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Ticket Configuration</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">Total Seats *</label>
                    <input
                      type="number"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value ? parseInt(e.target.value) : 0 })}
                      className="input-field"
                      placeholder="100"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Ticket Types</h4>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={addTicketType}
                        icon={Users}
                      >
                        Add Ticket Type
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.ticketTypes.map((ticket, index) => (
                        <div key={index} className="glass-card-light p-4 border border-card-border">
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-medium">Ticket {index + 1}</span>
                            {formData.ticketTypes.length > 1 && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeTicketType(index)}
                                icon={X}
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-text-secondary">Name *</label>
                              <input
                                type="text"
                                value={ticket.name}
                                onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                                className="input-field"
                                placeholder="General Admission"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-text-secondary">Price *</label>
                              <input
                                type="number"
                                value={ticket.price}
                                onChange={(e) => updateTicketType(index, 'price', e.target.value ? parseFloat(e.target.value) : 0)}
                                className="input-field"
                                placeholder="0"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-text-secondary">Available *</label>
                              <input
                                type="number"
                                value={ticket.available}
                                onChange={(e) => updateTicketType(index, 'available', e.target.value ? parseInt(e.target.value) : 0)}
                                className="input-field"
                                placeholder="50"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-text-secondary">Description</label>
                              <input
                                type="text"
                                value={ticket.description}
                                onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                                className="input-field"
                                placeholder="Standard entry ticket"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6">Additional Details</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">Event Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-2"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-purple-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a tag and press Enter"
                        className="input-field"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isVirtual"
                      checked={formData.isVirtual}
                      onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                      className="w-5 h-5 rounded bg-bg-card border-card-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="isVirtual" className="text-sm font-medium text-text-secondary">
                      This is a virtual event
                    </label>
                  </div>

                  {formData.isVirtual && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-text-secondary">Meeting Link *</label>
                      <input
                        type="url"
                        value={formData.meetingLink}
                        onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                        className="input-field"
                        placeholder="https://zoom.us/..."
                        required={formData.isVirtual}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-secondary">Special Requirements</label>
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className="input-field min-h-[100px]"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>

                  {/* Summary */}
                  <div className="glass-card-light p-6 border border-card-border">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      Event Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Title</span>
                        <span className="font-medium text-text-primary">{formData.title || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Category</span>
                        <span className="font-medium text-text-primary">{formData.category || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Date</span>
                        <span className="font-medium text-text-primary">{formData.date || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Venue</span>
                        <span className="font-medium text-text-primary">{formData.venue.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Ticket Types</span>
                        <span className="font-medium text-text-primary">{formData.ticketTypes.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
            icon={ChevronLeft}
            iconPosition="left"
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={currentStep === 4 ? handleSubmit : handleNext}
            loading={saving}
            icon={currentStep === 4 ? Check : ChevronRight}
            iconPosition="right"
          >
            {currentStep === 4 ? (isEditing ? 'Update Event' : 'Create Event') : 'Continue'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateEventWizard;
