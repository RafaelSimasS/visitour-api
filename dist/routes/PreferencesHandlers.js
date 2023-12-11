"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controller/UserController");
const PreferencesController_1 = require("../controller/PreferencesController");
const PreferencesRouter = express_1.default.Router();
PreferencesRouter.post("/user-prefs", async (request, response) => {
    const { userId, prefNames } = request.body;
    try {
        const errors = [];
        for (const prefName of prefNames) {
            try {
                await UserController_1.UserController.addUserPreferences(userId, prefName.toLowerCase());
            }
            catch (error) {
                errors.push({ prefName, error: error.message });
            }
        }
        if (errors.length > 0) {
            response.status(500).json({
                erro: "Erro ao adicionar preferências",
                errors,
                type: "db_process",
            });
        }
        else {
            response.status(200).json({
                message: "Preferências adicionadas com sucesso",
            });
        }
    }
    catch (error) {
        response.status(500).json({
            erro: "Erro ao processar preferências",
            message: error.message,
            type: "db_process",
        });
    }
});
PreferencesRouter.get("/user-prefs", async (request, response) => {
    const { userId } = request.body;
    try {
        const preferences = await UserController_1.UserController.getUserPreferences(userId);
        response.status(200).json({
            preferences,
        });
    }
    catch (error) {
        response.status(500).json({
            erro: "Erro ao obter as preferências",
            message: error.message,
            type: "db_process",
        });
    }
});
PreferencesRouter.get("/fetch-prefs-list", async (request, response) => {
    try {
        const prefs = await PreferencesController_1.PreferencesController.fetchPrefsList();
        response.status(200).json({
            prefs,
        });
    }
    catch (error) {
        response.status(500).json({
            message: error.message,
        });
    }
});
exports.default = PreferencesRouter;
//# sourceMappingURL=PreferencesHandlers.js.map