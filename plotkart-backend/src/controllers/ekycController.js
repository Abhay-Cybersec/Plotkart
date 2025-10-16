const { EKYC, User } = require('../models');
const hashService = require('../services/hashService');
const ipfsService = require('../services/ipfsService');
const notificationService = require('../services/notificationService');
const ledgerService = require('../services/ledgerService');
const auditService = require('../services/auditService');
const { maskAadhaar } = require('../utils/helpers');

// Upload eKYC documents
exports.uploadKYC = async (req, res, next) => {
  try {
    const { documentType, documentNumber } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    // Hash the file
    const sha256Hash = await hashService.hashFile(req.file.path);

    // Upload to IPFS
    const ipfsResult = await ipfsService.uploadFile(req.file.path, req.file.filename);

    // Mask Aadhaar if applicable
    let maskedNumber = null;
    let hashedNumber = null;
    if (documentType === 'aadhaar' && documentNumber) {
      maskedNumber = maskAadhaar(documentNumber);
      hashedNumber = hashService.hashString(documentNumber);
    }

    // Create eKYC record
    const ekyc = await EKYC.create({
      userId,
      documentType,
      documentNumber: maskedNumber,
      ipfsHash: ipfsResult.hash,
      sha256Hash,
      status: 'pending',
      metadata: {
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        ipfsUrl: ipfsResult.url
      }
    });

    // Update user if Aadhaar
    if (documentType === 'aadhaar') {
      await User.update(
        { 
          aadhaarMasked: maskedNumber,
          aadhaarHash: hashedNumber
        },
        { where: { id: userId } }
      );
    }

    await auditService.log(userId, 'upload_kyc', 'ekyc', ekyc.id, req, { documentType });

    res.status(201).json({
      message: 'KYC document uploaded successfully',
      ekyc: {
        id: ekyc.id,
        documentType: ekyc.documentType,
        status: ekyc.status,
        sha256Hash: ekyc.sha256Hash,
        ipfsHash: ekyc.ipfsHash
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get eKYC status
exports.getKYCStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ekyc = await EKYC.findByPk(id);
    if (!ekyc) {
      return res.status(404).json({ error: 'KYC record not found' });
    }

    // Check authorization
    if (ekyc.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ ekyc });
  } catch (error) {
    next(error);
  }
};

// Get pending KYC records (admin only)
exports.getPendingKYC = async (req, res, next) => {
  try {
    const pending = await EKYC.findAll({
      where: { status: 'pending' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json({ pending, count: pending.length });
  } catch (error) {
    next(error);
  }
};

// Verify KYC (admin only)
exports.verifyKYC = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved, notes } = req.body;

    const ekyc = await EKYC.findByPk(id);
    if (!ekyc) {
      return res.status(404).json({ error: 'KYC record not found' });
    }

    ekyc.status = approved ? 'verified' : 'rejected';
    ekyc.verifiedBy = req.user.id;
    ekyc.verifiedAt = new Date();
    ekyc.verificationNotes = notes;
    await ekyc.save();

    // Add to ledger
    await ledgerService.addEntry('ekyc_verification', {
      ekycId: ekyc.id,
      userId: ekyc.userId,
      status: ekyc.status,
      verifiedBy: req.user.id,
      timestamp: new Date()
    });

    // Send notification
    if (approved) {
      await notificationService.sendKYCVerified(ekyc.userId);
    }

    await auditService.log(req.user.id, 'verify_kyc', 'ekyc', ekyc.id, req, { approved });

    res.json({
      message: `KYC ${approved ? 'verified' : 'rejected'} successfully`,
      ekyc
    });
  } catch (error) {
    next(error);
  }
};
