import { Redis } from "@upstash/redis";
require("dotenv").config();
const redis = Redis.fromEnv();

export { redis as redisClient };
