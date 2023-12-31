import { prismaService } from "./prismaService";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import Password from "./password";
import Auth from "./auth";
import {
  CreateUserI,
  CreateUserResponseI,
  LoginUserI,
  LoginUserResponseI,
} from "@src/interfaces/user";
import logger, { getFormattedDateTime } from "../util/logger";

/**
 * User Class
 *
 * This class handles user-related operations, such as user create and authentication.
 * It uses the Prisma client for database interactions and relies on the Password class for password hashing and comparison.
 *
 * @class User
 */
class User {
  private prisma: typeof prismaService;
  private pass: Password;

  constructor() {
    this.prisma = prismaService;
    this.pass = new Password();
  }

  async create(params: CreateUserI): Promise<CreateUserResponseI> {
    const { name, email, password } = params;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return { status: 400, message: "Invalid Parameters sended!" };
    }

    try {
      const hash = await this.pass.hash(password);
      const user = await this.prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hash,
        },
      });

      return { status: 201, message: "User created!", user_id: user.id };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      if (error instanceof PrismaClientKnownRequestError) {
        //Doc: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (error.code === "P2002") {
          return {
            status: 409,
            message: "Unique key violated : " + error.meta?.target,
          };
        }
      }
      // Unknown error
      return { status: 500, message: "Unknown error!" };
    }
  }

  async login(params: LoginUserI): Promise<LoginUserResponseI> {
    const { email, password } = params;
    if (typeof email !== "string" || typeof password !== "string") {
      return { status: 400, message: "Invalid Parameters sended!" };
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        return { status: 404, message: "User not found!" };
      }

      const comparePass = await this.pass.compare(password, user.password);

      if (comparePass) {
        const auth = new Auth();
        const accessToken = await auth.maybeGenerateTokens(user.id);

        return {
          status: 200,
          message: "User logged!",
          user_id: user.id,
          access_token: accessToken,
        };
      }
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Unknown error!" };
    }

    return { status: 401, message: "User Unauthorized!" };
  }
}

export default User;
