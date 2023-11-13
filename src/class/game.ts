import {
  createGameI,
  createGameResponseI,
  editGameI,
  editGameResponseI,
  updatePointsGameI,
} from "@src/interfaces/game";
import { prismaService } from "./prismaService";
import Team from "./team";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getFormattedDateTime } from "../util/logger";
import logger from "../util/logger";

/**
 * Game Class
 *
 * This class is responsible for managing game-related operations, including create/delete/edit/get games.
 * It uses Prisma to interact with the database and maintain game data.
 *
 * @class Game
 */
class Game {
  private prisma: typeof prismaService;

  constructor() {
    this.prisma = prismaService;
  }

  async create(params: createGameI): Promise<createGameResponseI> {
    try {
      const {
        date,
        homeTeamId,
        visitorTeamId,
        start,
        end,
        homeTeamGoals,
        visitorTeamGoals,
      } = params;
      const homeTeamIdNum = Number(homeTeamId);
      const visitorTeamIdNum = Number(visitorTeamId);
      const homeTeamGoalsNum = Number(homeTeamGoals);
      const visitorTeamGoalsNum = Number(visitorTeamGoals);

      const validateData = await this.validateInfoBeforeCreate(
        homeTeamId,
        visitorTeamId
      );

      if (validateData.status !== 200) {
        return validateData;
      }

      const game = await this.prisma.game.create({
        data: {
          date: date,
          homeTeamId: homeTeamIdNum,
          visitorTeamId: visitorTeamIdNum,
          start: start,
          end: end,
          homeTeamGoals: homeTeamGoalsNum,
          visitorTeamGoals: visitorTeamGoalsNum,
        },
      });

      await this.calculatePoints(game.id);

      return { status: 201, message: "Game created!", game_id: game.id };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Game not created!" };
    }
  }

  async edit(params: editGameI): Promise<editGameResponseI> {
    try {
      const {
        id,
        date,
        homeTeamId,
        visitorTeamId,
        start,
        end,
        homeTeamGoals,
        visitorTeamGoals,
      } = params;

      const homeTeamIdNum = Number(homeTeamId);
      const visitorTeamIdNum = Number(visitorTeamId);
      const homeTeamGoalsNum = Number(homeTeamGoals);
      const visitorTeamGoalsNum = Number(visitorTeamGoals);
      const idNum = Number(id);

      const validateData = await this.validateInfoBeforeCreate(
        homeTeamId,
        visitorTeamId
      );

      if (validateData.status !== 200) {
        return validateData;
      }

      const gameBeforeEdit = await this.prisma.game.findUnique({
        where: { id: idNum },
      });

      if (gameBeforeEdit == null) {
        return { status: 400, message: "Game not found!" };
      }

      const game = await this.prisma.game.update({
        where: { id: idNum },
        data: {
          date: date,
          homeTeamId: homeTeamIdNum,
          visitorTeamId: visitorTeamIdNum,
          start: start,
          end: end,
          homeTeamGoals: homeTeamGoalsNum,
          visitorTeamGoals: visitorTeamGoalsNum,
        },
      });

      await this.calculatePointsOnUpdate(gameBeforeEdit, game);

      return { status: 200, message: "Game edited!", game: game.id };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Game not edited!" };
    }
  }

  async getAllGames() {
    try {
      const games = await this.prisma.game.findMany();

      if (games.length === 0) {
        return { status: 404, message: "Games not found!" };
      }

      return { status: 200, message: "Games found!", games: games };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Games not found!" };
    }
  }

  async getGame(id: string) {
    try {
      const idNum = Number(id);
      const game = await this.prisma.game.findUnique({
        where: { id: idNum },
      });
      if (game === null) {
        return { status: 404, message: "Game not found!" };
      }

      return { status: 200, message: "Game selected!", game: game };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Game not created!" };
    }
  }

