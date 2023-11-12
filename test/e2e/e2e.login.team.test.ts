import request from "supertest";
import app from "@src/index";

let accessToken: string | undefined = "";
let createdTeamId: number | undefined = 0;
let secondCreatedTeamId: number | undefined = 0;
let createdPlayerId: number | undefined = 0;
let secondCreatedPlayerId: number | undefined = 0;

const userEmailTest: string = "emailemailemail19@email.com.br";
const userPassTest: string = "123456";

describe('Rota *POST* "/user/create"', () => {
  it("Deve retornar um usuário", async () => {
    const response = await request(app).post("/user/create").send({
      name: "Maria",
      email: userEmailTest,
      password: userPassTest,
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("message");
  });
});

describe('Rota *POST* "/user/login"', () => {
  it("Deve logar um usuário", async () => {
    const response = await request(app).post("/user/login").send({
      email: userEmailTest,
      password: userPassTest,
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("access_token");
    accessToken = response.body.access_token;
  });
});

describe('Rota *POST* "/team"', () => {
  it("Deve criar um time", async () => {
    const response = await request(app)
      .post("/team")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Sport Club Corinthians Paulista",
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("team_id");
    createdTeamId = response.body.team_id;
  });
});

describe('Rota *POST* "/team"', () => {
  it("Deve criar outro time", async () => {
    const response = await request(app)
      .post("/team")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Vasco da Gama",
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("team_id");
    secondCreatedTeamId = response.body.team_id;
  });
});

describe('Rota *GET* "/team/:id"', () => {
  it("Deve retornar um time", async () => {
    const response = await request(app)
      .get(`/team/${createdTeamId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("team");
  });
});

describe('Rota *GET* "/team"', () => {
  it("Deve retornar todos os times", async () => {
    const response = await request(app)
      .get("/team")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("teams");
  });
});

describe('Rota *POST* "/player/"', () => {
  it("Deve criar um jogador", async () => {
    const response = await request(app)
      .post("/player")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Cássio Ramos",
        number: 12,
        teamId: createdTeamId,
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("player_id");
    createdPlayerId = response.body.player_id;
  });
});

describe('Rota *POST* "/player/"', () => {
  it("Deve criar outro jogador", async () => {
    const response = await request(app)
      .post("/player")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Roberto Dinamite",
        number: 10,
        teamId: secondCreatedTeamId,
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("player_id");
    secondCreatedPlayerId = response.body.player_id;
  });
});

describe('Rota *PUT* "/player/:id"', () => {
  it("Deve editar um jogador", async () => {
    const response = await request(app)
      .put(`/player/${secondCreatedPlayerId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Roberto Dinamite",
        number: 9,
        teamId: createdTeamId,
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("player");
  });
});

describe('Rota *DELETE* "/player/:id"', () => {
  it("Deve deletar um jogador", async () => {
    const response = await request(app)
      .delete(`/player/${createdPlayerId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("player");
  });
});

describe('Rota *PUT* "/team/:id"', () => {
  it("Deve editar um time", async () => {
    const response = await request(app)
      .put(`/team/${secondCreatedTeamId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Vasco da Gama Alterado",
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("team");
  });
});

describe('Rota *DELETE* "/team/:id"', () => {
  it("Deve deletar um time", async () => {
    const response = await request(app)
      .delete(`/team/${secondCreatedTeamId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });
});

describe('Rota *GET* "/team"', () => {
  it("Deve retornar todos os times", async () => {
    const response = await request(app)
      .get("/team")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("teams");
  });
});
