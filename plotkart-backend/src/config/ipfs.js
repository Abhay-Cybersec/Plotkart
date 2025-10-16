const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class IPFSService {
  constructor() {
    this.mode = process.env.IPFS_MODE || 'disabled';
  }

  async uploadFile(filePath, fileName) {
    try {
      if (this.mode === 'pinata') {
        return await this.uploadToPinata(filePath, fileName);
      } else {
        // Fallback: return local path (IPFS disabled for now)
        console.log('IPFS disabled - using local storage');
        return { hash: null, url: `/uploads/${fileName}` };
      }
    } catch (error) {
      console.error('IPFS upload error:', error);
      return { hash: null, url: `/uploads/${fileName}` };
    }
  }

  async uploadToPinata(filePath, fileName) {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        project: 'plotkart'
      }
    });
    formData.append('pinataMetadata', metadata);

    const response = await axios.post(url, formData, {
      maxBodyLength: 'Infinity',
      headers: {
        ...formData.getHeaders(),
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET
      }
    });

    return {
      hash: response.data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
    };
  }

  async getFile(hash) {
    if (this.mode === 'pinata' && hash) {
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return null;
  }
}

module.exports = new IPFSService();
