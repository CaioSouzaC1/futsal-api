import { Request, Response, NextFunction } from "express";
import Auth from "../class/auth";

/**
 * Authentication Middleware
 * 
 * Middleware function to validate user authentication using an access token.
 * It checks for the presence of an "Authorization" header with a Bearer token and verifies the token's validity.
 * 
 * @middleware authMiddleware
 * @param {Request} req - Express Request object.
 * @param {Response} res - Express Response object.
 * @param {NextFunction} next - Express Next function to proceed with the request chain.
 */
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers["authorization"];

  if (!accessToken) {
    return res.status(401).send({ message: "Access token is required" });
  }
  const token = accessToken.split("Bearer ")[1];
  const authInstance = new Auth();

  const validToken = await authInstance.verifyAccessToken(token);

  if (validToken.status === 401 || validToken.status === 500) {
    return res.status(validToken.status).send({
      message: validToken.message,
      access_token: validToken.access_token,
    });
  }

  return next();
};
export default authMiddleware;
