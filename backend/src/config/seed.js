require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const { Testimonial, Gallery } = require('../models/index');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');
};

const seedUsers = async () => {
  await User.deleteMany({});
  const users = [
    {
      firstName: 'Super', lastName: 'Admin',
      email: 'admin@luxeevents.com',
      password: 'Admin@123',
      role: 'superadmin', isEmailVerified: true, isActive: true,
      phone: '+91 9876543210'
    },
    {
      firstName: 'Priya', lastName: 'Sharma',
      email: 'priya@example.com',
      password: 'User@123',
      role: 'user', isEmailVerified: true, isActive: true,
      phone: '+91 9876543211'
    },
    {
      firstName: 'Rahul', lastName: 'Mehta',
      email: 'rahul@example.com',
      password: 'User@123',
      role: 'user', isEmailVerified: true, isActive: true,
      phone: '+91 9876543212'
    }
  ];
  const created = await User.create(users);
  console.log(`✅ Seeded ${created.length} users`);
  return created;
};

const seedEvents = async () => {
  await Event.deleteMany({});
  const events = [
    {
      title: 'Royal Wedding Experience',
      slug: 'royal-wedding-experience',
      category: 'wedding',
      description: 'Transform your wedding day into an unforgettable royal affair. Our Royal Wedding Experience combines timeless elegance with modern luxury, creating memories that will last a lifetime. From grand entrance arches to stunning floral arrangements, every detail is meticulously crafted.',
      shortDescription: 'A regal wedding experience with unmatched elegance and personalized service.',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600',
      ],
      features: ['Dedicated Wedding Coordinator', 'Floral Design', 'Lighting Setup', 'Stage & Mandap', 'Photography Coordination', 'Valet Parking'],
      packages: [
        { name: 'Silver', price: 250000, priceType: 'flat', description: 'Essential wedding package', includes: ['Basic decoration', 'Sound system', 'Event coordinator'], isPopular: false },
        { name: 'Gold', price: 500000, priceType: 'flat', description: 'Our most popular choice', includes: ['Premium decoration', 'Photo + Video', 'Catering coordination', 'Valet parking'], isPopular: true },
        { name: 'Diamond', price: 1200000, priceType: 'flat', description: 'The ultimate luxury wedding', includes: ['Bespoke decoration', 'International DJ', 'Celebrity chef options', 'Helicopter entry', '5-star hospitality'], isPopular: false }
      ],
      basePrice: 250000,
      priceRange: { min: 250000, max: 2000000 },
      duration: '2 Days',
      minGuests: 50, maxGuests: 2000,
      tags: ['wedding', 'luxury', 'traditional', 'royal'],
      isActive: true, isFeatured: true, rating: 4.9, reviewCount: 142, bookingCount: 89
    },
    {
      title: 'Corporate Excellence Summit',
      slug: 'corporate-excellence-summit',
      category: 'corporate',
      description: 'Elevate your corporate events with our Executive Summit experience. Perfect for product launches, annual conferences, team milestones, and client entertainment. We handle every detail so you can focus on your message.',
      shortDescription: 'World-class corporate event management for impactful business gatherings.',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      gallery: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600'],
      features: ['AV & Tech Setup', 'Stage Design', 'Branded Stationery', 'Catering', 'Live Streaming', 'Awards Ceremony'],
      packages: [
        { name: 'Basic', price: 150000, priceType: 'flat', description: 'For teams up to 100', includes: ['Venue decoration', 'AV setup', 'Catering coordination'], isPopular: false },
        { name: 'Professional', price: 350000, priceType: 'flat', description: 'Full-scale corporate event', includes: ['Premium AV', 'Custom branding', 'Live streaming', 'Press coordination'], isPopular: true },
        { name: 'Enterprise', price: 800000, priceType: 'flat', description: 'Multi-day enterprise summit', includes: ['All Professional features', 'International keynote support', 'VIP hospitality', 'Gala dinner'], isPopular: false }
      ],
      basePrice: 150000,
      priceRange: { min: 150000, max: 1500000 },
      duration: '1-3 Days', minGuests: 20, maxGuests: 1000,
      tags: ['corporate', 'conference', 'seminar', 'launch'],
      isActive: true, isFeatured: true, rating: 4.8, reviewCount: 98, bookingCount: 65
    },
    {
      title: 'Grand Birthday Soiree',
      slug: 'grand-birthday-soiree',
      category: 'birthday',
      description: 'Make your milestone birthday unforgettable with a Luxe Events soiree. From intimate gatherings to extravagant parties, we create personalized birthday celebrations that reflect your style and personality.',
      shortDescription: 'Personalized birthday celebrations designed around your unique style.',
      coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      gallery: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
      features: ['Custom Theme Design', 'Birthday Cake', 'DJ & Entertainment', 'Photobooth', 'Return Gifts', 'Surprise Elements'],
      packages: [
        { name: 'Intimate', price: 75000, priceType: 'flat', description: 'For up to 50 guests', includes: ['Themed decoration', 'Custom cake', 'DJ music'], isPopular: false },
        { name: 'Grand', price: 200000, priceType: 'flat', description: 'For 50-200 guests', includes: ['Premium theme', 'Multi-tier cake', 'DJ + Live music', 'Photobooth'], isPopular: true },
        { name: 'Extravaganza', price: 500000, priceType: 'flat', description: 'Unlimited luxury', includes: ['Designer theme', 'Celebrity chef', 'Live band', 'Fireworks', 'VIP experience'], isPopular: false }
      ],
      basePrice: 75000,
      priceRange: { min: 75000, max: 800000 },
      duration: '1 Day', minGuests: 10, maxGuests: 500,
      tags: ['birthday', 'party', 'celebration', 'milestone'],
      isActive: true, isFeatured: true, rating: 4.7, reviewCount: 201, bookingCount: 134
    },
    {
      title: 'Destination Wedding Odyssey',
      slug: 'destination-wedding-odyssey',
      category: 'destination-wedding',
      description: 'Say "I do" against the backdrop of your dreams. Goa beaches, Rajasthan palaces, Kerala backwaters, or international destinations — we orchestrate picture-perfect destination weddings that leave your guests breathless.',
      shortDescription: 'Dream destination weddings orchestrated across India and beyond.',
      coverImage: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800',
      gallery: ['https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600'],
      features: ['Destination Scouting', 'Guest Travel Coordination', 'Multi-day Events', 'Local Vendor Network', 'Honeymoon Planning', 'Full-service Management'],
      packages: [
        { name: 'Getaway', price: 800000, priceType: 'flat', description: 'Intimate destination wedding (up to 50)', includes: ['Venue + décor', '3-day event management', 'Guest coordination'], isPopular: false },
        { name: 'Odyssey', price: 2000000, priceType: 'flat', description: 'Grand destination wedding (up to 200)', includes: ['Premium venue', '5-day event', 'Guest travel', 'All ceremonies'], isPopular: true },
        { name: 'Ultra', price: 5000000, priceType: 'flat', description: 'International or palace wedding', includes: ['Unlimited guests', 'International venues', 'Celebrity management', 'Full media coverage'], isPopular: false }
      ],
      basePrice: 800000,
      priceRange: { min: 800000, max: 10000000 },
      duration: '3-7 Days', minGuests: 20, maxGuests: 500,
      tags: ['destination', 'wedding', 'goa', 'rajasthan', 'palace'],
      isActive: true, isFeatured: true, rating: 4.95, reviewCount: 67, bookingCount: 43
    },
    {
      title: 'Product Launch Showcase',
      slug: 'product-launch-showcase',
      category: 'product-launch',
      description: 'Launch your product with the impact it deserves. Our Product Launch Showcase combines dramatic staging, expert AV, and media management to create moments that define your brand.',
      shortDescription: 'High-impact product launches that command attention and define your brand.',
      coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
      gallery: [],
      features: ['LED Wall & AV', 'Product Unveiling Mechanics', 'Media Invitation', 'Live Streaming', 'Demo Zones', 'Post-event Analytics'],
      packages: [
        { name: 'Startup', price: 100000, priceType: 'flat', description: 'Compact launch for emerging brands', includes: ['Stage design', 'AV setup', 'Basic media kit'], isPopular: false },
        { name: 'Impact', price: 300000, priceType: 'flat', description: 'Full media launch event', includes: ['Premium staging', 'Press coordination', 'Live streaming', 'Social wall'], isPopular: true },
        { name: 'Signature', price: 700000, priceType: 'flat', description: 'Celebrity-attended launch', includes: ['All Impact features', 'Celebrity host', 'Influencer invitations', 'National media coverage'], isPopular: false }
      ],
      basePrice: 100000,
      priceRange: { min: 100000, max: 1000000 },
      duration: '1 Day', minGuests: 50, maxGuests: 800,
      tags: ['product-launch', 'corporate', 'brand', 'media'],
      isActive: true, isFeatured: false, rating: 4.8, reviewCount: 44, bookingCount: 28
    },
    {
      title: 'Private Celebration Affair',
      slug: 'private-celebration-affair',
      category: 'private-celebration',
      description: 'For those who seek exclusivity above all else. Our Private Celebration Affair is tailored to the finest tastes, ensuring your intimate gathering is a masterpiece of luxury and personalisation.',
      shortDescription: 'Exclusive private celebrations crafted for the most discerning tastes.',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      gallery: [],
      features: ['Exclusive Venue Access', 'Personal Butler Service', 'Chef\'s Table', 'Private Bar', 'Security', 'Surprise Entertainment'],
      packages: [
        { name: 'Exclusive', price: 200000, priceType: 'flat', description: 'Private affair for up to 30', includes: ['Exclusive venue', 'Personal service', 'Curated menu'], isPopular: true },
        { name: 'Ultra-Private', price: 600000, priceType: 'flat', description: 'The pinnacle of privacy and luxury', includes: ['All Exclusive features', 'Celebrity entertainment', 'Live coverage', '5-star catering'], isPopular: false }
      ],
      basePrice: 200000,
      priceRange: { min: 200000, max: 1000000 },
      duration: '1 Day', minGuests: 10, maxGuests: 100,
      tags: ['private', 'exclusive', 'luxury', 'intimate'],
      isActive: true, isFeatured: false, rating: 4.9, reviewCount: 35, bookingCount: 22
    }
  ];
  const created = await Event.create(events);
  console.log(`✅ Seeded ${created.length} events`);
  return created;
};

