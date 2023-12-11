"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const UserController_1 = require("../controller/UserController");
const UserRecommendRoutes = express_1.default.Router();
UserRecommendRoutes.post("/fetch-feed", AuthMiddleware_1.verifyToken, async (req, res) => {
    try {
        const { isTokenExists, name, email, password } = req.body;
        const user = await UserController_1.UserController.fetchUserByEmailAndPassword(email, password);
        if (!user) {
            return res.status(401).json({
                message: "Usuário não encontrado no banco de dados",
            });
        }
        const userPreferences = await UserController_1.UserController.fetchPrefsByEmail(email);
        if (!userPreferences) {
            return res.status(401).json({
                message: "Usuário não tem preferências",
            });
        }
        const pontosTuristicos = await UserController_1.UserController.fetchPontosTuristicos(userPreferences);
        if (pontosTuristicos) {
            res.status(200).json({
                pontosTuristicos,
            });
        }
        else {
            res.status(401).json({
                message: "Não encontramos locais para recomendar baseado nas suas preferências",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: "Um erro inesperado ocorreu ao tentar buscar recomendados",
        });
    }
});
exports.default = UserRecommendRoutes;
//# sourceMappingURL=UserRecommend.js.map