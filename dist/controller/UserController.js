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
    static async updateEmailById(id, newEmail) {
        try {
            await prisma.$connect();
            const updatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    email: newEmail,
                },
            });
        }
        catch (error) { }
    }
    static async updateNameById(id, newName) {
        try {
            await prisma.$connect();
            const updatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    name: newName,
                },
            });
        }
        catch (error) { }
    }
    static async updatePasswordById(id, newPass) {
        try {
            await prisma.$connect();
            const hashedPassword = await this.hashPassword(newPass);
            const updatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    password: hashedPassword,
                },
            });
        }
        catch (error) { }
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
        let user;
        try {
            await prisma.$connect();
            const prefId = await this.getPreferenceByName(prefName.toLowerCase());
            await prisma.userPreferences.create({
                data: {
                    userId: userId,
                    preferenceId: prefId,
                },
            });
            user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    preferences: true,
                },
            });
            if (user) {
                const existingPreferencesIds = user.preferences.map((preference) => ({
                    id: preference.id,
                })); // Formata os IDs das preferências existentes no formato esperado
                const newPreferenceId = { id: prefId }; // Formata o novo ID da preferência no formato esperado
                const updatedPreferences = [...existingPreferencesIds, newPreferenceId]; // Combina os IDs existentes com o novo ID
                await prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        preferences: {
                            set: updatedPreferences, // Define os IDs das preferências atualizados
                        },
                    },
                    include: {
                        preferences: true,
                    },
                });
            }
            else {
                throw new Error("Usuário não encontrado");
            }
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
    static async removeUserPreference(userId, prefName) {
        let user;
        try {
            await prisma.$connect();
            const prefId = await this.getPreferenceByName(prefName.toLowerCase());
            const existingUserPreference = await prisma.userPreferences.findFirst({
                where: {
                    userId: userId,
                    preferenceId: prefId,
                },
            });
            if (existingUserPreference) {
                await prisma.userPreferences.delete({
                    where: {
                        id: existingUserPreference.id,
                    },
                });
                user = await prisma.user.findUnique({
                    where: { id: userId },
                    include: {
                        preferences: true,
                    },
                });
                if (user) {
                    const updatedPreferences = user.preferences
                        .filter((preference) => preference.id !== prefId)
                        .map((preference) => ({ id: preference.id }));
                    await prisma.user.update({
                        where: {
                            id: userId,
                        },
                        data: {
                            preferences: {
                                set: updatedPreferences,
                            },
                        },
                        include: {
                            preferences: true,
                        },
                    });
                }
                else {
                    throw new Error("Usuário não encontrado");
                }
            }
            else {
                throw new Error("A preferência não está associada a este usuário.");
            }
        }
        catch (error) {
            throw new Error(`Um erro inesperado ocorreu ao remover a preferência: ${error.message}`);
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
    static async fetchUserWithPrefsByEmailAndPassword(email, password) {
        try {
            await prisma.$connect();
            const User = await prisma.user.findFirst({
                where: {
                    email: email,
                },
                include: {
                    preferences: true,
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
    static async fetchPontosTuristicos(preferencesId) {
        try {
            const pontosTuristicos = await prisma.pontoTuristico.findMany({
                where: {
                    preferences: {
                        some: {
                            id: {
                                in: preferencesId,
                            },
                        },
                    },
                },
            });
            return pontosTuristicos;
        }
        catch (error) {
            console.error(error);
            throw new Error("Erro ao buscar preferencias");
        }
        finally {
            await prisma.$disconnect();
        }
    }
    static async fetchPrefsByEmail(email) {
        try {
            const userPreferences = await prisma.user
                .findUnique({
                where: { email },
            })
                .preferences();
            const preferencesIds = userPreferences?.map((pref) => pref.id);
            return preferencesIds;
        }
        catch (error) {
            console.error(error);
            throw new Error("Erro ao buscar preferencias");
        }
        finally {
            await prisma.$disconnect();
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map