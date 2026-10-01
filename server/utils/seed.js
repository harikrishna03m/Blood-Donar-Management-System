const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const DonationRecord = require('../models/DonationRecord');

const initialAdmin = {
  name: 'System Administrator',
  email: process.env.ADMIN_EMAIL || 'admin123@gmail.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  role: 'admin',
  bloodGroup: 'O+',
  phone: '+1 (555) 019-2831',
  city: 'New York',
  state: 'NY',
  isAvailable: false,
  isVerified: true,
  bio: 'Blood Bank Administration & Donor Network Coordinator',
};

const sampleDonors = [
  {
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    password: 'password123',
    bloodGroup: 'O-',
    phone: '+1 (555) 234-5678',
    city: 'New York',
    state: 'NY',
    age: 28,
    gender: 'Female',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago (eligible)
    totalDonations: 6,
    isVerified: true,
    bio: 'Universal donor (O-). Dedicated to helping in critical emergencies!',
  },
  {
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    password: 'password123',
    bloodGroup: 'A+',
    phone: '+1 (555) 345-6789',
    city: 'San Francisco',
    state: 'CA',
    age: 34,
    gender: 'Male',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
    totalDonations: 4,
    isVerified: true,
    bio: 'Tech lead in SF. Ready to donate blood whenever urgent requests arise.',
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    password: 'password123',
    bloodGroup: 'B+',
    phone: '+1 (555) 456-7890',
    city: 'Chicago',
    state: 'IL',
    age: 25,
    gender: 'Female',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
    totalDonations: 3,
    isVerified: true,
    bio: 'Volunteer nurse. Happy to assist patients in local hospitals.',
  },
  {
    name: 'David Wilson',
    email: 'david.w@example.com',
    password: 'password123',
    bloodGroup: 'AB+',
    phone: '+1 (555) 567-8901',
    city: 'Houston',
    state: 'TX',
    age: 41,
    gender: 'Male',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago (temporarily resting)
    totalDonations: 12,
    isVerified: true,
    bio: 'Universal recipient (AB+) and frequent platelet donor.',
  },
  {
    name: 'Jessica Taylor',
    email: 'jessica.t@example.com',
    password: 'password123',
    bloodGroup: 'O+',
    phone: '+1 (555) 678-9012',
    city: 'Seattle',
    state: 'WA',
    age: 30,
    gender: 'Female',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
    totalDonations: 5,
    isVerified: true,
    bio: 'Regular blood donor since college. Let us help save lives together.',
  },
  {
    name: 'Robert Martinez',
    email: 'robert.m@example.com',
    password: 'password123',
    bloodGroup: 'A-',
    phone: '+1 (555) 789-0123',
    city: 'Boston',
    state: 'MA',
    age: 29,
    gender: 'Male',
    isAvailable: false,
    lastDonationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    totalDonations: 8,
    isVerified: true,
    bio: 'Avid runner and blood donation advocate.',
  },
  {
    name: 'Aisha Patel',
    email: 'aisha.p@example.com',
    password: 'password123',
    bloodGroup: 'B-',
    phone: '+1 (555) 890-1234',
    city: 'Atlanta',
    state: 'GA',
    age: 27,
    gender: 'Female',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    totalDonations: 2,
    isVerified: true,
    bio: 'Rare blood group B- donor. Always on call for emergencies.',
  },
  {
    name: 'Daniel Kim',
    email: 'daniel.k@example.com',
    password: 'password123',
    bloodGroup: 'AB-',
    phone: '+1 (555) 901-2345',
    city: 'Austin',
    state: 'TX',
    age: 32,
    gender: 'Male',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    totalDonations: 5,
    isVerified: true,
    bio: 'AB- donor. Ready to travel across Austin for emergency donation calls.',
  },
];

const sampleRequests = [
  {
    patientName: 'Lucas Vance',
    bloodGroup: 'O-',
    unitsNeeded: 3,
    hospitalName: 'Manhattan Memorial Hospital',
    hospitalAddress: '550 1st Avenue, Manhattan',
    city: 'New York',
    contactPerson: 'Dr. Rebecca Stone',
    contactPhone: '+1 (555) 112-9900',
    urgency: 'Urgent',
    status: 'Open',
    neededByDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    medicalReason: 'Emergency surgery following severe highway collision',
    additionalNotes: 'Critical need for O- negative universal blood immediately.',
  },
  {
    patientName: 'Grace Hopper',
    bloodGroup: 'A+',
    unitsNeeded: 2,
    hospitalName: 'Bay Area Regional Medical Center',
    hospitalAddress: '100 Medical Center Dr',
    city: 'San Francisco',
    contactPerson: 'James Hopper (Family)',
    contactPhone: '+1 (555) 223-8811',
    urgency: 'Urgent',
    status: 'In Progress',
    neededByDate: new Date(Date.now() + 36 * 60 * 60 * 1000),
    medicalReason: 'Cardiovascular bypass scheduled for tomorrow morning',
    additionalNotes: 'Patient is in ICU room 402.',
  },
  {
    patientName: 'Marcus Aurelius',
    bloodGroup: 'B+',
    unitsNeeded: 1,
    hospitalName: 'Northwestern Memorial Hospital',
    hospitalAddress: '251 E Huron St',
    city: 'Chicago',
    contactPerson: 'Clara Aurelius',
    contactPhone: '+1 (555) 334-7722',
    urgency: 'Moderate',
    status: 'Open',
    neededByDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
    medicalReason: 'Chemotherapy supportive transfusion',
    additionalNotes: 'Donor can donate anytime during hospital blood bank hours (8 AM - 6 PM).',
  },
  {
    patientName: 'Sophia Miller',
    bloodGroup: 'O+',
    unitsNeeded: 2,
    hospitalName: 'Swedish Medical Center',
    hospitalAddress: '747 Broadway',
    city: 'Seattle',
    contactPerson: 'David Miller',
    contactPhone: '+1 (555) 445-6633',
    urgency: 'Routine',
    status: 'Fulfilled',
    neededByDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
    medicalReason: 'Post-delivery anemia recovery',
    additionalNotes: 'Successfully fulfilled thanks to community donors.',
  },
];

const seedDatabaseIfEmpty = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('--- Initializing Admin User ---');
      await User.create(initialAdmin);
      console.log(`[Admin Seeded]: Email: ${initialAdmin.email} | Password: ${initialAdmin.password}`);
    }

    const donorCount = await User.countDocuments({ role: 'donor' });
    if (donorCount === 0) {
      console.log('--- Seeding Sample Donors & Blood Requests ---');
      for (const donorData of sampleDonors) {
        await User.create(donorData);
      }
      console.log(`[Donors Seeded]: ${sampleDonors.length} donors created`);

      for (const reqData of sampleRequests) {
        await BloodRequest.create(reqData);
      }
      console.log(`[Blood Requests Seeded]: ${sampleRequests.length} requests created`);

      // Seed a few sample donation records
      const seededDonor = await User.findOne({ email: 'sarah.j@example.com' });
      if (seededDonor) {
        await DonationRecord.create({
          donor: seededDonor._id,
          bloodGroup: seededDonor.bloodGroup,
          units: 1,
          recipientName: 'Lucas Vance (Hospital Unit)',
          hospitalName: 'Manhattan Memorial Hospital',
          city: 'New York',
          donationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          notes: 'Emergency donation',
        });
      }
    }
  } catch (err) {
    console.error('Error during auto-seeding:', err.message);
  }
};

module.exports = { seedDatabaseIfEmpty, initialAdmin, sampleDonors, sampleRequests };
