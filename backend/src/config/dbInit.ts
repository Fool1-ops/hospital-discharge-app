import pool from './database';
import fs from 'fs';
import path from 'path';
import { UserModel } from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

// Initialize database tables and seed data
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'init.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute SQL script
    await pool.query(sqlScript);
    console.log('Database tables created successfully');
    
    // Check if admin user exists
    const adminEmail = 'admin@hospital.com';
    const existingAdmin = await UserModel.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      // Create admin user
      await UserModel.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123', // This should be changed in production
        role: 'admin',
        hospital_id: 'HOSPITAL001'
      });
      console.log('Admin user created successfully');
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database setup completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase;