import dotenv from "dotenv";
dotenv.config();

const serverConfig = {
  host: "0.0.0.0",
  port: (process.env.PORT as unknown as number) || 4000,
};

export { serverConfig };
