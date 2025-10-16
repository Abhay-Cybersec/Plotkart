import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { propertyAPI } from '../services/api';
import { transferOwnership } from '../utils/mockFunctions';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferForm, setTransferForm] = useState({
    propertyId: '',
    buyerAadhaar: '',
    buyerName: ''
  });
  const [transferring, setTransferring] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch seller's properties on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAll({ ownerId: user.id });
      
      // Debug logging
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      
      // Try different response structures
      const propertiesData = 
        response.data.properties || 
        response.data.data?.properties || 
        response.data.data ||
        (Array.isArray(response.data) ? response.data : []);
      
      console.log('Extracted properties:', propertiesData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      console.error('Error response:', error.response);
      setMessage({ type: 'error', text: 'Failed to load properties' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferChange = (e) => {
    setTransferForm({
      ...transferForm,
      [e.target.name]: e.target.value
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferring(true);
    setMessage(null);

    try {
      const result = await transferOwnership(transferForm);
      
      if (result.success) {
        // Refresh properties list
        await fetchProperties();
        
        setMessage({ 
          type: 'success', 
          text: `Ownership transferred successfully! Transaction ID: ${result.transactionId}` 
        });
        
        setTransferForm({
          propertyId: '',
          buyerAadhaar: '',
          buyerName: ''
        });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Transfer failed' });
    } finally {
      setTransferring(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'listed':
        return 'bg-green-100 text-green-800';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate stats
  const totalProperties = properties.length;
  const verifiedProperties = properties.filter(p => p.status === 'listed').length;
  const transferredProperties = properties.filter(p => p.status === 'sold').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Seller Dashboard</h1>
        <p className="text-gray-600">Manage your properties and ownership transfers</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Properties</p>
              <p className="text-3xl font-bold text-gray-800">{totalProperties}</p>
            </div>
            <div className="w-12 h-12 bg-primary-cyan bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-cyan" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Verified</p>
              <p className="text-3xl font-bold text-green-600">{verifiedProperties}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Transferred</p>
              <p className="text-3xl font-bold text-primary-blue">{transferredProperties}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-blue" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Ownership */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Transfer Ownership</h2>
        
        <form onSubmit={handleTransfer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property ID
            </label>
            <select
              name="propertyId"
              value={transferForm.propertyId}
              onChange={handleTransferChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-cyan focus:border-transparent"
            >
              <option value="">Select Property</option>
              {properties.filter(p => p.status === 'listed').map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buyer Full Name
            </label>
            <input
              type="text"
              name="buyerName"
              value={transferForm.buyerName}
              onChange={handleTransferChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-cyan focus:border-transparent"
              placeholder="Buyer's full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buyer Aadhaar Number
            </label>
            <input
              type="text"
              name="buyerAadhaar"
              value={transferForm.buyerAadhaar}
              onChange={handleTransferChange}
              required
              maxLength="14"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-cyan focus:border-transparent"
              placeholder="1234-5678-9012"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={transferring}
              className="w-full py-3 bg-gradient-to-r from-primary-cyan to-primary-blue text-white rounded-lg font-semibold hover:shadow-lg transition-smooth disabled:opacity-50"
            >
              {transferring ? 'Processing Transfer...' : 'Transfer Ownership'}
            </button>
          </div>
        </form>
      </div>

      {/* My Properties */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Properties</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-cyan mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading properties...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {property.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {property.locationText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {property.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(property.status)}`}>
                        {property.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {property.propertyType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-600">No properties uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
