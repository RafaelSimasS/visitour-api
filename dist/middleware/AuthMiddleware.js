"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        req.body.isTokenExists = false;
        next();
    }
    else {
        jsonwebtoken_1.default.verify(token, "login_token", (err, decoded) => {
            if (err) {
                return res
                    .status(401)
                    .json({ message: "Token inválido", type: "token_invalid" });
            }
            req.body.userId = decoded.userId;
            req.body.token = token;
            req.body.isTokenExists = true;
            next();
        });
    }
}
exports.verifyToken = verifyToken;
function generateToken(userId) {
    const token = jsonwebtoken_1.default.sign({ userId }, `login_token`, { expiresIn: "1h" });
    return token;
}
exports.generateToken = generateToken;
//# sourceMappingURL=AuthMiddleware.js.map