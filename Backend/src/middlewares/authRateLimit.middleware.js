import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../db/redis.js";

export const redisAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }),
  message: {
    success: false,
    message: "Too many login attempts. Try again later"
  }
});
