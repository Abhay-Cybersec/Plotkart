import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [recentProperties, setRecentProperties] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [stats, setStats] = useState({
    totalListed: 0,
    cmdaApproved: 0,
    avgPrice: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent properties (limit 3)
      const response = await propertyAPI.getAll({ status: 'listed', limit: 100 });
      const allProperties = response.data.data || [];
      
      // Get recent properties (latest 3)
      const recent = allProperties.slice(0, 3);
      setRecentProperties(recent);
      
      // Get CMDA approved properties as "recommended" (up to 3)
      const recommended = allProperties.filter(p => p.cmdaApproved).slice(0, 3);
      setRecommendedProperties(recommended);
      
      // Calculate stats
      const cmdaCount = allProperties.filter(p => p.cmdaApproved).length;
      const avgPrice = allProperties.length > 0 
        ? allProperties.reduce((sum, p) => sum + parseFloat(p.price), 0) / allProperties.length 
        : 0;
      
      setStats({
        totalListed: allProperties.length,
        cmdaApproved: cmdaCount,
        avgPrice: avgPrice
      });
      
      // Load saved properties from localStorage (mock)
      const saved = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      setSavedProperties(saved);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-cyan mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">Here's what's happening in the property market today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Available Properties</p>
            <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{stats.totalListed}</p>
          <p className="text-xs mt-2 opacity-75">Ready for purchase</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">CMDA Verified</p>
            <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{stats.cmdaApproved}</p>
          <p className="text-xs mt-2 opacity-75">Government approved</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Average Price</p>
            <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-4xl font-bold">₹{(stats.avgPrice / 100000).toFixed(1)}L</p>
          <p className="text-xs mt-2 opacity-75">Market average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Properties */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recently Listed</h2>
              <Link 
                to="/browse-properties" 
                className="text-primary-cyan hover:text-primary-blue font-semibold text-sm flex items-center"
              >
                View All
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {recentProperties.length > 0 ? (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/property/${property.id}`}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-cyan hover:shadow-md transition-all group"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-800 group-hover:text-primary-cyan transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{property.locationText}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500">{property.area}</span>
                        {property.cmdaApproved && (
                          <span className="ml-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            CMDA ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-blue">
                        {formatPrice(property.price)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize mt-1">{property.propertyType}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recent properties available</p>
            )}
          </div>

          {/* Recommended Properties */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Recommended for You 🌟
            </h2>

            {recommendedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedProperties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/property/${property.id}`}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 group-hover:text-primary-cyan transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{property.locationText}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-primary-blue">
                          ₹{(property.price / 100000).toFixed(2)}L
                        </span>
                        <span className="text-xs text-gray-500">{property.area}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recommendations yet</p>
            )}
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/browse-properties"
                className="flex items-center p-3 bg-gradient-to-r from-primary-cyan to-primary-blue text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Browse All Properties
              </Link>
              
              <Link
                to="/browse-properties"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-cyan hover:shadow-md transition-all"
              >
                <svg className="w-5 h-5 mr-3 text-primary-cyan" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">View Market Trends</span>
              </Link>
            </div>
          </div>

          {/* Saved Properties */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Saved Properties</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                {savedProperties.length}
              </span>
            </div>
            
            {savedProperties.length > 0 ? (
              <div className="space-y-2">
                {savedProperties.slice(0, 3).map((prop, idx) => (
                  <div key={idx} className="text-sm text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {prop}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No saved properties yet
              </p>
            )}
          </div>

          {/* Market Insights */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md p-6 border border-indigo-100">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <h3 className="font-bold text-gray-800">Market Insight</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              🔥 {stats.cmdaApproved} CMDA verified properties available now!
            </p>
            <p className="text-xs text-gray-600">
              Average price per property is around {formatPrice(stats.avgPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
