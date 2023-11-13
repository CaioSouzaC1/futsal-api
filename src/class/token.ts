import jwt from "jsonwebtoken";
import { prismaService } from "./prismaService";
import {
  storeFailedTokenResponseI,
  storeTokenI,
  storeTokenResponseI,
} from "@src/interfaces/token";
import logger, { getFormattedDateTime } from "../util/logger";

const jwtSecret = process.env.JWT_SECRET || "default_secret";

/**
 * Token Class
 *
 * This class provides functionality for creating and storing tokens.
 * It uses JSON Web Tokens (JWT) for token creation and the Prisma client for database interactions.
 *
 * @class Token
 */
class Token {
  private secret: string = jwtSecret;
  private data: object;
  private expiresIn: string;
  private prisma: typeof prismaService;

  constructor(data: object, expiresIn: string) {
    this.prisma = prismaService;
    this.data = data;
    this.expiresIn = expiresIn;
  }

  create(): string {
    return jwt.sign(this.data, this.secret, { expiresIn: this.expiresIn });
  }

  async store(
    params: storeTokenI
  ): Promise<storeTokenResponseI | storeFailedTokenResponseI> {
    try {
      const { userId, token, type } = params;
      const tokenStore = await this.prisma.token.create({
        data: {
          userId: userId,
          token: token,
          expiresIn: this.expiresIn,
          type: type,
        },
      });

      return tokenStore;
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Token not created!" };
    }
  }
}

export default Token;