const seedVenues = async () => {
  await Venue.deleteMany({});
  const venues = [
    {
      name: 'The Grand Maharaja Palace',
      slug: 'grand-maharaja-palace',
      description: 'A majestic heritage palace transformed into a premier wedding and event venue. With sprawling lawns, ornate ballrooms, and regal architecture, the Grand Maharaja Palace offers a setting fit for royalty.',
      shortDescription: 'Regal heritage palace with ornate ballrooms and sprawling lawns.',
      type: 'palace',
      location: { address: '1, Palace Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', country: 'India', coordinates: { lat: 26.9124, lng: 75.7873 } },
      coverImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      gallery: ['https://images.unsplash.com/photo-1455587734955-081b22074882?w=600'],
      capacity: { min: 100, max: 2000 },
      pricing: { basePrice: 350000, pricePerHour: 75000, weekendSurcharge: 20, currency: 'INR' },
      amenities: ['Air Conditioning', 'Swimming Pool', 'Parking (500 cars)', 'Bridal Suite', 'Heritage Rooms', 'In-house Catering', 'Valet Service', 'WiFi', 'Power Backup'],
      rating: 4.9, reviewCount: 87, isActive: true, isFeatured: true,
      tags: ['palace', 'heritage', 'wedding', 'jaipur', 'luxury']
    },
    {
      name: 'Oceanview Beach Resort',
      slug: 'oceanview-beach-resort',
      description: 'A stunning beachfront resort offering the ultimate backdrop for destination weddings and celebrations. With the Arabian Sea as your canvas, every event becomes a masterpiece.',
      shortDescription: 'Beachfront luxury resort perfect for destination weddings.',
      type: 'beach',
      location: { address: 'Candolim Beach', city: 'Goa', state: 'Goa', pincode: '403515', country: 'India', coordinates: { lat: 15.5149, lng: 73.7654 } },
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      gallery: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'],
      capacity: { min: 50, max: 800 },
      pricing: { basePrice: 500000, pricePerHour: 100000, weekendSurcharge: 30, currency: 'INR' },
      amenities: ['Private Beach', 'Infinity Pool', 'Beachfront Deck', 'Spa', 'Multiple Restaurants', 'Helicopter Pad', 'Water Sports', 'Event Beach Area'],
      rating: 4.8, reviewCount: 64, isActive: true, isFeatured: true,
      tags: ['beach', 'goa', 'destination', 'resort', 'beachfront']
    },
    {
      name: 'Sky Loft Convention Center',
      slug: 'sky-loft-convention-center',
      description: 'Mumbai\'s premier rooftop convention center with breathtaking skyline views. Ideal for corporate events, product launches, and high-end social gatherings with state-of-the-art technology.',
      shortDescription: 'Premium rooftop convention center with Mumbai skyline views.',
      type: 'convention-center',
      location: { address: 'BKC, Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', country: 'India', coordinates: { lat: 19.0645, lng: 72.8679 } },
      coverImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      gallery: [],
      capacity: { min: 50, max: 1500 },
      pricing: { basePrice: 250000, pricePerHour: 50000, weekendSurcharge: 15, currency: 'INR' },
      amenities: ['LED Wall (30ft)', 'Fiber WiFi', 'Broadcast Studio', 'VIP Green Room', '400-car Parking', 'Rooftop Garden', 'Catering Kitchen'],
      rating: 4.7, reviewCount: 112, isActive: true, isFeatured: true,
      tags: ['convention', 'rooftop', 'corporate', 'mumbai', 'skyline']
    },
    {
      name: 'The Green Estate Farmhouse',
      slug: 'green-estate-farmhouse',
      description: 'A sprawling 10-acre organic farmhouse on the Delhi outskirts, offering a serene escape with lush gardens, multiple event spaces, and a rustic-luxe aesthetic that makes for stunning celebrations.',
      shortDescription: 'Sprawling farmhouse with lush gardens and rustic-luxe ambiance near Delhi.',
      type: 'farmhouse',
      location: { address: 'Chattarpur Enclave', city: 'New Delhi', state: 'Delhi', pincode: '110074', country: 'India', coordinates: { lat: 28.4968, lng: 77.1628 } },
      coverImage: 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800',
      gallery: [],
      capacity: { min: 50, max: 1000 },
      pricing: { basePrice: 180000, pricePerHour: 35000, weekendSurcharge: 25, currency: 'INR' },
      amenities: ['10-acre Grounds', 'Multiple Lawns', 'Indoor Hall', 'Organic Kitchen', 'Accommodation (20 rooms)', 'Pool', 'Ample Parking'],
      rating: 4.6, reviewCount: 89, isActive: true, isFeatured: false,
      tags: ['farmhouse', 'delhi', 'garden', 'outdoor', 'rustic']
    }
  ];
  const created = await Venue.create(venues);
  console.log(`✅ Seeded ${created.length} venues`);
  return created;
};

