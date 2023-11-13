import { PrismaClient } from "@prisma/client";

/**
 * PrismaService Class
 * 
 * This class serves as a singleton for managing the Prisma Client instance and providing access to it.
 * It ensures that only one instance of Prisma Client is created and reused throughout the application.
 * 
 * @class PrismaService
 */
class PrismaService {
  private static instance: PrismaService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }
}

const prismaServiceInstance = PrismaService.getInstance();
export const prismaService = prismaServiceInstance.getClient();
