const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('buyer', 'seller', 'admin', 'registrar'),
    allowNull: true
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  aadhaarMasked: {
    type: DataTypes.STRING,
    allowNull: true
  },
  aadhaarHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'users'
});

// eKYC Model
const EKYC = sequelize.define('EKYC', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  documentType: {
    type: DataTypes.ENUM('aadhaar', 'pan', 'passport', 'driving_license'),
    allowNull: false
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipfsHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sha256Hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  verificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'ekyc'
});

// Property Model
const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false
  },
  areaValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  areaUnit: {
    type: DataTypes.STRING,
    defaultValue: 'sq ft'
  },
  locationText: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    defaultValue: 0
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    defaultValue: 0
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  cmdaApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('pending_verification', 'listed', 'sold', 'rejected'),
    defaultValue: 'pending_verification'
  },
  propertyType: {
    type: DataTypes.ENUM('residential', 'commercial', 'agricultural', 'industrial'),
    defaultValue: 'residential'
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'properties'
});

// Property Documents Model
const PropertyDocument = sequelize.define('PropertyDocument', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'properties', key: 'id' }
  },
  fileType: {
    type: DataTypes.ENUM('sale_deed', 'encumbrance_certificate', 'tax_receipt', 'khata', 'survey_map', 'noc', 'other'),
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ipfsHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sha256Hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  localPath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'property_documents'
});

// Transaction Model
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'properties', key: 'id' }
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: 'mock'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'transactions'
});

// Ledger Model (Simulated Blockchain)
const Ledger = sequelize.define('Ledger', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  blockIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  previousHash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payloadHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  blockHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  payload: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  eventType: {
    type: DataTypes.ENUM('property_upload', 'property_verification', 'ownership_transfer', 'ekyc_verification'),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'ledger',
  hooks: {
    beforeCreate: async (record, options) => {
      // Auto-increment blockIndex
      const maxBlock = await Ledger.findOne({
        order: [['blockIndex', 'DESC']],
        attributes: ['blockIndex']
      });
      record.blockIndex = maxBlock ? maxBlock.blockIndex + 1 : 0;
    }
  }
});

// Audit Log Model
const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resourceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  updatedAt: false,
  tableName: 'audit_logs'
});

// Notification Model
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'notifications'
});

// Associations
User.hasMany(EKYC, { foreignKey: 'userId', as: 'ekycRecords' });
EKYC.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Property, { foreignKey: 'ownerId', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Property.hasMany(PropertyDocument, { foreignKey: 'propertyId', as: 'documents' });
PropertyDocument.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

Property.hasMany(Transaction, { foreignKey: 'propertyId', as: 'transactions' });
Transaction.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

User.hasMany(Transaction, { foreignKey: 'buyerId', as: 'purchases' });
User.hasMany(Transaction, { foreignKey: 'sellerId', as: 'sales' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  EKYC,
  Property,
  PropertyDocument,
  Transaction,
  Ledger,
  AuditLog,
  Notification
};