const seedTestimonials = async () => {
  await Testimonial.deleteMany({});
  const testimonials = [
    { name: 'Ananya & Rohan Kapoor', role: 'Wedding Couple', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100', content: 'Our royal wedding was everything we dreamed of and more. Luxe Events transformed the Grand Maharaja Palace into pure magic. Every guest couldn\'t stop talking about it!', rating: 5, eventType: 'wedding', isApproved: true, isFeatured: true },
    { name: 'Vikram Malhotra', role: 'CEO, TechVision India', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', content: 'Our annual summit with 800 attendees was flawlessly executed. The production quality rivaled international standards. Luxe Events is now our go-to corporate event partner.', rating: 5, eventType: 'corporate', isApproved: true, isFeatured: true },
    { name: 'Meera Singhania', role: 'Celebrating 50th Birthday', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', content: 'My 50th birthday gala was absolutely breathtaking. The attention to detail, the decoration, the food — pure perfection. Luxe Events made me feel like a queen!', rating: 5, eventType: 'birthday', isApproved: true, isFeatured: true },
    { name: 'Arjun & Deepika Nair', role: 'Destination Wedding Goa', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', content: 'Getting married on the Goa beach at sunset while our 150 guests watched was the most magical experience of our lives. Luxe Events made the impossible possible!', rating: 5, eventType: 'destination-wedding', isApproved: true, isFeatured: true },
    { name: 'Sunita Reddy', role: 'Marketing Director, FoodieApp', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', content: 'The product launch exceeded every KPI. Media coverage was extraordinary, influencer attendance was stellar. Luxe Events delivered a launch our brand will be remembered by.', rating: 5, eventType: 'product-launch', isApproved: true, isFeatured: true },
    { name: 'Rajesh Khanna', role: 'Private Client', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', content: 'I\'ve attended events around the world. My private anniversary dinner arranged by Luxe Events stands out as the most intimate and perfectly curated evening of my life.', rating: 5, eventType: 'private-celebration', isApproved: true, isFeatured: true },
  ];
  const created = await Testimonial.create(testimonials);
  console.log(`✅ Seeded ${created.length} testimonials`);
};

const seedGallery = async () => {
  await Gallery.deleteMany({});
  const items = [
    { title: 'Royal Wedding Ceremony', type: 'image', category: 'wedding', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', isFeatured: true, isActive: true, order: 1 },
    { title: 'Garden Wedding Décor', type: 'image', category: 'wedding', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', isActive: true, order: 2 },
    { title: 'Corporate Summit', type: 'image', category: 'corporate', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', isFeatured: true, isActive: true, order: 3 },
    { title: 'Birthday Celebration', type: 'image', category: 'birthday', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800', isActive: true, order: 4 },
    { title: 'Beach Wedding Goa', type: 'image', category: 'venue', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', isFeatured: true, isActive: true, order: 5 },
    { title: 'Floral Decoration', type: 'image', category: 'decoration', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', isActive: true, order: 6 },
    { title: 'Luxury Catering Spread', type: 'image', category: 'food', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', isActive: true, order: 7 },
    { title: 'Palace Venue', type: 'image', category: 'venue', url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', isFeatured: true, isActive: true, order: 8 },
    { title: 'Wedding Stage', type: 'image', category: 'decoration', url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800', isActive: true, order: 9 },
    { title: 'Product Launch Stage', type: 'image', category: 'corporate', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', isActive: true, order: 10 },
    { title: 'Private Dinner', type: 'image', category: 'other', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', isActive: true, order: 11 },
    { title: 'Couple Portrait', type: 'image', category: 'wedding', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800', isActive: true, order: 12 },
  ];
  const created = await Gallery.create(items);
  console.log(`✅ Seeded ${created.length} gallery items`);
};

const main = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');
    await seedUsers();
    await seedEvents();
    await seedVenues();
    await seedTestimonials();
    await seedGallery();
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Admin credentials:');
    console.log('  Email:    admin@luxeevents.com');
    console.log('  Password: Admin@123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

main();
