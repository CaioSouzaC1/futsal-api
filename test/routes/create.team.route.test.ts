import request from "supertest";
import app from "@src/index";

describe('Rota "/team"', () => {
  it("Deve criar um time", async () => {
    const response = await request(app).post("/team").send({
      name: "Sport Club Corinthians Paulista",
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
  });
});
