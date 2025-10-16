/**
 * Hyperledger Fabric Smart Contract Stub for PlotKart
 * 
 * This is a template for property management chaincode.
 * Deploy this to Hyperledger Fabric network for production use.
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class PropertyContract extends Contract {

  // Initialize ledger with genesis data
  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');
    const properties = [];
    
    for (let i = 0; i < properties.length; i++) {
      await ctx.stub.putState('PROPERTY' + i, Buffer.from(JSON.stringify(properties[i])));
      console.info('Added property:', properties[i]);
    }
    console.info('============= END : Initialize Ledger ===========');
  }

  // Register new property on blockchain
  async registerProperty(ctx, propertyId, propertyData) {
    console.info('============= START : Register Property ===========');

    const property = JSON.parse(propertyData);
    
    // Validation
    if (!property.ownerId || !property.title || !property.latitude || !property.longitude) {
      throw new Error('Missing required property fields');
    }

    // Check if property already exists
    const exists = await this.propertyExists(ctx, propertyId);
    if (exists) {
      throw new Error(`Property ${propertyId} already exists`);
    }

    // Create property record
    const propertyRecord = {
      propertyId,
      ownerId: property.ownerId,
      title: property.title,
      description: property.description,
      locationText: property.locationText,
      latitude: property.latitude,
      longitude: property.longitude,
      area: property.area,
      price: property.price,
      cmdaApproved: property.cmdaApproved || false,
      status: 'pending_verification',
      documentHashes: property.documentHashes || [],
      registeredAt: new Date().toISOString(),
      verifiedAt: null,
      verifiedBy: null,
      currentOwner: property.ownerId,
      previousOwners: [],
      transactionHistory: []
    };

    await ctx.stub.putState(propertyId, Buffer.from(JSON.stringify(propertyRecord)));
    
    console.info('============= END : Register Property ===========');
    return JSON.stringify(propertyRecord);
  }

  // Verify property (admin/registrar only)
  async verifyProperty(ctx, propertyId, verifierId, approved, notes) {
    console.info('============= START : Verify Property ===========');

    const propertyAsBytes = await ctx.stub.getState(propertyId);
    if (!propertyAsBytes || propertyAsBytes.length === 0) {
      throw new Error(`Property ${propertyId} does not exist`);
    }

    const property = JSON.parse(propertyAsBytes.toString());

    // Update verification status
    property.status = approved ? 'verified' : 'rejected';
    property.verifiedBy = verifierId;
    property.verifiedAt = new Date().toISOString();
    property.verificationNotes = notes;

    await ctx.stub.putState(propertyId, Buffer.from(JSON.stringify(property)));

    console.info('============= END : Verify Property ===========');
    return JSON.stringify(property);
  }

  // Transfer ownership
  async transferOwnership(ctx, propertyId, fromOwnerId, toOwnerId, transactionId, amount) {
    console.info('============= START : Transfer Ownership ===========');

    const propertyAsBytes = await ctx.stub.getState(propertyId);
    if (!propertyAsBytes || propertyAsBytes.length === 0) {
      throw new Error(`Property ${propertyId} does not exist`);
    }

    const property = JSON.parse(propertyAsBytes.toString());

    // Validate current owner
    if (property.currentOwner !== fromOwnerId) {
      throw new Error(`Ownership mismatch. Current owner is ${property.currentOwner}`);
    }

    // Verify property is in verified status
    if (property.status !== 'verified' && property.status !== 'listed') {
      throw new Error(`Property must be verified before transfer`);
    }

    // Update ownership
    property.previousOwners.push({
      ownerId: fromOwnerId,
      ownedFrom: property.registeredAt,
      ownedUntil: new Date().toISOString()
    });

    property.currentOwner = toOwnerId;
    property.status = 'sold';

    // Add transaction record
    property.transactionHistory.push({
      transactionId,
      from: fromOwnerId,
      to: toOwnerId,
      amount,
      timestamp: new Date().toISOString(),
      txHash: ctx.stub.getTxID()
    });

    await ctx.stub.putState(propertyId, Buffer.from(JSON.stringify(property)));

    console.info('============= END : Transfer Ownership ===========');
    return JSON.stringify(property);
  }

  // Query property by ID
  async queryProperty(ctx, propertyId) {
    const propertyAsBytes = await ctx.stub.getState(propertyId);
    if (!propertyAsBytes || propertyAsBytes.length === 0) {
      throw new Error(`Property ${propertyId} does not exist`);
    }
    return propertyAsBytes.toString();
  }

  // Get property history
  async getPropertyHistory(ctx, propertyId) {
    const iterator = await ctx.stub.getHistoryForKey(propertyId);
    const history = [];

    while (true) {
      const result = await iterator.next();

      if (result.value && result.value.value.toString()) {
        const record = {
          txId: result.value.tx_id,
          timestamp: result
