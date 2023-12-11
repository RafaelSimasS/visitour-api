"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controller/UserController");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const UserAuthRoutes = express_1.default.Router();
UserAuthRoutes.get("/users", async (req, res) => {
    const { limit } = req.body;
    try {
        const users = await UserController_1.UserController.getAllUsers(limit);
        if (users !== null) {
            res.status(200).json({
                users,
            });
        }
        else {
            res.status(404).json({
                message: "Nenhum usuário encontrado.",
            });
        }
    }
    catch (e) {
        res.status(500).json({
            erro: "Ocorreu um erro ao listar os usuários",
            message: e.message,
            type: "db_process",
        });
    }
});
UserAuthRoutes.post("/user-create", async (request, response) => {
    const { name, email, password } = request.body;
    try {
        const user = await UserController_1.UserController.createValidatedUser({
            name,
            email,
            password,
        });
        const userId = user.id;
        const token = (0, AuthMiddleware_1.generateToken)(userId);
        try {
            UserController_1.UserController.updateLoginToken(userId, token);
        }
        catch (e) {
            console.error(e);
        }
        response
            .status(201)
            .json({ message: "Usuário criado com sucesso!", user, token });
    }
    catch (error) {
        response.status(500).json({
            erro: "Erro ao criar usuário",
            message: error.message,
            type: "db_process",
        });
    }
});
UserAuthRoutes.delete("/delete-user", AuthMiddleware_1.verifyToken, async (req, res) => {
    const isTokenExists = req.body?.isTokenExists;
    if (!isTokenExists) {
        res.status(401).json({
            erro: "Você não tem permisssão",
            message: "Você precisa estar logado para poder fazer isso",
            type: "authentication",
        });
    }
    else {
        try {
            const { name, email } = req.body;
            const user = UserController_1.UserController.deleteUserByNameAndEmail(email, name);
            res.status(200).json({
                message: "Conta deletada com sucesso",
            });
        }
        catch (e) {
            res.status(500).json({
                message: "Ocorreu um erro ao tentar deletar a conta",
                type: "db_process",
            });
        }
    }
});
UserAuthRoutes.post("/user-login-token", AuthMiddleware_1.verifyToken, async (req, res) => {
    try {
        const { token, isTokenExists } = req.body;
        if (isTokenExists) {
            const user = await UserController_1.UserController.fetchUserByLoginToken(token);
            if (user) {
                res.status(200).json({
                    valid: true,
                    user,
                });
            }
            else {
                res.status(202).json({
                    message: "O usuário não existe",
                    valid: true,
                });
            }
        }
        else {
            res
                .status(401)
                .json({ message: "Token inexistente", type: "no_token" });
        }
    }
    catch (error) {
        res.status(500).json({
            message: "Ocorreu um erro ao buscar infromações de usuário",
            type: "db_process",
        });
    }
});
UserAuthRoutes.post("/user-login", AuthMiddleware_1.verifyToken, async (request, response) => {
    try {
        const { email, reqPassword, isTokenExists } = request.body;
        if (isTokenExists) {
            return response.status(200).json({ valid: true });
        }
        const user = await UserController_1.UserController.fetchUserByEmailAndPassword(email, reqPassword);
        if (!user) {
            return response.status(401).json({
                message: "Credenciais Incorretas",
                type: "authentication",
            });
        }
        const token = (0, AuthMiddleware_1.generateToken)(user.id);
        try {
            UserController_1.UserController.updateLoginToken(user.id, token);
        }
        catch (e) {
            console.error(e);
        }
        return response.status(200).json({
            token,
            valid: true,
            user,
        });
    }
    catch (e) {
        response.status(500).json({
            erro: "Erro ao tentar fazer login",
            message: e.message,
            type: "authentication",
        });
    }
});
UserAuthRoutes.post("/fetch-user-data", async (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        const user = await UserController_1.UserController.fetchUserWithPrefsByEmailAndPassword(email, password);
        return res.status(200).json({
            user,
        });
    }
    else {
        res.status(400).json({
            messsage: "Email ou senha não fornecidos",
        });
    }
});
UserAuthRoutes.post("/update-user", async (req, res) => {
    const { addPrefs, removePrefs, nome, email, senha, id, flags, } = req.body;
    try {
        if (flags.name) {
            await UserController_1.UserController.updateNameById(id, nome);
        }
        if (flags.email) {
            await UserController_1.UserController.updateEmailById(id, email);
        }
        if (flags.senha) {
            await UserController_1.UserController.updatePasswordById(id, senha);
        }
        const errors = [];
        if (addPrefs.length >= 1) {
            for (const prefName of addPrefs) {
                try {
                    await UserController_1.UserController.addUserPreferences(id, prefName.toLowerCase());
                }
                catch (error) {
                    errors.push({ prefName, error: error.message });
                }
            }
        }
        if (removePrefs.length >= 1) {
            for (const prefName of removePrefs) {
                try {
                    await UserController_1.UserController.removeUserPreference(id, prefName.toLowerCase());
                }
                catch (error) {
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
        }
        else {
            res.status(200).json({
                message: "Dados atualizados com sucesso",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            erro: "Erro interno ao atualizar seus dados",
            message: error.message,
            type: "db_process",
        });
    }
});
exports.default = UserAuthRoutes;
//# sourceMappingURL=UserAuth.js.map