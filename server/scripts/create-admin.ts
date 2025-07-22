import { db } from '../lib/db';
import { hashPassword } from '../lib/auth';

async function createAdminAccount() {
  try {
    const adminEmail = 'farnadadmin@gmail.com';
    const adminPassword = 'farnad2479';
    const adminName = 'مدیر سیستم';

    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(adminPassword);

    // Create admin user
    const admin = await db.user.create({
      data: {
        fullName: adminName,
        email: adminEmail,
        password: hashedPassword,
        accountType: 'PERSONAL',
        subscriptionType: 'PREMIUM', // Give admin premium access
        isEmailVerified: true
      }
    });

    console.log('✅ Admin account created successfully');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 User ID:', admin.id);

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    await db.$disconnect();
  }
}

createAdminAccount();
