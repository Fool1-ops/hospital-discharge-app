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
exports.DocumentModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class DocumentModel {
    // Create a new document
    static create(documentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { claim_id, document_type, file_name, file_path, file_size, mime_type, uploaded_by } = documentData;
            const query = `
      INSERT INTO documents (
        claim_id,
        document_type,
        file_name,
        file_path,
        file_size,
        mime_type,
        uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
            const values = [
                claim_id,
                document_type,
                file_name,
                file_path,
                file_size,
                mime_type,
                uploaded_by
            ];
            const result = yield database_1.default.query(query, values);
            return result.rows[0];
        });
    }
    // Get documents by claim ID
    static findByClaimId(claimId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT * FROM documents WHERE claim_id = $1 ORDER BY created_at DESC';
            const result = yield database_1.default.query(query, [claimId]);
            return result.rows;
        });
    }
    // Get document by ID
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT * FROM documents WHERE id = $1';
            const result = yield database_1.default.query(query, [id]);
            return result.rows[0] || null;
        });
    }
    // Delete document
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'DELETE FROM documents WHERE id = $1 RETURNING id';
            const result = yield database_1.default.query(query, [id]);
            return (result.rowCount || 0) > 0;
        });
    }
    // Check if document type exists for a claim
    static documentTypeExists(claimId, documentType) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = 'SELECT id FROM documents WHERE claim_id = $1 AND document_type = $2 LIMIT 1';
            const result = yield database_1.default.query(query, [claimId, documentType]);
            return (result.rowCount || 0) > 0;
        });
    }
}
exports.DocumentModel = DocumentModel;
