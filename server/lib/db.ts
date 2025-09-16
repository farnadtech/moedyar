import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Temporarily disable Prisma for development
let db: any;

try {
  db = global.__prisma || new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    global.__prisma = db;
  }
} catch (error) {
  console.warn('Prisma client not available:', error);
  // Create a mock db object for development
  db = {
    user: { findUnique: () => null, create: () => null },
    product: { findMany: () => [], create: () => null },
    // Add other models as needed
  };
}

export { db };
