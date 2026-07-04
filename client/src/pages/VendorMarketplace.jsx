import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Phone, Mail, Filter } from 'lucide-react';
import { vendorsAPI } from '../lib/api';
import { VENDOR_CATEGORIES } from '../config/constants';
import { formatCurrency } from '../lib/utils';

const VendorMarketplace = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    search: '',
  });

  useEffect(() => {
    fetchVendors();
  }, [filters]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorsAPI.getAll(filters);
      setVendors(response.data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Vendor Marketplace</h1>
          <p className="text-gray-400">Find the perfect vendors for your event</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="select-field"
              >
                <option value="">All Categories</option>
                {VENDOR_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        {/* Vendor Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {VENDOR_CATEGORIES.map((category) => (
            <button
              key={category.name}
              onClick={() => setFilters({ ...filters, category: filters.category === category.name ? '' : category.name })}
              className={`px-4 py-2 rounded-full transition-all ${
                filters.category === category.name
                  ? 'bg-purple-600 text-white'
                  : 'glass-card-light hover:bg-white/10'
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </motion.div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No vendors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor, index) => (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="glass-card overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="h-32 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <span className="text-5xl">{VENDOR_CATEGORIES.find(c => c.name === vendor.category)?.icon || '📦'}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{vendor.name}</h3>
                        <p className="text-sm text-purple-400 capitalize">{vendor.category}</p>
                      </div>
                      <div className="flex items-center space-x-1 glass-card-light px-2 py-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold">{vendor.rating || 4.5}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{vendor.description}</p>

                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{vendor.location?.city}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-400 font-semibold">
                          {formatCurrency(vendor.priceRange?.min)} - {formatCurrency(vendor.priceRange?.max)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button className="flex-1 btn-primary py-2 text-sm">Book Now</button>
                      <button className="flex-1 btn-secondary py-2 text-sm">View Profile</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMarketplace;
