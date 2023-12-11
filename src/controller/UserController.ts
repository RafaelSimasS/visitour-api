import bcrypt from "bcrypt";
import { z } from "zod";
import { Prisma, PrismaClient, User } from "@prisma/client";
import { comparePasswords } from "../utils/utils";

interface userData {
  name: string;
  email: string;
  password: string;
}
const prisma = new PrismaClient();
const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export class UserController {
  static async createValidatedUser(userData: userData): Promise<User> {
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
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error(`Este email já está cadastrado no sistema.`);
        }
      }

      throw new Error(`Um erro inesperado ocorreu ao tentar criar a conta`);
    } finally {
      await prisma.$disconnect();
    }
  }

  static async updateEmailById(id: number, newEmail: string) {
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
    } catch (error) {}
  }
  static async updateNameById(id: number, newName: string) {
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
    } catch (error) {}
  }
  static async updatePasswordById(id: number, newPass: string) {
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
    } catch (error) {}
  }
  private static async hashPassword(plainPassword: string): Promise<string> {
    const saltRounds = 10;
    try {
      const hash = await bcrypt.hash(plainPassword, saltRounds);
      return hash;
    } catch (e) {
      console.error("Erro ao gerar hash da senha:", e);
      throw new Error("Erro ao hashear senha");
    }
  }

  static async addUserPreferences(
    userId: number,
    prefName: string
  ): Promise<void> {
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
      } else {
        throw new Error("Usuário não encontrado");
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("A preferência já está adicionada.");
        }
      }
      throw new Error("Um erro inesperado ocorreu ao adicionar a preferência.");
    } finally {
      await prisma.$disconnect();
    }
  }
  static async removeUserPreference(userId: number, prefName: string) {
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
        } else {
          throw new Error("Usuário não encontrado");
        }
      } else {
        throw new Error("A preferência não está associada a este usuário.");
      }
    } catch (error: any) {
      throw new Error(
        `Um erro inesperado ocorreu ao remover a preferência: ${error.message}`
      );
    } finally {
      await prisma.$disconnect();
    }
  }
  private static async getPreferenceByName(name: string): Promise<number> {
    try {
      const preference = await prisma.preferences.findUnique({
        where: {
          name: name,
        },
      });
      if (preference?.id !== undefined) return preference?.id;
      else throw new Error("A preferência não existe");
    } catch (error) {
      throw new Error("Um erro inesperado ocorreu ao buscar a preferência");
    } finally {
      await prisma.$disconnect();
    }
  }
  static async getUserPreferences(userId: number): Promise<string[]> {
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
      const userPreferences = userPreferencesAssociation.map(
        (association) => association.preference.name
      );
      return userPreferences;
    } catch (error) {
      throw new Error(
        "Um erro inesperado ocorreu ao tentar obter as preferências"
      );
    } finally {
      await prisma.$disconnect();
    }
  }

  static async fetchUserByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const User = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      if (!User) return null;
      return (await comparePasswords(password, User.password)) ? User : null;
    } catch (e) {
      console.error(e);

      throw new Error("Um erro inesperado ocorreu ao tentar fazer login");
    } finally {
      prisma.$disconnect();
    }
  }

  static async fetchUserWithPrefsByEmailAndPassword(
    email: string,
    password: string
  ) {
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

      if (!User) return null;
      return (await comparePasswords(password, User.password)) ? User : null;
    } catch (e) {
      console.error(e);

      throw new Error("Um erro inesperado ocorreu ao tentar fazer login");
    } finally {
      prisma.$disconnect();
    }
  }
  static async getAllUsers(limit: number | null) {
    try {
      // await prisma.$connect();
      if (limit === null) {
        const allUsers = await prisma.user.findMany();
        return allUsers;
      } else {
        const allUsers = await prisma.user.findMany({
          take: limit,
        });
        return allUsers;
      }
    } catch (e) {
      console.error("Erro ao buscar os usuários:", e);
      throw new Error("Um erro inesperado ocorreu ao listar os usuários");
    } finally {
      await prisma.$disconnect();
    }
  }

  static async deleteUserByNameAndEmail(email: string, name: string) {
    try {
      const deletedUser = await prisma.user.delete({
        where: {
          email: email,
          name: name,
        },
      });

      return deletedUser;
    } catch (e: any) {
      throw new Error(`Erro ao deletar o usuário: ${e?.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }
  static async updateLoginToken(userId: number, token: string) {
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
    } catch (e: any) {
      throw new Error(
        "Ocorreu um erro inesperado ao atualizar o token de login"
      );
    } finally {
      await prisma.$disconnect();
    }
  }

  static async fetchUserByLoginToken(token: string): Promise<User | null> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          loginToken: token,
        },
      });
      return user;
    } catch (error: any) {
      throw new Error("Ocorreu um erro inesperado ao buscar usuário.");
    } finally {
      await prisma.$disconnect();
    }
  }
  static async fetchPontosTuristicos(preferencesId: number[]) {
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
    } catch (error: any) {
      console.error(error);

      throw new Error("Erro ao buscar preferencias");
    } finally {
      await prisma.$disconnect();
    }
  }
  static async fetchPrefsByEmail(email: string) {
    try {
      const userPreferences = await prisma.user
        .findUnique({
          where: { email },
        })
        .preferences();
      const preferencesIds = userPreferences?.map((pref) => pref.id);
      return preferencesIds;
    } catch (error: any) {
      console.error(error);

      throw new Error("Erro ao buscar preferencias");
    } finally {
      await prisma.$disconnect();
    }
  }
}
