import { helloworldController } from "../controllers/helloworld.controller";
import express from "express";

const helloworldRouter = express.Router();

helloworldRouter.get("/helloworld", helloworldController);

export { helloworldRouter };
