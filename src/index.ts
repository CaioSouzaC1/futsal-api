import express from "express";
import { PrismaClient } from "@prisma/client";
import User from "./class/user";
import Team from "./class/team";
import authMiddleware from "./middleware/auth.middleware";
import Player from "./class/player";
const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

// Start - User Routes

// Create a new user
app.post("/user/create", async (req, res) => {
  const userController = new User();
  try {
    const { name, email, password } = req.body;
    const createUser = await userController.create({ name, email, password });
    res
      .status(createUser.status)
      .send({ message: createUser.message, user_id: createUser?.user_id });
  } catch (error) {
    //This catch will not be used, the error handling is within the class
    res.status(500).send(error);
  }
});

// Login user
app.post("/user/login", async (req, res) => {
  const userController = new User();
  try {
    const { email, password } = req.body;
    const login = await userController.login({ email, password });
    res
      .status(login.status)
      .send({ message: login.message, access_token: login.access_token });
  } catch (error) {
    //This catch will not be used, the error handling is within the class
    res.status(500).send(error);
  }
});

// End - User Routes

// Start - Team Routes

// Create a new team
app.post("/team", authMiddleware, async (req, res) => {
  const teamController = new Team();
  try {
    const { name } = req.body;
    const createTeam = await teamController.create(name);
    res
      .status(createTeam.status)
      .send({ message: createTeam.message, team_id: createTeam?.team_id });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all teams
app.get("/team", authMiddleware, async (req, res) => {
  const teamController = new Team();
  try {
    const teams = await teamController.getAllTeams();
    res
      .status(teams.status)
      .send({ message: teams.message, teams: teams.teams });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get one team by id
app.get("/team/:id", authMiddleware, async (req, res) => {
  const teamController = new Team();
  try {
    const { id } = req.params;
    const team = await teamController.getTeam(id);
    res.status(team.status).send({ message: team.message, team: team.team });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Delete a team
app.delete("/team/:id", authMiddleware, async (req, res) => {
  const teamController = new Team();
  try {
    const { id } = req.params;
    const deleteTeam = await teamController.delete(id);
    res
      .status(deleteTeam.status)
      .send({ message: deleteTeam.message, teams: deleteTeam.teams });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Edit a team
app.put("/team/:id", authMiddleware, async (req, res) => {
  const teamController = new Team();
  try {
    const { id } = req.params;
    const { name } = req.body;
    const editTeam = await teamController.edit(id, name);
    res
      .status(editTeam.status)
      .send({ message: editTeam.message, team: editTeam.team });
  } catch (error) {
    res.status(500).send(error);
  }
});

// End - Team Routes

// Start - Player Routes

// Create a new player
app.post("/player", authMiddleware, async (req, res) => {
  const playerController = new Player();
  try {
    const { name, number, teamId } = req.body;
    const createPlayer = await playerController.create({
      name,
      number,
      teamId,
    });
    res.status(createPlayer.status).send({
      message: createPlayer.message,
      player_id: createPlayer?.player_id,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a player
app.delete("/player/:id", authMiddleware, async (req, res) => {
  const playerController = new Player();
  try {
    const { id } = req.params;
    const deletePlayer = await playerController.delete(id);
    res.status(deletePlayer.status).send({
      message: deletePlayer.message,
      player: deletePlayer.player,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Edit a player
app.put("/player/:id", authMiddleware, async (req, res) => {
  const playerController = new Player();
  try {
    const { id } = req.params;
    const { name, number, teamId } = req.body;
    const editPlayer = await playerController.edit({
      id,
      name,
      number,
      teamId,
    });
    res.status(editPlayer.status).send({
      message: editPlayer.message,
      player: editPlayer.player,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// End - Player Routes

const server = app.listen(port, () => {});

if (process.env.NODE_ENV === "test") {
  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });
}

export default app;
