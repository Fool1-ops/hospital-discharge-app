import pool from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  hospital_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: string;
  hospital_id: string;
}

export class UserModel {
  // Create a new user
  static async create(userData: UserInput): Promise<User> {
    const { name, email, password, role, hospital_id } = userData;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (name, email, password, role, hospital_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [name, email, hashedPassword, role, hospital_id];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    return result.rows[0] || null;
  }
  
  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }
  
  // Validate password
  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}