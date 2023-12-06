import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { UserController } from "./controller/UserController";
import jwt from "jsonwebtoken";
const app = express();
app.use(express.json());
const port = 5000;

const prisma = new PrismaClient();

app.get("/", (_, res) => {
  res.status(200).send("Hello, World");
});

app.get("/users", async () => {
  const users = await prisma.user.findMany();

  return { users };
});

app.post("/user-create", async (request: Request, response: Response) => {
  const { name, email, password } = request.body;
  try {
    const userId: number = await UserController.createValidatedUser({
      name,
      email,
      password,
    });
    const token = jwt.sign({ userId }, "login_token", { expiresIn: "1h" });
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
app.get("/user-login", async (request: Request, response: Response) => {
  const { nameEmail, password, token } = request.body;
  if (token) {
  }
});

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
