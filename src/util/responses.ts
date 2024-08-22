import Debug from "debug";
import type { Response} from "express";
import createError from "http-errors";

const debug = Debug("tappyfowl-api:server");
export const GAME_CLIENT_UNAUTHORIZED = new Error("Game Client Unauthorized");
export const sendError = (res: Response<any, Record<string, any>>, statusCode: number, error: Error | undefined = undefined) => {
  const err = createError(401);
  if (typeof err.headers === "object") {
    for (const [ k, v ] of Object.entries(err.headers)) {
      res.setHeader(k, v)
    }
  }
  if (error) {
    debug("ERROR: %s", error)
  }
  return res.status(err.statusCode).send(err.message)

}
