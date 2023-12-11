"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreferencesController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PreferencesController {
    static async fetchPrefsList() {
        try {
            await prisma.$connect();
            const prefs = await prisma.preferences.findMany();
            return prefs;
        }
        catch (error) {
            throw new Error("Um erro inesperado inesperado ocorreu ao tentar buscar as preferências");
        }
        finally {
            await prisma.$disconnect();
        }
    }
}
exports.PreferencesController = PreferencesController;
//# sourceMappingURL=PreferencesController.js.map