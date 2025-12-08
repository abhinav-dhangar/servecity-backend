import { Express } from "express";
import { router } from "../routes/index.router";

export class InitializeRoutes {
  public static async init(app: Express) {
    app.use("/", router);
  }
}
