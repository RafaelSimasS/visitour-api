import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { UserController } from "./controller/UserController";
import { generateToken, verifyToken } from "./middleware/AuthMiddleware";
const app = express();
app.use(express.json());
const port = 5000;

// const prisma = new PrismaClient();

app.get("/", (_, res) => {
  res.status(200).send("Hello, World");
});

app.get("/users", async (req: Request, res: Response) => {
  const { limit } = req.body;
  try {
    const users = await UserController.getAllUsers(limit);
    if (users !== null) {
      res.status(200).json({
        users,
      });
    } else {
      res.status(404).json({
        message: "Nenhum usuário encontrado.",
      });
    }
  } catch (e: any) {
    res.status(500).json({
      erro: "Ocorreu um erro ao listar os usuários",
      errorInfo: e.message,
    });
  }
});

app.post("/user-create", async (request: Request, response: Response) => {
  const { name, email, password } = request.body;
  try {
    const userId: number = await UserController.createValidatedUser({
      name,
      email,
      password,
    });
    const token = generateToken(userId);
    response
      .status(201)
      .json({ message: "Usuário criado com sucesso!", id: userId, token });
  } catch (error: any) {
    response.status(500).json({
      erro: "Erro ao criar usuário",
      errorInfo: error.message,
    });
  }
});
app.get(
  "/user-login",
  verifyToken,
  async (request: Request, response: Response) => {
    const { email, password } = request.body;
    const isTokenValid = request.body.isTokenValid;
    try {
      if (isTokenValid === false) {
        const user = await UserController.fetchUserByEmail(email, password);
        if (user) {
          const token = generateToken(user.id);
          const name = user.name;
          response.status(200).json({
            token,
            valid: true,
          });
        } else {
          response.status(401).json({ message: "Credenciais Incorretas" });
        }
      } else {
        response.status(200).json({ valid: true });
      }
    } catch (e: any) {
      response.status(500).json({
        erro: "Erro ao tentar fazer login",
        errorInfo: e.message,
      });
    }
  }
);

app.post("/user-prefs", async (request: Request, response: Response) => {
  const { userId, prefNames } = request.body;
  try {
    const errors: any[] = [];
    for (const prefName of prefNames) {
      try {
        await UserController.addUserPreferences(userId, prefName.toLowerCase());
      } catch (error: any) {
        errors.push({ prefName, error: error.message });
      }
    }
    if (errors.length > 0) {
      response.status(500).json({
        erro: "Erro ao adicionar preferências",
        errors,
      });
    } else {
      response.status(200).json({
        message: "Preferências adicionadas com sucesso",
      });
    }
  } catch (error: any) {
    response.status(500).json({
      erro: "Erro ao processar preferências",
      errorInfo: error.message,
    });
  }
});
app.get("/user-prefs", async (request: Request, response: Response) => {
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
      errorInfo: error.message,
    });
  }
});

app.listen(port, "192.168.1.12", () => console.log(`Running on port ${port}`));
