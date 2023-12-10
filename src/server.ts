import express from "express";
import UserAuthRoutes from "./routes/UserAuth";

import PreferencesRouter from "./routes/PreferencesHandlers";

const app = express();
const port = 5000;

app.use(express.json());
app.use(UserAuthRoutes);
app.use(PreferencesRouter);

app.get("/", (_, res) => {
  res.status(200).send('<div align="center"><h1>Visitour API v1.0</h1></div>');
});
app.listen(port, () => console.log(`Running on port ${port}`));
