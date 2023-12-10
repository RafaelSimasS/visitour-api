"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserAuth_1 = __importDefault(require("./routes/UserAuth"));
const PreferencesHandlers_1 = __importDefault(require("./routes/PreferencesHandlers"));
const app = (0, express_1.default)();
const port = 8080;
app.use(express_1.default.json());
app.use(UserAuth_1.default);
app.use(PreferencesHandlers_1.default);
app.get("/", (_, res) => {
    res.status(200).send('<div align="center"><h1>Visitour API v1.0</h1></div>');
});
app.listen(port, () => {
    return console.log(`Running on port ${port}`);
});
//# sourceMappingURL=server.js.map