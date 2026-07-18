export const mockUser = {
  id: 'test-user-id',
  uid: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  photoURL: 'https://example.com/photo.png',
  trustScore: 100,
  verified: true,
  role: 'user',
};

export const mockListings = [
  {
    id: 'listing-1',
    title: 'Test MacBook Pro M2',
    description: 'Barely used MacBook Pro M2 with 16GB RAM and 512GB SSD.',
    price: 1200,
    categoryId: 'electronics',
    condition: 'like-new',
    status: 'active',
    sellerId: 'test-user-id',
    city: 'San Francisco',
    images: ['https://example.com/macbook.jpg'],
    createdAt: new Date().toISOString(),
    views: 15,
  },
  {
    id: 'listing-2',
    title: 'IKEA Desk',
    description: 'Sturdy office desk, minor scratches.',
    price: 50,
    categoryId: 'furniture',
    condition: 'good',
    status: 'active',
    sellerId: 'another-user-id',
    city: 'San Francisco',
    images: ['https://example.com/desk.jpg'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    views: 120,
  }
];

export const mockBuyRequests = [
  {
    id: 'request-1',
    title: 'Looking for an iPad Pro',
    description: 'Need an iPad Pro for drawing. Willing to pay up to $600.',
    categoryId: 'electronics',
    budget: 600,
    status: 'active',
    userId: 'another-user-id',
    city: 'San Francisco',
    createdAt: new Date().toISOString(),
    responseCount: 2,
  }
];
