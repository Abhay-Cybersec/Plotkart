const { Property, PropertyDocument, User, EKYC } = require('../models');
const { Op } = require('sequelize');
const hashService = require('../services/hashService');
const ipfsService = require('../services/ipfsService');
const ledgerService = require('../services/ledgerService');
const auditService = require('../services/auditService');
const { getPagination, formatPaginatedResponse } = require('../utils/helpers');

// Upload property
exports.uploadProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      area,
      locationText,
      latitude,
      longitude,
      price,
      cmdaApproved,
      propertyType
    } = req.body;

    const userId = req.user.id;

    // Check if user has verified KYC
    const verifiedKYC = await EKYC.findOne({
      where: { userId, status: 'verified' }
    });

    if (!verifiedKYC) {
      return res.status(403).json({ 
        error: 'KYC verification required',
        message: 'Please complete KYC verification before uploading properties'
      });
    }

    // Parse area value
    const areaMatch = area.match(/(\d+(?:\.\d+)?)\s*(.+)/);
    const areaValue = areaMatch ? parseFloat(areaMatch[1]) : 0;
    const areaUnit = areaMatch ? areaMatch[2] : 'sq ft';

    // Create property
    const property = await Property.create({
      ownerId: userId,
      title,
      description,
      area,
      areaValue,
      areaUnit,
      locationText,
      latitude,
      longitude,
      price,
      cmdaApproved: cmdaApproved === 'true' || cmdaApproved === true,
      propertyType: propertyType || 'residential',
      status: 'pending_verification'
    });

    // Handle document uploads
    if (req.files && req.files.length > 0) {
      const documents = [];
      
      for (const file of req.files) {
        const sha256Hash = await hashService.hashFile(file.path);
        const ipfsResult = await ipfsService.uploadFile(file.path, file.filename);

        const doc = await PropertyDocument.create({
          propertyId: property.id,
          fileType: 'other',
          fileName: file.originalname,
          ipfsHash: ipfsResult.hash,
          sha256Hash,
          localPath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype
        });

        documents.push(doc);
      }
    }

    // Handle image uploads (store URLs in property.images array)
    if (req.body.images) {
      property.images = JSON.parse(req.body.images);
      await property.save();
    }

    // Add to ledger
    await ledgerService.addEntry('property_upload', {
      propertyId: property.id,
      ownerId: userId,
      title,
      locationText,
      price,
      timestamp: new Date()
    });

    await auditService.log(userId, 'upload_property', 'property', property.id, req);

    res.status(201).json({
      message: 'Property uploaded successfully and pending verification',
      property: {
        id: property.id,
        title: property.title,
        status: property.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all properties (with filters)
exports.getProperties = async (req, res, next) => {
  try {
    const { 
      location, 
      minArea, 
      maxArea, 
      cmda, 
      status,
      ownerId,
      page = 1, 
      limit = 10 
    } = req.query;

    const where = {};

    // Status filter (only show 'listed' to buyers by default)
    if (status) {
      where.status = status;
    } else if (!req.user || req.user.role === 'buyer') {
      where.status = 'listed';
    }

    // Owner filter (for seller dashboard)
    if (ownerId) {
      where.ownerId = ownerId;
    }

    // Location filter
    if (location) {
      where.locationText = { [Op.iLike]: `%${location}%` };
    }

    // Area filter
    if (minArea || maxArea) {
      where.areaValue = {};
      if (minArea) where.areaValue[Op.gte] = parseFloat(minArea);
      if (maxArea) where.areaValue[Op.lte] = parseFloat(maxArea);
    }

    // CMDA filter
    if (cmda === 'true') {
      where.cmdaApproved = true;
    }

    const { limit: queryLimit, offset } = getPagination(page, limit);

    const { count, rows } = await Property.findAndCountAll({
      where,
      limit: queryLimit,
      offset,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(formatPaginatedResponse(rows, page, limit, count));
  } catch (error) {
    next(error);
  }
};

// Get property by ID
exports.getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: PropertyDocument,
          as: 'documents'
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property });
  } catch (error) {
    next(error);
  }
};

// Get property location (coordinates)
exports.getPropertyLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id, {
      attributes: ['id', 'title', 'latitude', 'longitude', 'locationText']
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const googleMapsLink = `https://www.google.com/maps?q=${property.latitude},${property.longitude}`;
    const embedLink = `https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY}&q=${property.latitude},${property.longitude}`;

    res.json({
      location: {
        latitude: property.latitude,
        longitude: property.longitude,
        address: property.locationText,
        googleMapsLink,
        embedLink
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get pending verification properties (admin only)
exports.getPendingProperties = async (req, res, next) => {
  try {
    const properties = await Property.findAll({
      where: { status: 'pending_verification' },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json({ properties, count: properties.length });
  } catch (error) {
    next(error);
  }
};

// Verify property (Admin only) - NEW ENDPOINT
exports.verifyProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Update property status based on action
    if (action === 'approve') {
      property.status = 'listed';
      property.verifiedAt = new Date();
      property.verificationNotes = notes || 'Approved by admin';
    } else if (action === 'reject') {
      property.status = 'rejected';
      property.verifiedAt = new Date();
      property.verificationNotes = notes || 'Rejected by admin';
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    await property.save();

    // Add to ledger
    await ledgerService.addEntry('property_verification', {
      propertyId: property.id,
      verifiedBy: req.user.id,
      action,
      status: property.status,
      timestamp: new Date()
    });

    await auditService.log(req.user.id, `${action}_property`, 'property', property.id, req);

    res.json({
      message: `Property ${action}d successfully`,
      property: {
        id: property.id,
        title: property.title,
        status: property.status,
        verifiedAt: property.verifiedAt
      }
    });
  } catch (error) {
    next(error);
  }
};
