import request from "supertest";
import app from "@src/index";

describe('Rota "/user/create"', () => {
  it("Deve retornar um usuário", async () => {
    const response = await request(app).post("/user/create").send({
      name: "Jonas",
      email: "emailemail5@email.com.br",
      password: "123456",
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("message");
  });
});
