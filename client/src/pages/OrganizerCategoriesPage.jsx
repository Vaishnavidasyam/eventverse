import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, Calendar, Search, X, Check, AlertCircle } from 'lucide-react';
import { categoriesAPI } from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const OrganizerCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [systemCategories, setSystemCategories] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    label: '',
    icon: '📅',
    color: 'from-purple-500 to-indigo-500',
    description: ''
  });

  const colorOptions = [
    { value: 'from-purple-500 to-indigo-500', label: 'Purple', class: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
    { value: 'from-pink-500 to-rose-500', label: 'Pink', class: 'bg-gradient-to-r from-pink-500 to-rose-500' },
    { value: 'from-blue-500 to-cyan-500', label: 'Blue', class: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { value: 'from-green-500 to-emerald-500', label: 'Green', class: 'bg-gradient-to-r from-green-500 to-emerald-500' },
    { value: 'from-yellow-500 to-orange-500', label: 'Orange', class: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
    { value: 'from-red-500 to-pink-500', label: 'Red', class: 'bg-gradient-to-r from-red-500 to-pink-500' },
    { value: 'from-slate-500 to-gray-500', label: 'Gray', class: 'bg-gradient-to-r from-slate-500 to-gray-500' },
  ];

  const iconOptions = ['📅', '🎉', '🎭', '🎪', '🎨', '🎵', '🎤', '🎬', '📚', '💼', '⚽', '🏆', '🎯', '✨', '🌟'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const [allCategoriesRes, organizerCategoriesRes] = await Promise.all([
        categoriesAPI.getAll(),
        categoriesAPI.getOrganizerCategories()
      ]);

      const allCats = allCategoriesRes.data.categories || [];
      const customCats = organizerCategoriesRes.data.categories || [];

      setSystemCategories(allCats.filter(cat => cat.isSystem));
      setCustomCategories(customCats);
      setCategories(allCats);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        label: category.label,
        icon: category.icon || '📅',
        color: category.color || 'from-purple-500 to-indigo-500',
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        label: '',
        icon: '📅',
        color: 'from-purple-500 to-indigo-500',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      label: '',
      icon: '📅',
      color: 'from-purple-500 to-indigo-500',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.label.trim()) {
      toast.error('Name and label are required');
      return;
    }

    try {
      setSaving(true);
      
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoriesAPI.create(formData);
        toast.success('Category created successfully');
      }
      
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await categoriesAPI.delete(categoryId);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredSystemCategories = systemCategories.filter(category =>
    category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomCategories = customCategories.filter(category =>
    category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Event Categories</h1>
          <p className="text-text-muted">Manage custom event categories for your events</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          Create Category
        </Button>
      </motion.div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full rounded-lg bg-bg-card border border-card-border focus:border-primary focus:outline-none text-sm text-text-primary"
        />
      </div>

      {/* System Categories */}
      {!searchQuery && filteredSystemCategories.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-text-primary">System Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredSystemCategories.map((category) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 border-card-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      System
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-text-primary">{category.label}</h3>
                  <p className="text-sm text-text-muted mb-3 capitalize">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">{category.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Calendar className="h-4 w-4" />
                    <span>{category.eventCount || 0} events</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">My Custom Categories</h2>
          <Button onClick={() => handleOpenModal()} icon={Plus} size="sm">
            Create Category
          </Button>
        </div>
        
        {filteredCustomCategories.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted mb-4">
              {searchQuery ? 'No custom categories found matching your search.' : 'No custom categories yet. Create your first category!'}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenModal()} icon={Plus}>
                Create Category
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomCategories.map((category) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleOpenModal(category)}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteCategory(category._id)}
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-text-primary">{category.label}</h3>
                  <p className="text-sm text-text-muted mb-3 capitalize">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">{category.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Calendar className="h-4 w-4" />
                    <span>{category.eventCount || 0} events</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-secondary rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <Button
                variant="secondary"
                size="sm"
                icon={X}
                onClick={handleCloseModal}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., networking"
                  required
                />
                <p className="text-xs text-text-muted mt-1">Internal identifier (lowercase, no spaces)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">Label *</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Networking Events"
                  required
                />
                <p className="text-xs text-text-muted mt-1">Display name for users</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        formData.icon === icon
                          ? 'bg-primary text-white'
                          : 'bg-bg-card hover:bg-bg-card/80'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        formData.color === color.value
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-secondary'
                          : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${color.class}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-[80px]"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrganizerCategoriesPage;
