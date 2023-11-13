import express from "express";
import { PrismaClient } from "@prisma/client";
import User from "./class/user";
import Team from "./class/team";
import authMiddleware from "./middleware/auth.middleware";
import Player from "./class/player";
import Game from "./class/game";
const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

/*! Start - User Routes */

/**
 * User Creation Route
 * 
 * This route handles the creation of a new user. It expects a POST request with user data, including name, email, and password.
 * The user creation process is managed by the User class, which securely hashes the password and interacts with the database.
 * 
 * @route POST /user/create
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password (will be securely hashed).
 * @returns {Response} A response object with status, message, and the user's ID upon successful creation.
 */
app.post("/user/create", async (req, res) => {
  const userController = new User();
  try {
    const { name, email, password } = req.body;
    const createUser = await userController.create({ name, email, password });
    res
      .status(createUser.status)
      .send({ message: createUser.message, user_id: createUser?.user_id });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * User Login Route
 * 
 * This route handles user authentication and login. It expects a POST request with user credentials, including email and password.
 * The login process is managed by the User class, which validates the user's credentials and provides an access token upon successful login.
 * 
 * @route POST /user/login
 * @param {string} email - The user's email address for login.
 * @param {string} password - The user's password for login.
 * @returns {Response} A response object with status, message, and an access token upon successful login.
 */
app.post("/user/login", async (req, res) => {
  const userController = new User();
  try {
    const { email, password } = req.body;
    const login = await userController.login({ email, password });
    if (
      login.access_token != null &&
      typeof login.access_token === "object" &&
      "token" in login.access_token
    ) {
      return res.status(login.status).send({
        message: login.message,
        access_token: login.access_token.token,
      });
    }
    return res
      .status(login.status)
      .send({ message: login.message, access_token: login.access_token });
  } catch (error) {
    res.status(500).send(error);
    return;
  }
});

/*! End - User Routes */



/*! Start - Team Routes */

/**
 * Team Creation Route (Protected)
 * 
 * This route allows the creation of a new team. It requires authentication using an access token obtained during user login (authMiddleware).
 * A POST request with the team's name is expected for team creation.
 * 
 * @route POST /team
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {string} name - The name of the team to be created.
 * @returns {Response} A response object with status, message, and the ID of the created team upon success.
 */
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

/**
 * Team Retrieval Route (Protected)
 * 
 * This route allows the retrieval of all teams. 
 * A GET request to this route retrieves a list of all teams.
 * 
 * @route GET /team
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @returns {Response} A response object with status, message, and a list of teams upon success.
 */
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

/**
 * Team Retrieval by ID Route (Protected)
 * 
 * This route allows the retrieval of a team by its ID. 
 * A GET request to this route with a team ID retrieves the details of the specified team.
 * 
 * @route GET /team/:id
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {number} id - The ID of the team to retrieve.
 * @returns {Response} A response object with status, message, and the team details upon success.
 */
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

/**
 * Team Deletion Route (Protected)
 * 
 * This route allows the deletion of a team by its ID. 
 * A DELETE request to this route with a team ID deletes the specified team and all associated players and games.
 * 
 * @route DELETE /team/:id
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {number} id - The ID of the team to delete.
 * @returns {Response} A response object with status, message, and the updated list of teams upon success.
 */
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

/**
 * Team Update Route (Protected)
 * 
 * This route allows the update of a team's name by its ID. 
 * A PUT request to this route with a team ID and a new name updates the specified team's name.
 * 
 * @route PUT /team/:id
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {number} id - The ID of the team to update.
 * @param {string} name - The new name for the team.
 * @returns {Response} A response object with status, message, and the updated team details upon success.
 */
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

/*! End - Team Routes */



/*! Start - Player Routes */

/**
 * Create Player Route (Protected)
 * 
 * This route allows the creation of a player within a team. 
 * A POST request to this route with player information (name, number, and team ID) creates a new player in the specified team.
 * 
 * @route POST /player
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {string} name - The name of the player to create.
 * @param {number} number - The player's tshirt number.
 * @param {number} teamId - The ID of the team to which the player plays for.
 * @returns {Response} A response object with status, message, and the player's ID upon success.
 */
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

/**
 * Get Players Route (Protected)
 * 
 * This route allows fetching a list of all players. 
 * A GET request to this route retrieves a list of all players, along with their details and team associations.
 * 
 * @route GET /player
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @returns {Response} A response object with status, message, and a list of player details upon success.
 */
app.get("/player", authMiddleware, async (req, res) => {
  const playerController = new Player();
  try {
    const players = await playerController.getAllPlayers();
    res.status(players.status).send({
      message: players.message,
      players: players.players,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Delete Player Route (Protected)
 * 
 * This route allows the deletion of a player. 
 * A DELETE request to this route with the player's ID removes the specified player from the system.
 * 
 * @route DELETE /player/:id
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {string} id - The ID of the player to be deleted.
 * @returns {Response} A response object with status, message, and player details upon success.
 */
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

/**
 * Update Player Route (Protected)
 * 
 * This route allows updating a player's information. 
 * A PUT request to this route with the player's ID and updated details (name, number, and team ID) modifies the specified player's information.
 * 
 * @route PUT /player/:id
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {string} id - The ID of the player to be updated.
 * @param {string} name - The new name for the player.
 * @param {number} number - The new jersey number for the player.
 * @param {number} teamId - The new team ID for the player.
 * @returns {Response} A response object with status, message, and the updated player details upon success.
 */
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

/*! End - Player Routes */



/*! Start - Games Routes */

/**
 * Create Game Route (Protected)
 * 
 * This route allows creating a new game in the system. 
 * A POST request to this route with the necessary details (date, homeTeamId, visitorTeamId, start, end, homeTeamGoals, visitorTeamGoals) creates a new game.
 * 
 * @route POST /game
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {string} date - The date of the game in YYYY-MM-DD format.
 * @param {number} homeTeamId - The ID of the home team.
 * @param {number} visitorTeamId - The ID of the visitor team.
 * @param {string} start - The start time of the game in HH:MM format.
 * @param {string} end - The end time of the game in HH:MM format.
 * @param {number} homeTeamGoals - The number of goals scored by the home team.
 * @param {number} visitorTeamGoals - The number of goals scored by the visitor team.
 * @returns {Response} A response object with status, message, and the newly created game's ID upon success.
 */
app.post("/game", authMiddleware, async (req, res) => {
  const gameController = new Game();
  try {
    const { date, homeTeamId, visitorTeamId,start,end, homeTeamGoals, visitorTeamGoals } = req.body;
    const createGame = await gameController.create({ date, homeTeamId, visitorTeamId,start,end, homeTeamGoals, visitorTeamGoals });
    res.status(createGame.status).send({
      message: createGame.message,
      game_id: createGame?.game_id,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Get All Games Route (Protected)
 * 
 * This route allows retrieving a list of all games in the system. 
 * A GET request to this route fetches a list of games with their details.
 * 
 * @route GET /game
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @returns {Response} A response object with status, message, and an array of game objects upon success.
 */
app.get("/game", authMiddleware, async (req, res) => {
  const gameController = new Game();
  try {
    const games = await gameController.getAllGames();
    res.status(games.status).send({
      message: games.message,
      games: games.games,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Get Game by ID Route (Protected)
 * 
 * This route allows retrieving a specific game's details by providing its unique ID. 
 * A GET request to this route with the game's ID fetches its details.
 * 
 * @route GET /game/:id
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {string} id - The ID of the game to retrieve.
 * @returns {Response} A response object with status, message, and the game details upon success.
 */
app.get("/game/:id", authMiddleware, async (req, res) => {
  const gameController = new Game();
  try {
    const { id } = req.params;
    const game = await gameController.getGame(id);
    res.status(game.status).send({ message: game.message, game: game.game });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Delete Game by ID Route (Protected)
 * 
 * This route allows deleting a specific game by providing its unique ID. 
 * A DELETE request to this route with the game's ID deletes the game and its associated data.
 * 
 * @route DELETE /game/:id
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {string} id - The ID of the game to delete.
 * @returns {Response} A response object with status, message, and the deleted game details upon success.
 */
app.delete("/game/:id", authMiddleware, async (req, res) => {
  const gameController = new Game();
  try {
    const { id } = req.params;
    const deleteGame = await gameController.delete(id);
    res.status(deleteGame.status).send({
      message: deleteGame.message,
      game: deleteGame.game,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Update Game Route (Protected)
 * 
 * This route allows updating a game's information. 
 * A PUT request to this route with the game's ID and updated details (date, homeTeamId, visitorTeamId, start, end, homeTeamGoals, visitorTeamGoals) modifies the specified game's information.
 * 
 * @route PUT /game/:id
 * @middleware authMiddleware - Ensures that the user is authenticated by providing a valid access token.
 * @param {string} id - The ID of the game to be updated.
 * @param {string} date - The new date for the game in YYYY-MM-DD format.
 * @param {number} homeTeamId - The new ID of the home team.
 * @param {number} visitorTeamId - The new ID of the visitor team.
 * @param {string} start - The new start time of the game in HH:MM format.
 * @param {string} end - The new end time of the game in HH:MM format.
 * @param {number} homeTeamGoals - The new number of goals scored by the home team.
 * @param {number} visitorTeamGoals - The new number of goals scored by the visitor team.
 * @returns {Response} A response object with status, message, and the updated game details upon success.
 */
app.put("/game/:id", authMiddleware, async (req, res) => {
  const gameController = new Game();
  try {
    const { id } = req.params;
    const { date, homeTeamId, visitorTeamId,start,end, homeTeamGoals, visitorTeamGoals } = req.body;
    const editGame = await gameController.edit({ id, date, homeTeamId, visitorTeamId,start,end, homeTeamGoals, visitorTeamGoals });
    res.status(editGame.status).send({
      message: editGame.message,
      game: editGame.game,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

/*! End - Games Routes */

const server = app.listen(port, () => {});

/*
This is a workaround to disconnect from the database after running tests.
*/
if (process.env.NODE_ENV === "test") {
  afterAll(async () => {
    await prisma.$disconnect();
    server.close();
  });
}

export default app;
