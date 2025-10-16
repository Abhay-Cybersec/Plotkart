import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI, transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PlotDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getById(id);
      setPlot(response.data.property);
    } catch (err) {
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProperty = async () => {
    setVerifying(true);
    setVerificationResult(null);
    
    // Simulate blockchain verification
    setTimeout(() => {
      setVerificationResult({
        success: true,
        message: 'Property verified on blockchain',
        hash: plot.id
      });
      setVerifying(false);
    }, 2000);
  };

  const handleProceed = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (userRole !== 'buyer') {
      alert('Only buyers can purchase properties. Please select buyer role.');
      return;
    }

    if (window.confirm(`Confirm purchase of "${plot.title}" for ${plot.price}?`)) {
      try {
        setPurchasing(true);
        await transactionAPI.checkout(plot.id);
        alert('Purchase successful! Property ownership transferred.');
        navigate('/buyer');
      } catch (err) {
        console.error('Purchase error:', err);
        alert(err.response?.data?.error || 'Purchase failed. Please ensure your KYC is verified.');
      } finally {
        setPurchasing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="text-center py-12">
          <svg className="animate-spin h-12 w-12 text-primary-cyan mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Property not found</h2>
        <button 
          onClick={() => navigate('/buyer')}
          className="mt-4 px-6 py-2 bg-primary-cyan text-white rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/buyer')}
        className="mb-6 flex items-center text-primary-blue hover:text-primary-cyan transition-smooth"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Properties
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {plot.images && plot.images.length > 0 ? (
              <img 
                src={plot.images[0]} 
                alt={plot.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                <svg className="w-32 h-32 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{plot.title}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {plot.locationText}
                </div>
              </div>
              {plot.cmdaApproved && (
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>CMDA Approved</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Area</p>
                <p className="text-lg font-semibold text-gray-800">{plot.area}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-lg font-semibold text-primary-blue">₹{(plot.price / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Property ID</p>
                <p className="text-lg font-semibold text-gray-800 truncate">{plot.id.slice(0, 8)}...</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-lg font-semibold text-green-600 capitalize">{plot.status}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{plot.description || 'No description available.'}</p>
            </div>

            {plot.documents && plot.documents.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {plot.documents.map((doc, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {doc.fileType || doc.fileName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Blockchain Hash</h3>
              <p className="font-mono text-sm text-gray-600 bg-gray-50 p-3 rounded-lg break-all">
                {plot.id}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Seller Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-800">{plot.owner?.name || 'Verified Seller'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-semibold text-gray-800">{plot.owner?.email || 'Contact via platform'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Listed Date</p>
                <p className="font-semibold text-gray-800">{new Date(plot.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Verify & Purchase</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleVerifyProperty}
                disabled={verifying}
                className="w-full py-3 bg-primary-cyan text-white rounded-lg font-semibold hover:bg-opacity-90 transition-smooth disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify Property ID'}
              </button>

              <button
                onClick={handleProceed}
                disabled={purchasing || plot.status !== 'listed'}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-smooth disabled:opacity-50"
              >
                {purchasing ? 'Processing...' : 'Proceed to Transaction'}
              </button>
            </div>

            {verificationResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                verificationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <p className="font-semibold text-sm">{verificationResult.message}</p>
                {verificationResult.hash && (
                  <p className="text-xs mt-2 font-mono break-all">{verificationResult.hash}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlotDetails;
