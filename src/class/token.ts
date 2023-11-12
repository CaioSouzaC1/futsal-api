import jwt from "jsonwebtoken";
import { prismaService } from "./prismaService";
import { storeTokenI, storeTokenResponseI } from "@src/interfaces/token";

const jwtSecret = process.env.JWT_SECRET || "default_secret";

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

  async store(params: storeTokenI): Promise<storeTokenResponseI> {
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
  }
}

export default Token;
