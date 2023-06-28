import sirv from "sirv";
import polka from "polka";
import bodyParser from "body-parser";
import compression from "compression";
import session from "express-session";
import sessionFileStore from "session-file-store";
import * as sapper from "@sapper/server";

import { authorise } from "./middleware/authentication";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

let id = dev ? "snake" : process.env.SNAKE_SESSION_SECRET;
if (typeof id === "undefined") {
  const crypto = require("crypto");
  id = crypto.randomBytes(20).toString("hex");
}

const FileStore = sessionFileStore(session);
const store = new FileStore({ path: `/tmp/sessions` });
const whitelist = [
  "/favicon.png",
  "/login",
  "/logo.png",
  "/service-worker.js",
  /\/client\/client-[a-z0-9]+\.css/,
  /\/client\/client\.[a-z0-9]+\.js/,
];

polka() // You can also use Express
  .use(
    bodyParser.json(),
    session({
      secret: id,
      resave: false,
      sameSite: true,
      saveUninitialized: true,
      secure: true,
      cookie: {
        maxAge: 12 * 60 * 60 * 1000,
      },
      store,
    }),
    authorise({ whitelist }),
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware({
      session: (req, res) => {
        res.setHeader("cache-control", "no-cache, no-store");
        return {
          auths: !!process.env.SNAKE_OAUTH_OPENID_URL,
          refresh: req.session.refresh,
          user: req.session.user,
        };
      },
    })
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
