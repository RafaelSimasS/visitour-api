"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function comparePasswords(plainPassword, hashedPassword) {
    try {
        const match = await bcrypt_1.default.compare(plainPassword, hashedPassword);
        return match;
    }
    catch (e) {
        console.error(e);
        throw new Error("Erro ao comparar as senhas");
    }
}
exports.comparePasswords = comparePasswords;
//# sourceMappingURL=utils.js.map