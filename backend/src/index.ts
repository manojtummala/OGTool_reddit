import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import personaRoutes from "./routes/personas";
import router from "./routes/index";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/personas", personaRoutes);

app.use("/api", router);
// test route
app.get("/", (_, res) => {
  res.json({ message: "Backend running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});