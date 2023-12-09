import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];

  if (!token) {
    req.body.isTokenExists = false;
    next();
  } else {
    jwt.verify(token, "login_token", (err: any, decoded: any) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Token inválido", type: "token_invalid" });
      }
      req.body.userId = decoded.userId;
      req.body.token = token;
      req.body.isTokenExists = true;
      next();
    });
  }
}

export function generateToken(userId: number): string {
  const token = jwt.sign({ userId }, `login_token`, { expiresIn: "1h" });
  return token;
}
