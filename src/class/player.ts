import { prismaService } from "./prismaService";
import {
  createPlayerI,
  createPlayerResponseI,
  editPlayerI,
  editPlayerResponseI,
} from "@src/interfaces/player";
import Team from "./team";
import logger, { getFormattedDateTime } from "../util/logger";

/**
 * Player Class
 *
 * This class is responsible for managing player-related operations, including create/delete/edit/get players.
 * It interacts with the Prisma service to store player data in the database.
 *
 * @class Player
 */
class Player {
  private prisma: typeof prismaService;

  constructor() {
    this.prisma = prismaService;
  }

  async create(params: createPlayerI): Promise<createPlayerResponseI> {
    try {
      const { name, number, teamId } = params;
      const teamIdNum = Number(teamId);

      const validateData = await this.validateInfoBeforeEdit(number, teamId);

      if (validateData.status !== 200) {
        return validateData;
      }

      const player = await this.prisma.player.create({
        data: {
          name: name,
          number: number,
          teamId: teamIdNum,
        },
      });

      return { status: 201, message: "Player created!", player_id: player.id };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Player not created!" };
    }
  }

  async delete(id: string) {
    const idNum = Number(id);
    try {
      const player = await this.prisma.player.delete({
        where: { id: idNum },
      });
      return { status: 200, message: "Player deleted!", player: player };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Player not deleted!" };
    }
  }

  async edit(params: editPlayerI): Promise<editPlayerResponseI> {
    try {
      const { id, name, number, teamId } = params;

      const teamIdString = String(teamId);

      const validateData = await this.validateInfoBeforeEdit(
        number,
        teamIdString
      );

      if (validateData.status !== 200) {
        return validateData;
      }

      const idNum = Number(id);

      const player = await this.prisma.player.update({
        where: { id: idNum },
        data: {
          name: name,
          number: number,
          teamId: teamId,
        },
      });

      return { status: 200, message: "Player edited!", player: player };
    } catch (error) {
      return { status: 500, message: "Internal error. Player not edited!" };
    }
  }

  async validateInfoBeforeEdit(number: number, teamId: string) {
    const team = new Team();
    const teamIdNum = Number(teamId);

    const sendedTeam = await team.getTeam(teamId);

    if (sendedTeam.status !== 200) {
      return {
        status: 400,
        message: "Invalid Parameters sended! Team not found!",
      };
    }

    const tshirtNumberUsed = await this.prisma.player.findFirst({
      where: { number: number, teamId: teamIdNum },
    });

    if (tshirtNumberUsed !== null) {
      return {
        status: 400,
        message: "T-shirt number already used in this team!",
      };
    }

    return { status: 200, message: "Valid parameters!" };
  }

  async getAllPlayers() {
    try {
      const players = await this.prisma.player.findMany();

      if (players.length === 0) {
        return { status: 404, message: "Players not found!" };
      }

      return {
        status: 200,
        message: "All Players selected!",
        players: players,
      };
    } catch (error) {
      logger.error(getFormattedDateTime(), error);
      return { status: 500, message: "Internal error. Players not found!" };
    }
  }
}
export default Player;
