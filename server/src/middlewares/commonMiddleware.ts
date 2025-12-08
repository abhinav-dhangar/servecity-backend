import express, { Express } from "express";
let cors = require("cors");
import path from "path";
export class CommonMiddleware {
  app: Express;

  constructor(_app: Express) {
    this.app = _app;
  }

  public async useBodyParser() {
    this.app.use(express.json());
  }

  public async useURLencoded() {
    this.app.use(
      express.urlencoded({
        extended: true,
      })
    );
  }

  public async useStaticFiles() {
    const filesPath = path.join(__dirname, "../../files");

    this.app.use(express.static(filesPath));
  }

  public async useCors() {
    this.app.use(
      cors({
        origin: ["http://localhost:3000","http://localhost:3001"], // Next.js frontend
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "deviceId",
          "x-requested-with",
          "Accept",
          "Origin",
        ],
        credentials: true,
      })
    );

    this.app.options("*", cors()); // Allow preflight
  }
}
   