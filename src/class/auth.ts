import { prismaService } from "./prismaService";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import Token from "./token";

const jwtSecret = process.env.JWT_SECRET || "default_secret";

class Auth {
  private prisma: typeof prismaService;
  private secret: string = jwtSecret;

  constructor() {
    this.prisma = prismaService;
  }

  async verifyAccessToken(accessToken: string) {
    try {
      const token = jwt.verify(accessToken, this.secret) as JwtPayload;

      if (token.type === "access") {
        return {
          status: 200,
          message: "Valid access token",
          token: accessToken,
        };
      }

      throw new Error("Invalid token type");
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        const token = jwt.decode(accessToken) as JwtPayload;

        const lastRefreshToken = await this.getLatestRefreshToken(token.userId);

        if (lastRefreshToken && lastRefreshToken.token !== null) {
          const RefreshToken = await this.verifyRefreshToken(
            lastRefreshToken.token
          );
          if (RefreshToken) {
            const newAccessTokenInstance = new Token(
              { userId: token.userId, type: "access" },
              "30m"
            );

            const newAccessToken = newAccessTokenInstance.create();
            await newAccessTokenInstance.store({
              userId: token.userId,
              token: newAccessToken,
              type: "access",
            });

            return {
              status: 401,
              message: "Expired access token, new access token generated!",
              access_token: newAccessToken,
            };
          }
          return {
            status: 401,
            message:
              "Expired access token, no refresh token found! Please login again!",
            access_token: null,
          };
        }
      }
    }

    return { status: 500, message: "Invalid access token" };
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      const token = jwt.verify(refreshToken, this.secret) as JwtPayload;
      return token;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getLatestAccessToken(userId: number) {
    try {
      const latestAccessToken = await this.prisma.token.findFirst({
        where: {
          userId: userId,
          type: "access",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return latestAccessToken;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getLatestRefreshToken(userId: number) {
    try {
      const latestRefreshToken = await this.prisma.token.findFirst({
        where: {
          userId: userId,
          type: "refresh",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return latestRefreshToken;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async maybeGenerateTokens(userId: number) {
    try {
      //Access token
      let accessTokenReturn: string | undefined = "";

      const latestAccessToken = await this.getLatestAccessToken(userId);
      accessTokenReturn = latestAccessToken?.token;

      if (latestAccessToken === null) {
        const accessTokenInstance = new Token(
          { userId: userId, type: "access" },
          "30m"
        );
        const accessToken = accessTokenInstance.create();

        await accessTokenInstance.store({
          userId: userId,
          token: accessToken,
          type: "access",
        });

        //Refresh token
        const refreshTokenInstance = new Token(
          { userId: userId, type: "refresh" },
          "7d"
        );
        const refreshToken = refreshTokenInstance.create();
        await refreshTokenInstance.store({
          userId: userId,
          token: refreshToken,
          type: "refresh",
        });

        return accessToken;
      }

      if (accessTokenReturn) {
        const newAccessToken = await this.verifyAccessToken(accessTokenReturn);
        if (newAccessToken) {
          return newAccessToken;
        }
      }

      return accessTokenReturn;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default Auth;
