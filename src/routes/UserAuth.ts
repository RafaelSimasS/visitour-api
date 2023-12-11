import express, { Request, Response } from "express";
import { UserController } from "../controller/UserController";
import { generateToken, verifyToken } from "../middleware/AuthMiddleware";

const UserAuthRoutes = express.Router();

UserAuthRoutes.get("/users", async (req: Request, res: Response) => {
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

UserAuthRoutes.post(
  "/user-create",
  async (request: Request, response: Response) => {
    const { name, email, password } = request.body;
    try {
      const user = await UserController.createValidatedUser({
        name,
        email,
        password,
      });
      const userId: number = user.id;
      const token: string = generateToken(userId);
      try {
        UserController.updateLoginToken(userId, token);
      } catch (e: any) {
        console.error(e);
      }
      response
        .status(201)
        .json({ message: "Usuário criado com sucesso!", user, token });
    } catch (error: any) {
      response.status(500).json({
        erro: "Erro ao criar usuário",
        message: error.message,
        type: "db_process",
      });
    }
  }
);
UserAuthRoutes.delete(
  "/delete-user",
  verifyToken,
  async (req: Request, res: Response) => {
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
  }
);
UserAuthRoutes.post(
  "/user-login-token",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { token, isTokenExists } = req.body;
      if (isTokenExists) {
        const user = await UserController.fetchUserByLoginToken(token);
        if (user) {
          res.status(200).json({
            valid: true,
            user,
          });
        } else {
          res.status(202).json({
            message: "O usuário não existe",
            valid: true,
          });
        }
      } else {
        res
          .status(401)
          .json({ message: "Token inexistente", type: "no_token" });
      }
    } catch (error) {
      res.status(500).json({
        message: "Ocorreu um erro ao buscar infromações de usuário",
        type: "db_process",
      });
    }
  }
);
UserAuthRoutes.post(
  "/user-login",
  verifyToken,
  async (request: Request, response: Response) => {
    try {
      const { email, reqPassword, isTokenExists } = request.body;

      if (isTokenExists) {
        return response.status(200).json({ valid: true });
      }
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

      const token = generateToken(user.id);
      try {
        UserController.updateLoginToken(user.id, token);
      } catch (e: any) {
        console.error(e);
      }
      return response.status(200).json({
        token,
        valid: true,
        user,
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
UserAuthRoutes.post("/fetch-user-data", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email && password) {
    const user = await UserController.fetchUserWithPrefsByEmailAndPassword(
      email,
      password
    );

    return res.status(200).json({
      user,
    });
  } else {
    res.status(400).json({
      messsage: "Email ou senha não fornecidos",
    });
  }
});
interface RequestBodyUpdate {
  addPrefs: string[];
  removePrefs: string[];
  nome: string;
  email: string;
  senha: string;
  id: number;
  flags: flags;
}
interface flags {
  name: boolean;
  email: boolean;
  senha: boolean;
}
UserAuthRoutes.post("/update-user", async (req: Request, res: Response) => {
  const {
    addPrefs,
    removePrefs,
    nome,
    email,
    senha,
    id,
    flags,
  }: RequestBodyUpdate = req.body;

  try {
    if (flags.name) {
      await UserController.updateNameById(id, nome);
    }
    if (flags.email) {
      await UserController.updateEmailById(id, email);
    }
    if (flags.senha) {
      await UserController.updatePasswordById(id, senha);
    }
    const errors: any[] = [];
    if (addPrefs.length >= 1) {
      for (const prefName of addPrefs) {
        try {
          await UserController.addUserPreferences(id, prefName.toLowerCase());
        } catch (error: any) {
          errors.push({ prefName, error: error.message });
        }
      }
    }

    if (removePrefs.length >= 1) {
      for (const prefName of removePrefs) {
        try {
          await UserController.removeUserPreference(id, prefName.toLowerCase());
        } catch (error: any) {
          errors.push({ prefName, error: error.message });
        }
      }
    }
    if (errors.length > 0) {
      res.status(500).json({
        erro: "Erro ao atualizar preferências",
        errors,
        type: "db_process",
      });
    } else {
      res.status(200).json({
        message: "Dados atualizados com sucesso",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      erro: "Erro interno ao atualizar seus dados",
      message: error.message,
      type: "db_process",
    });
  }
});
export default UserAuthRoutes;
