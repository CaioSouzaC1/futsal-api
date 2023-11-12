import request from "supertest";
import app from "@src/index";

describe('Rota "/user/login"', () => {
  it("Deve logar um usuário", async () => {
    const response = await request(app).post("/user/login").send({
      email: "emailemail4@email.com.br",
      password: "123456",
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });
});
