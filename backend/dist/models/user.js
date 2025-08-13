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
exports.UserModel = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserModel {
    // Create a new user
    static create(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, role, hospital_id } = userData;
            // Hash password
            const saltRounds = 10;
            const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
            const query = `
      INSERT INTO users (name, email, password, role, hospital_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
            const values = [name, email, hashedPassword, role, hospital_id];
            const result = yield database_1.default.query(query, values);
            return result.rows[0];
        });
    }
    // Find user by email
    static findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = yield database_1.default.query(query, [email]);
            return result.rows[0] || null;
        });
    }
    // Find user by ID
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = yield database_1.default.query(query, [id]);
            return result.rows[0] || null;
        });
    }
    // Validate password
    static validatePassword(plainPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.compare(plainPassword, hashedPassword);
        });
    }
}
exports.UserModel = UserModel;
