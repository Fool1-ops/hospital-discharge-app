"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const user_1 = require("../models/user");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize database tables and seed data
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Initializing database...');
            // Read SQL file
            const sqlFilePath = path_1.default.join(__dirname, 'init.sql');
            const sqlScript = fs_1.default.readFileSync(sqlFilePath, 'utf8');
            // Execute SQL script
            yield database_1.default.query(sqlScript);
            console.log('Database tables created successfully');
            // Check if admin user exists
            const adminEmail = 'admin@hospital.com';
            const existingAdmin = yield user_1.UserModel.findByEmail(adminEmail);
            if (!existingAdmin) {
                // Create admin user
                yield user_1.UserModel.create({
                    name: 'Admin User',
                    email: adminEmail,
                    password: 'admin123', // This should be changed in production
                    role: 'admin',
                    hospital_id: 'HOSPITAL001'
                });
                console.log('Admin user created successfully');
            }
            console.log('Database initialization completed');
        }
        catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    });
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
exports.default = initializeDatabase;
