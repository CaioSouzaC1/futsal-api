import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(201).send("Hello, world!");
});

app.post("/user", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      name: req.body.name,
    },
  });
  return res.json(user);
});

const server = app.listen(port, () => {
  //   console.log(`Server is running at http://localhost:${port}`);
});

export default app;

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});