  async delete(id: string) {
    const idNum = Number(id);

    try {
      const game = await this.prisma.game.delete({
        where: { id: idNum },
      });

      await this.calculatePointsOnDelete(game);

      return { status: 200, message: "Game deleted!", game: game.id };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      if (error instanceof PrismaClientKnownRequestError) {
        //Doc: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (error.code === "P2025") {
          return {
            status: 409,
            message: "Game does not exist!",
          };
        }
      }
      return { status: 500, message: "Internal error. Game not deleted!" };
    }
  }

  async validateInfoBeforeCreate(homeTeamId: string, visitorTeamId: string) {
    const team = new Team();

    const sendedHomeTeam = await team.getTeam(homeTeamId);
    const sendedVisitorTeam = await team.getTeam(visitorTeamId);

    if (sendedHomeTeam.status !== 200 || sendedVisitorTeam.status !== 200) {
      return {
        status: 400,
        message: "Invalid Parameters sended!",
      };
    }

    return { status: 200, message: "Valid Parameters sended!" };
  }

  async calculatePoints(gameId: number) {
    const gameIdNum = gameId;

    try {
      const game = await this.prisma.game.findUnique({
        where: { id: gameIdNum },
      });

      const homeTeam = await this.prisma.team.findUnique({
        where: { id: game?.homeTeamId },
      });

      const visitorTeam = await this.prisma.team.findUnique({
        where: { id: game?.visitorTeamId },
      });

      if (game == null || homeTeam == null || visitorTeam == null) {
        return { status: 400, message: "Game not found!" };
      }

      if (game.homeTeamGoals != null && game.visitorTeamGoals != null) {
        let homeTeamPoints = 0;
        let visitorTeamPoints = 0;
        if (game.homeTeamGoals > game.visitorTeamGoals) {
          homeTeamPoints = 3;
        }

        if (game.homeTeamGoals < game.visitorTeamGoals) {
          visitorTeamPoints = 3;
        }

        if (game.homeTeamGoals === game.visitorTeamGoals) {
          homeTeamPoints = 1;
          visitorTeamPoints = 1;
        }

        if (
          homeTeam.points != null &&
          homeTeam.goalsCount != null &&
          homeTeam.gamesCount != null
        ) {
          await this.prisma.team.update({
            where: { id: homeTeam?.id },
            data: {
              points: homeTeam.points + homeTeamPoints,
              goalsCount: homeTeam.goalsCount + game.homeTeamGoals,
              gamesCount: homeTeam.gamesCount + 1,
            },
          });
        }

        if (
          visitorTeam.points != null &&
          visitorTeam.goalsCount != null &&
          visitorTeam.gamesCount != null
        ) {
          await this.prisma.team.update({
            where: { id: visitorTeam?.id },
            data: {
              points: visitorTeam.points + visitorTeamPoints,
              goalsCount: visitorTeam.goalsCount + game.visitorTeamGoals,
              gamesCount: visitorTeam.gamesCount + 1,
            },
          });
        }
        return { status: 200, message: "Points calculated!" };
      }

      return { status: 400, message: "Invalid parameters sended!" };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Points not calculated!" };
    }
  }

  async calculatePointsOnUpdate(
    oldGame: updatePointsGameI,
    updatedGame: updatePointsGameI
  ) {
    try {
      if (
        oldGame.homeTeamGoals != null &&
        oldGame.visitorTeamGoals != null &&
        updatedGame.homeTeamGoals != null &&
        updatedGame.visitorTeamGoals != null
      ) {
        const homeTeamIdNum = Number(oldGame.homeTeamId);
        const visitorTeamIdNum = Number(oldGame.visitorTeamId);

        const homeTeamGoalsDiff =
          updatedGame.homeTeamGoals - oldGame.homeTeamGoals;

        const visitorTeamGoalsDiff =
          updatedGame.visitorTeamGoals - oldGame.visitorTeamGoals;

        let homeTeamPointsDiff = 0;
        let visitorTeamPointsDiff = 0;

        if (
          oldGame.homeTeamGoals > oldGame.visitorTeamGoals &&
          updatedGame.homeTeamGoals < updatedGame.visitorTeamGoals
        ) {
          homeTeamPointsDiff = -3;
          visitorTeamPointsDiff = 3;
        }

        if (
          oldGame.homeTeamGoals < oldGame.visitorTeamGoals &&
          updatedGame.homeTeamGoals > updatedGame.visitorTeamGoals
        ) {
          homeTeamPointsDiff = 3;
          visitorTeamPointsDiff = -3;
        }

        if (
          oldGame.homeTeamGoals > oldGame.visitorTeamGoals &&
          updatedGame.homeTeamGoals == updatedGame.visitorTeamGoals
        ) {
          homeTeamPointsDiff = -2;
          visitorTeamPointsDiff = +1;
        }

        if (
          oldGame.visitorTeamGoals > oldGame.homeTeamGoals &&
          updatedGame.homeTeamGoals == updatedGame.visitorTeamGoals
        ) {
          homeTeamPointsDiff = 1;
          visitorTeamPointsDiff = -2;
        }

        if (
          oldGame.homeTeamGoals == oldGame.visitorTeamGoals &&
          updatedGame.homeTeamGoals > updatedGame.visitorTeamGoals
        ) {
          homeTeamPointsDiff = 2;
          visitorTeamPointsDiff = -1;
        }

        if (
          oldGame.homeTeamGoals == oldGame.visitorTeamGoals &&
          updatedGame.visitorTeamGoals > updatedGame.homeTeamGoals
        ) {
          homeTeamPointsDiff = -1;
          visitorTeamPointsDiff = 2;
        }

        const homeTeam = await this.prisma.team.findUnique({
          where: { id: homeTeamIdNum },
        });

        const visitorTeam = await this.prisma.team.findUnique({
          where: { id: visitorTeamIdNum },
        });

        if (
          homeTeam != null &&
          visitorTeam != null &&
          homeTeam.points != null &&
          homeTeam.goalsCount != null &&
          visitorTeam.points != null &&
          visitorTeam.goalsCount != null
        ) {
          await this.prisma.team.update({
            where: { id: homeTeam.id },
            data: {
              points: homeTeam.points + homeTeamPointsDiff,
              goalsCount: homeTeam.goalsCount + homeTeamGoalsDiff,
            },
          });

          await this.prisma.team.update({
            where: { id: visitorTeam.id },
            data: {
              points: visitorTeam.points + visitorTeamPointsDiff,
              goalsCount: visitorTeam.goalsCount + visitorTeamGoalsDiff,
            },
          });

          return { status: 200, message: "Points updated!" };
        }
      }

      return { status: 400, message: "Invalid parameters sent!" };
    } catch (error) {
      console.log(error);
      return { status: 500, message: "Internal error. Points not calculated!" };
    }
  }

  async calculatePointsOnDelete(game: updatePointsGameI | null) {
    try {
      if (game == null) {
        return { status: 400, message: "Game not found!" };
      }

      const homeTeamIdNum = Number(game.homeTeamId);
      const visitorTeamIdNum = Number(game.visitorTeamId);

      let homeTeamPointsDiff = 0;
      let visitorTeamPointsDiff = 0;

      if (game.homeTeamGoals > game.visitorTeamGoals) {
        homeTeamPointsDiff = 3;
      }

      if (game.homeTeamGoals < game.visitorTeamGoals) {
        visitorTeamPointsDiff = 3;
      }

      if (game.homeTeamGoals === game.visitorTeamGoals) {
        homeTeamPointsDiff = 1;
        visitorTeamPointsDiff = 1;
      }

      const homeTeam = await this.prisma.team.findUnique({
        where: { id: homeTeamIdNum },
      });

      const visitorTeam = await this.prisma.team.findUnique({
        where: { id: visitorTeamIdNum },
      });

      if (homeTeam == null || visitorTeam == null) {
        return { status: 400, message: "Team not found!" };
      }

      if (
        homeTeam != null &&
        visitorTeam != null &&
        homeTeam.points != null &&
        homeTeam.goalsCount != null &&
        homeTeam.gamesCount != null &&
        visitorTeam.points != null &&
        visitorTeam.goalsCount != null &&
        visitorTeam.gamesCount != null
      ) {
        await this.prisma.team.update({
          where: { id: homeTeamIdNum },
          data: {
            points: homeTeam.points - homeTeamPointsDiff,
            goalsCount: homeTeam.goalsCount - game.homeTeamGoals,
            gamesCount: homeTeam.gamesCount - 1,
          },
        });

        await this.prisma.team.update({
          where: { id: visitorTeamIdNum },
          data: {
            points: visitorTeam.points - visitorTeamPointsDiff,
            goalsCount: visitorTeam.goalsCount - game.visitorTeamGoals,
            gamesCount: visitorTeam.gamesCount - 1,
          },
        });
        return { status: 200, message: "Points updated!" };
      }
      throw new Error("Internal error. Points not calculated!");
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Points not calculated!" };
    }
  }
}

export default Game;
