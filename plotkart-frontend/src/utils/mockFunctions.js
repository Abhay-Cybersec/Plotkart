// Mock blockchain verification
export const verifyPropertyHash = (propertyId) => {
  // Simulate async blockchain verification
  return new Promise((resolve) => {
    setTimeout(() => {
      // Random verification result for demo
      const isValid = Math.random() > 0.2 // 80% success rate
      resolve({
        success: isValid,
        hash: isValid ? `0x${Math.random().toString(16).substring(2, 66)}` : null,
        timestamp: new Date().toISOString(),
        message: isValid 
          ? 'Property verified on blockchain' 
          : 'Verification failed - hash mismatch'
      })
    }, 1500)
  })
}

// Mock KYC verification
export const verifyKYC = (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isValid = userData.aadhaar && userData.aadhaar.length >= 12
      resolve({
        success: isValid,
        verified: isValid,
        message: isValid 
          ? 'KYC verification successful' 
          : 'Invalid Aadhaar number',
        timestamp: new Date().toISOString()
      })
    }, 1000)
  })
}

// Generate SHA-256 like hash for documents
export const generateDocumentHash = (fileName) => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const hash = btoa(`${fileName}-${timestamp}-${randomStr}`)
    .substring(0, 64)
    .toLowerCase()
    .replace(/[^a-f0-9]/g, 'a')
  
  return `0x${hash}`
}

// Mock ownership transfer
export const transferOwnership = (transferData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = transferData.propertyId && transferData.buyerAadhaar
      resolve({
        success,
        transactionId: success ? `TXN${Date.now()}` : null,
        blockchainHash: success ? `0x${Math.random().toString(16).substring(2, 66)}` : null,
        message: success 
          ? 'Ownership transferred successfully' 
          : 'Transfer failed - invalid data',
        timestamp: new Date().toISOString()
      })
    }, 2000)
  })
}

// Mock Google OAuth
export const mockGoogleLogin = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 10000),
        name: 'Google User',
        email: 'user@gmail.com',
        picture: `https://ui-avatars.com/api/?name=Google+User&background=00BCD4&color=fff`
      })
    }, 1000)
  })
}
