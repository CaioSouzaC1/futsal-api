import request from "supertest";
import app from "@src/index";

describe('Rota "/"', () => {
  it("Deve retornar 'hello, world!'", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(201);
    expect(response.text).toBe("Hello, world!");
  });
});
