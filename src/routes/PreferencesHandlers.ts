import express, { Request, Response } from "express";
import { UserController } from "../controller/UserController";
const PreferencesRouter = express.Router();

PreferencesRouter.post(
  "/user-prefs",
  async (request: Request, response: Response) => {
    const { userId, prefNames } = request.body;
    try {
      const errors: any[] = [];
      for (const prefName of prefNames) {
        try {
          await UserController.addUserPreferences(
            userId,
            prefName.toLowerCase()
          );
        } catch (error: any) {
          errors.push({ prefName, error: error.message });
        }
      }
      if (errors.length > 0) {
        response.status(500).json({
          erro: "Erro ao adicionar preferências",
          errors,
          type: "db_process",
        });
      } else {
        response.status(200).json({
          message: "Preferências adicionadas com sucesso",
        });
      }
    } catch (error: any) {
      response.status(500).json({
        erro: "Erro ao processar preferências",
        message: error.message,
        type: "db_process",
      });
    }
  }
);
PreferencesRouter.get(
  "/user-prefs",
  async (request: Request, response: Response) => {
    const { userId } = request.body;
    try {
      const preferences: string[] = await UserController.getUserPreferences(
        userId
      );
      response.status(200).json({
        preferences,
      });
    } catch (error: any) {
      response.status(500).json({
        erro: "Erro ao obter as preferências",
        message: error.message,
        type: "db_process",
      });
    }
  }
);

export default PreferencesRouter;
