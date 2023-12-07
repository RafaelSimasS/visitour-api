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
  static async createValidatedUser(userData: userData): Promise<number> {
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
      return User.id;
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
    try {
      const prefId = await this.getPreferenceByName(prefName.toLowerCase());
      await prisma.userPreferences.create({
        data: {
          userId: userId,
          preferenceId: prefId,
        },
      });
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
}
