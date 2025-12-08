import { Request, Response } from "express";

export const helloworldController = async (req: Request, res: Response) => {
  res.send("hello world ");
};
