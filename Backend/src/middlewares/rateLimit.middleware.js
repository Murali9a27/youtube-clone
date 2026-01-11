import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../db/redis.js";

export const redisGeneralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }),
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
});
