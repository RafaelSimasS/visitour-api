"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const utils_1 = require("../utils/utils");
const prisma = new client_1.PrismaClient();
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
class UserController {
    static async createValidatedUser(userData) {
        try {
            const { name, email, password } = createUserSchema.parse(userData);
            const hashedPassword = await this.hashPassword(password);
            const User = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });
            return User;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new Error(`Este email já está cadastrado no sistema.`);
                }
            }
            throw new Error(`Um erro inesperado ocorreu ao tentar criar a conta`);
        }
        finally {
            await prisma.$disconnect();
        }
    }
    static async hashPassword(plainPassword) {
        const saltRounds = 10;
        try {
            const hash = await bcrypt_1.default.hash(plainPassword, saltRounds);
            return hash;
        }
        catch (e) {
            console.error("Erro ao gerar hash da senha:", e);
            throw new Error("Erro ao hashear senha");
        }
    }
    static async addUserPreferences(userId, prefName) {
        try {
            const prefId = await this.getPreferenceByName(prefName.toLowerCase());
            await prisma.userPreferences.create({
                data: {
                    userId: userId,
                    preferenceId: prefId,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new Error("A preferência já está adicionada.");
                }
            }
            throw new Error("Um erro inesperado ocorreu ao adicionar a preferência.");
        }
        finally {
            await prisma.$disconnect();
        }
    }
    static async getPreferenceByName(name) {
        try {
            const preference = await prisma.preferences.findUnique({
                where: {
                    name: name,
                },
            });
            if (preference?.id !== undefined)
                return preference?.id;
            else
                throw new Error("A preferência não existe");
        }
        catch (error) {
            throw new Error("Um erro inesperado ocorreu ao buscar a preferência");
        }
        finally {
            await prisma.$disconnect();
        }
    }
    static async getUserPreferences(userId) {
        try {
            const userPreferencesAssociation = await prisma.userPreferences.findMany({
                where: {
                    userId: userId,
                },
                select: {
                    preference: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            const userPreferences = userPreferencesAssociation.map((association) => association.preference.name);
            return userPreferences;
        }
        catch (error) {
            throw new Error("Um erro inesperado ocorreu ao tentar obter as preferências");
        }
        finally {
            await prisma.$disconnect();
        }
    }
    static async fetchUserByEmailAndPassword(email, password) {
        try {
            const User = await prisma.user.findFirst({
                where: {
                    email: email,
                },
            });
            if (!User)
                return null;
            return (await (0, utils_1.comparePasswords)(password, User.password)) ? User : null;
        }
        catch (e) {
            console.error(e);
            throw new Error("Um erro inesperado ocorreu ao tentar fazer login");
        }
        finally {
            prisma.$disconnect();
        }
    }
    static async getAllUsers(limit) {
        try {
            // await prisma.$connect();
            if (limit === null) {
                const allUsers = await prisma.user.findMany();
                return allUsers;
            }
            else {
                const allUsers = await prisma.user.findMany({
                    take: limit,
                });
                return allUsers;
            }
        }
        catch (e) {
            console.error("Erro ao buscar os usuários:", e);
            throw new Error("Um erro inesperado ocorreu ao listar os usuários");
        }
        finally {
            await prisma.$disconnect();
        }
    }
    static async deleteUserByNameAndEmail(email, name) {
        try {
            const deletedUser = await prisma.user.delete({
                where: {
                    email: email,
                    name: name,
                },
            });
            return deletedUser;
        }
        catch (e) {
            throw new Error(`Erro ao deletar o usuário: ${e?.message}`);
        }
        finally {
            await prisma.$disconnect();
        }
    }
    static async updateLoginToken(userId, token) {
        try {
            const user = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    loginToken: token,
                },
            });
            return user !== null ? true : false;
        }
        catch (e) {
            throw new Error("Ocorreu um erro inesperado ao atualizar o token de login");
        }
        finally {
            await prisma.$disconnect();
        }
    }
    static async fetchUserByLoginToken(token) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    loginToken: token,
                },
            });
            return user;
        }
        catch (error) {
            throw new Error("Ocorreu um erro inesperado ao buscar usuário.");
        }
        finally {
            await prisma.$disconnect();
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map