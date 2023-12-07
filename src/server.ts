import express, { Request, Response } from "express";
import { UserController } from "./controller/UserController";
import { generateToken, verifyToken } from "./middleware/AuthMiddleware";
const app = express();
app.use(express.json());
const port = 5000;

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
      message: e.message,
      type: "db_process",
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
      message: error.message,
      type: "db_process",
    });
  }
});
app.delete("/delete-user", verifyToken, async (req: Request, res: Response) => {
  const isTokenExists = req.body?.isTokenExists;
  if (!isTokenExists) {
    res.status(401).json({
      erro: "Você não tem permisssão",
      message: "Você precisa estar logado para poder fazer isso",
      type: "authentication",
    });
  } else {
    try {
      const { name, email } = req.body;
      const user = UserController.deleteUserByNameAndEmail(email, name);
      res.status(200).json({
        message: "Conta deletada com sucesso",
      });
    } catch (e: any) {
      res.status(500).json({
        message: "Ocorreu um erro ao tentar deletar a conta",
        type: "db_process",
      });
    }
  }
});
app.get(
  "/user-login",
  verifyToken,
  async (request: Request, response: Response) => {
    try {
      const { email, reqPassword, isTokenExists } = request.body;
      const user = await UserController.fetchUserByEmailAndPassword(
        email,
        reqPassword
      );
      if (!user) {
        return response.status(401).json({
          message: "Credenciais Incorretas",
          type: "authentication",
        });
      }
      const { password, ...userWithoutPassword } = user;
      if (isTokenExists) {
        return response.status(200).json({ valid: true, userWithoutPassword });
      }
      const token = generateToken(user.id);
      return response.status(200).json({
        token,
        valid: true,
        userWithoutPassword,
      });
    } catch (e: any) {
      response.status(500).json({
        erro: "Erro ao tentar fazer login",
        message: e.message,
        type: "authentication",
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
      message: error.message,
      type: "db_process",
    });
  }
});

app.listen(port, "192.168.1.12", () => console.log(`Running on port ${port}`));
