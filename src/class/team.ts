import { prismaService } from "./prismaService";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CreateTeamI } from "@src/interfaces/team";
import Game from "./game";

class Team {
  private prisma: typeof prismaService;

  constructor() {
    this.prisma = prismaService;
  }

  async create(name: string): Promise<CreateTeamI> {
    if (typeof name !== "string") {
      //Doc: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400
      return { status: 400, message: "Invalid Parameters sended!" };
    }

    try {
      const createTeam = await this.prisma.team.create({
        data: {
          name: name,
        },
      });

      return { status: 201, message: "Team created!", team_id: createTeam.id };
    } catch (error) {
      return { status: 500, message: "Internal error. Team not created!" };
    }
  }

  async getAllTeams() {
    const teams = await this.prisma.team.findMany();
    return { status: 200, message: "All teams selected!", teams: teams };
  }

  async getTeam(id: string) {
    try {
      const idNum = Number(id);
      const team = await this.prisma.team.findUnique({
        where: { id: idNum },
      });
      if (team === null) {
        return { status: 404, message: "Team not found!" };
      }

      return { status: 200, message: "Team selected!", team: team };
    } catch (error) {
      return { status: 500, message: "Internal error. Team not created!" };
    }
  }

  async delete(id: string) {
    const idNum = Number(id);
    try {
      const games = await this.prisma.game.findMany({
        where: {
          OR: [{ homeTeamId: idNum }, { visitorTeamId: idNum }],
        },
      });
      if (games.length !== 0) {
       games.forEach(async (el) => {
          const game = new Game();
          await game.delete(String(el.id));
        });
      }
      await this.prisma.player.deleteMany({
        where: { teamId: idNum },
      });

      const teams = await this.prisma.team.delete({
        where: { id: idNum },
      });

      return { status: 200, message: "Team deleted!", teams: teams };
    } catch (error) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        //Doc: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (error.code === "P2025") {
          //Doc: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409
          return {
            status: 409,
            message: "Team does not exist!",
          };
        }
      }
      return { status: 500, message: "Internal error. Team not deleted!" };
    }
  }

  async edit(id: string, name: string) {
    const idNum = Number(id);
    try {
      const team = await this.prisma.team.update({
        where: { id: idNum },
        data: {
          name: name,
        },
      });
      return { status: 200, message: "Team edited!", team: team };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        //Doc: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (error.code === "P2025") {
          //Doc: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409
          return {
            status: 404,
            message: "Team not found!",
          };
        }
      }
      return { status: 500, message: "Internal error. Team not edited!" };
    }
  }
}

export default Team;
