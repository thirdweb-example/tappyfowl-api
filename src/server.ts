import cookieParser from "cookie-parser";
import Debug from "debug";
import express from "express";
import http from "http";
import createError from "http-errors";
import logger from "morgan";
import { router as indexRouter } from "./routes";
import { normalizePort } from "./util/numbers";

const debug = Debug("tappyfowl-api:server");
Debug.enable("*");

const port = normalizePort(process.env.PORT || "3000");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", (error: any) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on("listening", () => {
  var addr = server.address();
  var bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr?.port;
  debug("Listening on " + bind);
});
