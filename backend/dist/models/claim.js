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
exports.ClaimModel = exports.ClaimStatus = void 0;
const database_1 = __importDefault(require("../config/database"));
var ClaimStatus;
(function (ClaimStatus) {
    ClaimStatus["DRAFT"] = "draft";
    ClaimStatus["SUBMITTED"] = "submitted";
    ClaimStatus["UNDER_REVIEW"] = "under_review";
    ClaimStatus["APPROVED"] = "approved";
    ClaimStatus["PAID"] = "paid";
    ClaimStatus["REJECTED"] = "rejected";
})(ClaimStatus || (exports.ClaimStatus = ClaimStatus = {}));
class ClaimModel {
    // Create a new claim
    static create(claimData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { patient_name, hospital_id, insurer, policy_number, admission_date, estimated_discharge_date, created_by } = claimData;
            const query = `
      INSERT INTO claims (
        patient_name,
        hospital_id,
        insurer,
        policy_number,
        admission_date,
        estimated_discharge_date,
        status,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
            const values = [
                patient_name,
                hospital_id,
                insurer,
                policy_number,
                admission_date,
                estimated_discharge_date,
                ClaimStatus.DRAFT,
                created_by
            ];
            const result = yield database_1.default.query(query, values);
            return result.rows[0];
        });
    }
    // Get claim by ID
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT * FROM claims WHERE id = $1';
            const result = yield database_1.default.query(query, [id]);
            return result.rows[0] || null;
        });
    }
    // Get all claims for a hospital
    static findByHospitalId(hospitalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT * FROM claims WHERE hospital_id = $1 ORDER BY created_at DESC';
            const result = yield database_1.default.query(query, [hospitalId]);
            return result.rows;
        });
    }
    // Update claim status
    static updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE claims
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
            const result = yield database_1.default.query(query, [status, id]);
            return result.rows[0] || null;
        });
    }
    // Get claims by status
    static findByStatus(hospitalId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT * FROM claims WHERE hospital_id = $1 AND status = $2 ORDER BY created_at DESC';
            const result = yield database_1.default.query(query, [hospitalId, status]);
            return result.rows;
        });
    }
    // Get claims in progress (not paid or rejected)
    static findInProgress(hospitalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT * FROM claims 
      WHERE hospital_id = $1 
      AND status NOT IN ($2, $3) 
      ORDER BY created_at DESC
    `;
            const result = yield database_1.default.query(query, [hospitalId, ClaimStatus.PAID, ClaimStatus.REJECTED]);
            return result.rows;
        });
    }
    // Get recently approved claims
    static findRecentlyApproved(hospitalId_1) {
        return __awaiter(this, arguments, void 0, function* (hospitalId, limit = 5) {
            const query = `
      SELECT * FROM claims 
      WHERE hospital_id = $1 AND status = $2 
      ORDER BY updated_at DESC 
      LIMIT $3
    `;
            const result = yield database_1.default.query(query, [hospitalId, ClaimStatus.APPROVED, limit]);
            return result.rows;
        });
    }
}
exports.ClaimModel = ClaimModel;
