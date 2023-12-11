import express from "express";
import UserAuthRoutes from "./routes/UserAuth";

import PreferencesRouter from "./routes/PreferencesHandlers";
import UserRecommendRoutes from "./routes/UserRecommend";

const app = express();
const port = 8080;

app.use(express.json());
app.use(UserAuthRoutes);
app.use(PreferencesRouter);
app.use(UserRecommendRoutes);

app.get("/", (_, res) => {
  res.status(200).send('<div align="center"><h1>Visitour API v1.0</h1></div>');
});
app.listen(port, () => {
  return console.log(`Running on port ${port}`);
});
