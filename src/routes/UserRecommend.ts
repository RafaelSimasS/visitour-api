import express, { Request, Response } from "express";
import { generateToken, verifyToken } from "../middleware/AuthMiddleware";
import { UserController } from "../controller/UserController";

const UserRecommendRoutes = express.Router();

UserRecommendRoutes.post(
  "/fetch-feed",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { isTokenExists, name, email, password } = req.body;

      const user = await UserController.fetchUserByEmailAndPassword(
        email,
        password
      );
      if (!user) {
        return res.status(401).json({
          message: "Usuário não encontrado no banco de dados",
        });
      }
      const userPreferences = await UserController.fetchPrefsByEmail(email);

      if (!userPreferences) {
        return res.status(401).json({
          message: "Usuário não tem preferências",
        });
      }
      const pontosTuristicos = await UserController.fetchPontosTuristicos(
        userPreferences
      );

      if (pontosTuristicos) {
        res.status(200).json({
          pontosTuristicos,
        });
      } else {
        res.status(401).json({
          message:
            "Não encontramos locais para recomendar baseado nas suas preferências",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: "Um erro inesperado ocorreu ao tentar buscar recomendados",
      });
    }
  }
);

export default UserRecommendRoutes;
