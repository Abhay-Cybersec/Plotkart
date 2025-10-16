require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, EKYC, Property, sequelize } = require('../src/models');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Clear existing data
    await sequelize.query('TRUNCATE TABLE users CASCADE');
    console.log('✓ Database cleared');

    // Seed Admin Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@plotkart.com',
      password: adminPassword,
      role: 'admin',
      isAdmin: true,
      isActive: true
    });
    console.log('✓ Admin user created');

    const registrar = await User.create({
      name: 'Registrar Officer',
      email: 'registrar@plotkart.com',
      password: adminPassword,
      role: 'registrar',
      isAdmin: true,
      isActive: true
    });
    console.log('✓ Registrar user created');

    // Seed Sellers
    const seller1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'seller',
      phone: '+91 9876543210',
      aadhaarMasked: 'XXXX-XXXX-1234',
      isActive: true
    });

    const seller2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: userPassword,
      role: 'seller',
      phone: '+91 9876543211',
      aadhaarMasked: 'XXXX-XXXX-5678',
      isActive: true
    });
    console.log('✓ Seller users created');

    // Seed Buyers
    const buyer1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: userPassword,
      role: 'buyer',
      phone: '+91 9876543212',
      aadhaarMasked: 'XXXX-XXXX-9012',
      isActive: true
    });

    const buyer2 = await User.create({
      name: 'Bob Williams',
      email: 'bob@example.com',
      password: userPassword,
      role: 'buyer',
      phone: '+91 9876543213',
      aadhaarMasked: 'XXXX-XXXX-3456',
      isActive: true
    });

    const buyer3 = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: userPassword,
      role: 'buyer',
      phone: '+91 9876543214',
      aadhaarMasked: 'XXXX-XXXX-7890',
      isActive: true
    });
    console.log('✓ Buyer users created');

    // Seed eKYC records
    await EKYC.create({
      userId: seller1.id,
      documentType: 'aadhaar',
      sha256Hash: 'mock_hash_seller1',
      status: 'verified',
      verifiedBy: admin.id,
      verifiedAt: new Date()
    });

    await EKYC.create({
      userId: seller2.id,
      documentType: 'aadhaar',
      sha256Hash: 'mock_hash_seller2',
      status: 'verified',
      verifiedBy: admin.id,
      verifiedAt: new Date()
    });

    await EKYC.create({
      userId: buyer1.id,
      documentType: 'aadhaar',
      sha256Hash: 'mock_hash_buyer1',
      status: 'verified',
      verifiedBy: admin.id,
      verifiedAt: new Date()
    });

    await EKYC.create({
      userId: buyer2.id,
      documentType: 'aadhaar',
      sha256Hash: 'mock_hash_buyer2',
      status: 'verified',
      verifiedBy: admin.id,
      verifiedAt: new Date()
    });

    await EKYC.create({
      userId: buyer3.id,
      documentType: 'aadhaar',
      sha256Hash: 'mock_hash_buyer3',
      status: 'verified',
      verifiedBy: admin.id,
      verifiedAt: new Date()
    });
    console.log('✓ eKYC records created');

    // Seed Properties
    await Property.create({
      ownerId: seller1.id,
      title: 'Premium Residential Plot',
      description: 'Prime location residential plot with CMDA approval',
      area: '1200 sq ft',
      areaValue: 1200,
      areaUnit: 'sq ft',
      locationText: 'Anna Nagar, Chennai',
      latitude: 13.0878,
      longitude: 80.2085,
      price: 4500000,
      cmdaApproved: true,
      status: 'listed',
      propertyType: 'residential',
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500']
    });

    await Property.create({
      ownerId: seller1.id,
      title: 'Commercial Land',
      description: 'Excellent commercial plot in high-traffic area',
      area: '2500 sq ft',
      areaValue: 2500,
      areaUnit: 'sq ft',
      locationText: 'T. Nagar, Chennai',
      latitude: 13.0418,
      longitude: 80.2341,
      price: 12000000,
      cmdaApproved: true,
      status: 'listed',
      propertyType: 'commercial',
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      images: ['https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=500']
    });

    await Property.create({
      ownerId: seller2.id,
      title: 'Agricultural Land',
      description: 'Fertile agricultural land with water source',
      area: '5 acres',
      areaValue: 217800,
      areaUnit: 'sq ft',
      locationText: 'Kanchipuram District',
      latitude: 12.8342,
      longitude: 79.7036,
      price: 7500000,
      cmdaApproved: false,
      status: 'listed',
      propertyType: 'agricultural',
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      images: ['https://images.unsplash.com/photo-1560493676-04071c5f467b?w=500']
    });

    await Property.create({
      ownerId: seller2.id,
      title: 'Gated Community Plot',
      description: 'Premium gated community plot with modern amenities',
      area: '1800 sq ft',
      areaValue: 1800,
      areaUnit: 'sq ft',
      locationText: 'OMR, Chennai',
      latitude: 12.9121,
      longitude: 80.2270,
      price: 6500000,
      cmdaApproved: true,
      status: 'listed',
      propertyType: 'residential',
      verifiedBy: admin.id,
      verifiedAt: new Date(),
      images: ['https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=500']
    });

    await Property.create({
      ownerId: seller2.id,
      title: 'Industrial Plot Near Highway',
      description: 'Large industrial plot with highway access',
      area: '10000 sq ft',
      areaValue: 10000,
      areaUnit: 'sq ft',
      locationText: 'Sriperumbudur, Chennai',
      latitude: 12.9675,
      longitude: 79.9439,
      price: 15000000,
      cmdaApproved: true,
      status: 'pending_verification',
      propertyType: 'industrial',
      images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500']
    });

    await Property.create({
      ownerId: seller1.id,
      title: 'Villa Plot with Garden',
      description: 'Spacious villa plot with garden space',
      area: '3000 sq ft',
      areaValue: 3000,
      areaUnit: 'sq ft',
      locationText: 'ECR, Chennai',
      latitude: 12.7945,
      longitude: 80.2185,
      price: 9000000,
      cmdaApproved: false,
      status: 'pending_verification',
      propertyType: 'residential',
      images: ['https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=500']
    });

    console.log('✓ Properties created');

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@plotkart.com / admin123');
    console.log('Seller: john@example.com / password123');
    console.log('Buyer: alice@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
