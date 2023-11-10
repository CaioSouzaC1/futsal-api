import request from "supertest";
import app from "@src/index";

describe('Rota "/user"', () => {
  it("Deve retornar um usuário", async () => {
    const response = await request(app).post("/user").send({
      name: "Jonas",
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
  });
});
