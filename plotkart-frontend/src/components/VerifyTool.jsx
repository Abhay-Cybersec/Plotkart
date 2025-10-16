import { useState } from 'react'
import { verifyPropertyHash } from '../utils/mockFunctions'

const VerifyTool = () => {
  const [propertyId, setPropertyId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState(null)

  const handleVerify = async () => {
    if (!propertyId.trim()) {
      alert('Please enter a Property ID')
      return
    }

    setVerifying(true)
    setResult(null)

    try {
      const verificationResult = await verifyPropertyHash(propertyId)
      setResult(verificationResult)
    } catch (error) {
      setResult({
        success: false,
        message: 'Verification failed - network error'
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-primary-cyan to-primary-blue rounded-xl shadow-lg p-6 text-white mb-6">
      <h3 className="text-xl font-semibold mb-4">Quick Property Verification</h3>
      
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          placeholder="Enter Property ID (e.g., PROP001)"
          className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-white focus:outline-none"
        />
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="px-6 py-3 bg-white text-primary-blue rounded-lg font-semibold hover:bg-gray-100 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="flex items-start space-x-2">
            {result.success ? (
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <div className="flex-1">
              <p className="font-semibold">{result.message}</p>
              {result.hash && (
                <p className="text-sm mt-1 font-mono break-all opacity-90">
                  Hash: {result.hash}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerifyTool
