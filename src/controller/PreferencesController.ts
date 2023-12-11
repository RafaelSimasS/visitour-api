import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export class PreferencesController {
  static async fetchPrefsList() {
    try {
      await prisma.$connect();
      const prefs = await prisma.preferences.findMany();
      return prefs;
    } catch (error) {
      throw new Error(
        "Um erro inesperado inesperado ocorreu ao tentar buscar as preferências"
      );
    } finally {
      await prisma.$disconnect();
    }
  }
}
