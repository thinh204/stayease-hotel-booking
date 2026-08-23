import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting StayEase database seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.userStatistics.deleteMany();
  await prisma.adminSettings.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // Password hashes
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const managerPassword = await bcrypt.hash('Manager@123456', 10);
  const userPassword = await bcrypt.hash('User@123456', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@stayease.com',
      password: adminPassword,
      fullName: 'Alexander Wright (Super Admin)',
      phone: '+1 (555) 019-2834',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Principal System Architect & Luxury Hospitality Director',
      isActive: true,
      lastLogin: new Date(),
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager@stayease.com',
      password: managerPassword,
      fullName: 'Elena Rostova',
      phone: '+84 901 234 567',
      role: 'MANAGER',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      bio: 'Senior Resort General Manager - Southeast Asia Region',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * 4),
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@stayease.com',
      password: managerPassword,
      fullName: 'Park Min-jun',
      phone: '+82 10 9876 5432',
      role: 'MANAGER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'East Asia Regional Director of Hospitality Operations',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * 12),
    },
  });

  const regularUser1 = await prisma.user.create({
    data: {
      email: 'user@stayease.com',
      password: userPassword,
      fullName: 'Sophia Montgomery',
      phone: '+1 (415) 890-1234',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Frequent luxury traveler and VIP rewards member',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * 2),
    },
  });

  const regularUser2 = await prisma.user.create({
    data: {
      email: 'nguyen.anh@example.com',
      password: userPassword,
      fullName: 'Nguyễn Hoàng Anh',
      phone: '+84 912 345 678',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      bio: 'Travel blogger and architecture enthusiast',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * 24),
    },
  });

  const regularUser3 = await prisma.user.create({
    data: {
      email: 'kim.jiwon@example.kr',
      password: userPassword,
      fullName: 'Kim Ji-won',
      phone: '+82 10 4567 8901',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bio: 'Design consultant & wellness retreat enthusiast',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * 8),
    },
  });

  const regularUser4 = await prisma.user.create({
    data: {
      email: 'david.chen@example.com',
      password: userPassword,
      fullName: 'David Chen',
      phone: '+65 9123 4567',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Global business executive',
      isActive: true,
      lastLogin: new Date(Date.now() - 3600000 * 48),
    },
  });

  const lockedUser = await prisma.user.create({
    data: {
      email: 'suspicious.account@test.com',
      password: userPassword,
      fullName: 'Marcus Vance',
      phone: '+44 7700 900077',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      bio: 'Flagged for multiple payment retries',
      isActive: false,
      isLocked: true,
      lockedUntil: new Date(Date.now() + 86400000 * 7),
      loginAttempts: 5,
    },
  });

  console.log('✅ Created 8 Users with various roles and statuses.');

  // 2. Create Luxury Hotels
  const hotel1 = await prisma.hotel.create({
    data: {
      name: 'Grand Bay Luxury Resort & Spa',
      description: 'Nestled along the pristine turquoise coastline of Da Nang, Grand Bay offers private infinity pools, Michelin-starred seaside dining, and tailored wellness therapies.',
      city: 'Da Nang',
      country: 'Vietnam',
      address: '88 Vo Nguyen Giap Blvd, Ngu Hanh Son',
      pricePerNight: 420,
      rating: 4.95,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&auto=format&fit=crop&q=80',
      ]),
      amenities: JSON.stringify(['Private Beach', 'Infinity Pool', 'Michelin Restaurant', 'Full-service Spa', 'Helipad Access', 'Butler Service']),
      isActive: true,
      managerId: manager1.id,
      createdBy: adminUser.id,
    },
  });

  const hotel2 = await prisma.hotel.create({
    data: {
      name: 'The Imperial Citadel Heritage Hotel',
      description: 'An iconic French colonial sanctuary nestled in the heart of Hanoi, blending neoclassical elegance with authentic Indochine charm.',
      city: 'Hanoi',
      country: 'Vietnam',
      address: '15 Ngo Quyen Street, Hoan Kiem District',
      pricePerNight: 350,
      rating: 4.88,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop&q=80',
      ]),
      amenities: JSON.stringify(['Heritage Courtyard', 'Fine Wine Cellar', 'Heated Pool', 'Concierge Excellence', 'Limousine Transfer']),
      isActive: true,
      managerId: manager1.id,
      createdBy: adminUser.id,
    },
  });

  const hotel3 = await prisma.hotel.create({
    data: {
      name: 'Gangnam Sky Tower & Residences',
      description: 'Ultra-modern 5-star urban oasis towering over the glamorous Gangnam district in Seoul with 360-degree skyline views and ambient skylounges.',
      city: 'Seoul',
      country: 'South Korea',
      address: '521 Teheran-ro, Gangnam-gu',
      pricePerNight: 520,
      rating: 4.92,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&auto=format&fit=crop&q=80',
      ]),
      amenities: JSON.stringify(['Sky Lounge', 'Hydrotherapy Spa', 'Smart Room Control', 'Executive Club', 'Valet Parking', '24/7 Room Service']),
      isActive: true,
      managerId: manager2.id,
      createdBy: adminUser.id,
    },
  });

  const hotel4 = await prisma.hotel.create({
    data: {
      name: 'Kyoto Zen Garden Onsen Retreat',
      description: 'Immerse in tranquility at an authentic traditional luxury Ryokan with natural hot springs, Japanese Zen rock gardens, and Kaiseki gastronomy.',
      city: 'Kyoto',
      country: 'Japan',
      address: '32 Arashiyama Nakaoshita-cho, Ukyo-ku',
      pricePerNight: 680,
      rating: 4.97,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
      ]),
      amenities: JSON.stringify(['Natural Onsen', 'Tea Ceremony Pavilion', 'Kaiseki Dining', 'Private Garden', 'Forest Meditation']),
      isActive: true,
      managerId: manager2.id,
      createdBy: adminUser.id,
    },
  });

  const hotel5 = await prisma.hotel.create({
    data: {
      name: 'Le Palais Royal Vendôme',
      description: 'Steeped in 18th-century Parisian grandeur, featuring crystal chandeliers, haute couture suites, and courtyard gardens beside Place Vendôme.',
      city: 'Paris',
      country: 'France',
      address: '12 Rue de la Paix, 1st Arrondissement',
      pricePerNight: 890,
      rating: 4.96,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200&auto=format&fit=crop&q=80',
      ]),
      amenities: JSON.stringify(['Michelin 3-Star Dining', 'Christian Dior Spa', 'Chauffeured Rolls-Royce', 'Art Collection', 'Private Terrace']),
      isActive: true,
      managerId: manager1.id,
      createdBy: adminUser.id,
    },
  });

  const hotel6 = await prisma.hotel.create({
    data: {
      name: 'Chao Phraya Riverside Sanctuary',
      description: 'A serene tropical palace on the banks of Bangkok’s River of Kings, with lush gardens, private boat shuttles, and sunset dining pavilions.',
      city: 'Bangkok',
      country: 'Thailand',
      address: '300 Charoen Krung Road, Bang Kho Laem',
      pricePerNight: 310,
      rating: 4.85,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&auto=format&fit=crop&q=80',
      ]),
      amenities: JSON.stringify(['Private Boat Shuttle', 'Riverside Infinity Pool', 'Thai Culinary Academy', 'Ayurvedic Spa']),
      isActive: true,
      managerId: manager1.id,
      createdBy: adminUser.id,
    },
  });

  console.log('✅ Created 6 Luxury Hotels.');

  // 3. Create Rooms
  const room1 = await prisma.room.create({
    data: {
      hotelId: hotel1.id,
      type: 'Oceanfront Presidential Suite',
      price: 650,
      capacity: 4,
      totalRooms: 6,
      availableRooms: 3,
      amenities: JSON.stringify(['King Bed', 'Private Plunge Pool', 'Panoramic Sea View', 'Free Champagne']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80']),
    },
  });

  const room2 = await prisma.room.create({
    data: {
      hotelId: hotel1.id,
      type: 'Deluxe Garden Villa',
      price: 420,
      capacity: 2,
      totalRooms: 12,
      availableRooms: 7,
      amenities: JSON.stringify(['King Bed', 'Private Sun Deck', 'Outdoor Rain Shower', 'Complimentary Breakfast']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop&q=80']),
    },
  });

  const room3 = await prisma.room.create({
    data: {
      hotelId: hotel3.id,
      type: 'Skyline Penthouse Executive',
      price: 780,
      capacity: 3,
      totalRooms: 4,
      availableRooms: 2,
      amenities: JSON.stringify(['High Floor', 'Cocktail Bar', 'Bang & Olufsen Sound', 'Sauna']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80']),
    },
  });

  const room4 = await prisma.room.create({
    data: {
      hotelId: hotel5.id,
      type: 'Royal Suite Imperial',
      price: 1200,
      capacity: 2,
      totalRooms: 3,
      availableRooms: 1,
      amenities: JSON.stringify(['Antique Fireplace', 'Silk Drapery', 'Private Dining Room', 'Dedicated Butler']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&auto=format&fit=crop&q=80']),
    },
  });

  console.log('✅ Created Rooms.');

  // 4. Create Bookings
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const daysAhead = (d: number) => new Date(now.getTime() + d * 86400000);

  const bookingsData = [
    {
      reference: 'BK-78921',
      userId: regularUser1.id,
      hotelId: hotel1.id,
      roomId: room1.id,
      checkIn: daysAhead(5),
      checkOut: daysAhead(10),
      nights: 5,
      guests: 2,
      totalPrice: 3250,
      status: 'confirmed',
      paymentStatus: 'completed',
      specialRequests: 'Anniversary celebration. Please prepare bottle of Dom Pérignon.',
    },
    {
      reference: 'BK-78922',
      userId: regularUser2.id,
      hotelId: hotel3.id,
      roomId: room3.id,
      checkIn: daysAhead(2),
      checkOut: daysAhead(6),
      nights: 4,
      guests: 2,
      totalPrice: 3120,
      status: 'confirmed',
      paymentStatus: 'completed',
      specialRequests: 'High floor corner room preferred.',
    },
    {
      reference: 'BK-78923',
      userId: regularUser3.id,
      hotelId: hotel4.id,
      checkIn: daysAgo(7),
      checkOut: daysAgo(3),
      nights: 4,
      guests: 2,
      totalPrice: 2720,
      status: 'completed',
      paymentStatus: 'completed',
      specialRequests: 'Vegetarian Kaiseki set requested.',
    },
    {
      reference: 'BK-78924',
      userId: regularUser4.id,
      hotelId: hotel5.id,
      roomId: room4.id,
      checkIn: daysAhead(15),
      checkOut: daysAhead(20),
      nights: 5,
      guests: 2,
      totalPrice: 6000,
      status: 'confirmed',
      paymentStatus: 'completed',
      specialRequests: 'Airport transfer via Rolls-Royce Ghost.',
    },
    {
      reference: 'BK-78925',
      userId: regularUser1.id,
      hotelId: hotel2.id,
      checkIn: daysAhead(1),
      checkOut: daysAhead(4),
      nights: 3,
      guests: 1,
      totalPrice: 1050,
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: 'Late check-in around 11:00 PM.',
    },
    {
      reference: 'BK-78926',
      userId: regularUser2.id,
      hotelId: hotel6.id,
      checkIn: daysAgo(14),
      checkOut: daysAgo(10),
      nights: 4,
      guests: 2,
      totalPrice: 1240,
      status: 'completed',
      paymentStatus: 'completed',
    },
    {
      reference: 'BK-78927',
      userId: regularUser3.id,
      hotelId: hotel1.id,
      roomId: room2.id,
      checkIn: daysAgo(3),
      checkOut: daysAgo(1),
      nights: 2,
      guests: 2,
      totalPrice: 840,
      status: 'cancelled',
      paymentStatus: 'refunded',
      refundAmount: 840,
      refundReason: 'Flight cancellation due to weather storm.',
    },
  ];

  for (const b of bookingsData) {
    await prisma.booking.create({ data: b });
  }

  console.log('✅ Created 7 Bookings.');

  // 5. Create Reviews
  await prisma.review.createMany({
    data: [
      {
        userId: regularUser1.id,
        hotelId: hotel1.id,
        rating: 5,
        comment: 'Absolutely breathtaking resort! The infinity pool and seaside breakfast were beyond extraordinary.',
      },
      {
        userId: regularUser3.id,
        hotelId: hotel4.id,
        rating: 5,
        comment: 'Peaceful onsen experience and pristine Kyoto gardens. Highly recommended for couples.',
      },
      {
        userId: regularUser2.id,
        hotelId: hotel6.id,
        rating: 5,
        comment: 'Watching sunsets over Chao Phraya River from our private balcony was magical.',
      },
    ],
  });

  // 6. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'UPDATE_PLATFORM_SETTINGS',
        entity: 'AdminSettings',
        entityId: 'global',
        description: 'Updated global currency to USD and enabled two-factor authentication requirements.',
        oldValues: JSON.stringify({ currency: 'USD', enableTwoFactor: false }),
        newValues: JSON.stringify({ currency: 'USD', enableTwoFactor: true }),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36',
        status: 'success',
      },
      {
        userId: adminUser.id,
        action: 'LOCK_USER',
        entity: 'User',
        entityId: lockedUser.id,
        description: 'Locked suspicious account due to 5 consecutive failed payment attempts.',
        oldValues: JSON.stringify({ isLocked: false, loginAttempts: 0 }),
        newValues: JSON.stringify({ isLocked: true, loginAttempts: 5 }),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36',
        status: 'success',
      },
      {
        userId: manager1.id,
        action: 'EDIT_HOTEL',
        entity: 'Hotel',
        entityId: hotel1.id,
        description: 'Adjusted seasonal peak rate for Grand Bay Luxury Resort & Spa.',
        oldValues: JSON.stringify({ pricePerNight: 390 }),
        newValues: JSON.stringify({ pricePerNight: 420 }),
        ipAddress: '14.162.180.25',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'success',
      },
      {
        userId: manager1.id,
        action: 'PROCESS_REFUND',
        entity: 'Booking',
        entityId: 'BK-78927',
        description: 'Approved 100% full refund for guest due to typhoon flight cancellation.',
        oldValues: JSON.stringify({ paymentStatus: 'completed', status: 'confirmed' }),
        newValues: JSON.stringify({ paymentStatus: 'refunded', status: 'cancelled', refundAmount: 840 }),
        ipAddress: '14.162.180.25',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'success',
      },
    ],
  });

  // 7. Create Admin Settings
  await prisma.adminSettings.create({
    data: {
      platformName: 'StayEase Luxury Collection',
      platformDescription: 'Global Curated Five-Star Luxury Hotel Reservations & VIP Concierge',
      primaryColor: '#1e40af',
      secondaryColor: '#7c3aed',
      contactEmail: 'concierge@stayease.com',
      supportPhone: '+1 (800) 782-9327',
      timezone: 'UTC+07:00 (Indochina Time)',
      currency: 'USD',
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      sessionTimeout: 1440,
      enableEmailVerification: true,
      enableTwoFactor: false,
      maintenanceMode: false,
      smtpHost: 'smtp.mailtrap.io',
      smtpPort: 2525,
      smtpUser: 'stayease_demo_user',
    },
  });

  // 8. Create User Statistics for past 7 days
  for (let i = 6; i >= 0; i--) {
    const statDate = daysAgo(i);
    await prisma.userStatistics.create({
      data: {
        date: statDate,
        totalUsers: 1450 + (6 - i) * 12,
        newUsersToday: 8 + (i % 4) * 3,
        activeUsersToday: 280 + (i % 5) * 20,
        totalBookingsToday: 18 + (i % 3) * 6,
        totalRevenueToday: 5400 + (6 - i) * 850,
        averageBookingValue: 350 + (i % 2) * 45,
        cancellationRate: 3.5,
      },
    });
  }

  console.log('✅ Seed completed successfully! All tables populated.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
