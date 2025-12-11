import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { json } from "body-parser";
import { PrismaClient } from "@prisma/client";


export const prisma = new PrismaClient();

import companyRoutes from "./routes/company.routes";
import personaRoutes from "./routes/persona.routes";
import targetRoutes from "./routes/target.routes";
import weekRoutes from "./routes/week.routes";
import postRoutes from "./routes/post.routes";
import saveRouter from "./routes/save.routes";
import generateRouter from "./routes/generate.routes";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

app.use("/company", companyRoutes);
app.use("/persona", personaRoutes);
app.use("/target", targetRoutes);
app.use("/week", weekRoutes);
app.use("/post", postRoutes);
app.use("/save", saveRouter);
app.use("/generate", generateRouter);

app.get("/", (_, res) => res.send("Backend running 🚀"));

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));