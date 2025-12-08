import { Express } from "express";
import { CommonMiddleware } from "../middlewares/commonMiddleware";

export class InitializeMiddleWare {
  public static async InitializeCommonMiddleware(app: Express) {
    let middleware = new CommonMiddleware(app);

    await middleware.useBodyParser();
    await middleware.useURLencoded();
    await middleware.useCors();

    await middleware.useStaticFiles();
  }
}
