import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const cache = {
  expires: 0,
  jwks: [],
  metadata: {},
};

const check = (path, arr) =>
  arr.some((w) => {
    if (typeof w === "string" && w === path) {
      return true;
    }
    if (w instanceof RegExp && w.test(path)) {
      return true;
    }
    return false;
  });

export function isExpired(token) {
  if (!token) {
    return true;
  }
  const atob = process.browser
    ? window.atob
    : (value) => Buffer.from(value, "base64").toString();
  const parts = token.split(".");
  if (parts.length !== 3) {
    return true;
  }
  const claims = JSON.parse(atob(parts[1]));
  if (claims.exp && new Date(claims.exp * 1000) - 30 < new Date()) {
    return true;
  }
  return false;
}

export function authorise({ whitelist }) {
  return async (req, res, next) => {
    if (typeof process.env.SNAKE_OAUTH_OPENID_URL === "undefined") {
      if (req.path.startsWith("/login")) {
        res.writeHead(302, {
          Location: "/",
        });
        res.end();
      } else {
        next();
      }
      return;
    }
    const { default: fetch } = await import("node-fetch");
    if (cache.expires < new Date()) {
      console.debug("updating cache...");
      let response;
      response = await fetch(process.env.SNAKE_OAUTH_OPENID_URL);
      const metadata = await response.json();
      response = await fetch(metadata["jwks_uri"]);
      const jwks = await response.json();
      cache.jwks = jwks["keys"];
      cache.metadata = metadata;
      const date = new Date();
      date.setUTCDate(date.getUTCDate() + 1);
      cache.expires = date;
    }

    if (req.path === "/authorize") {
      const { code, state } = req.query;
      const data = {
        client_id: process.env.SNAKE_OAUTH_CLIENT_ID,
        client_secret: process.env.SNAKE_OAUTH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.SNAKE_OAUTH_REDIRECT,
      };
      const response = await fetch(cache.metadata.token_endpoint, {
        body: new URLSearchParams(data).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });
      const tokens = await response.json();
      if (tokens.error) {
        console.error(tokens);
        req.session.destroy((err) => {
          if (err) {
            console.error(
              err,
              "failed to destroy session after /authorize error"
            );
          } else {
            res.writeHead(302, {
              Location: "/?auth=fail",
            });
            res.end();
          }
        });
        return;
      }
      const token = tokens.access_token;
      try {
        var stuff = jwt.decode(token, { complete: true });
        var { header } = jwt.decode(token, { complete: true });
        const pem = (data) => {
          let cert = data.match(/.{1,64}/g).join("\n");
          cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
          return cert;
        };
        const signingKey = cache.jwks.find((k) => k.kid === header.kid);
        var decoded = jwt.verify(token, pem(signingKey.x5c[0]), {
          algorithms: [header.alg],
        });
      } catch (err) {
        console.error({ err });
        res.writeHead(302, {
          Location: "/?auth=fail",
        });
        res.end();
      }
      const user = decoded.preferred_username ?? decoded.upn ?? decoded.email;
      console.log(`~> Authorised user ${user}`);
      req.session.refresh = {
        expires: tokens.refresh_token_expires_in,
        uuid: uuidv4(),
      };
      req.session.tokens = tokens;
      req.session.user = user;
      res.writeHead(302, {
        Location: "/?auth=success",
      });
      res.end();
    } else if (req.path === "/auth/login") {
      // TODO: Save state to validate....
      const params = {
        response_type: "code",
        scope: process.env.SNAKE_OAUTH_SCOPES ?? null,
        state: crypto.randomBytes(20).toString("hex"),
        redirect_uri: process.env.SNAKE_OAUTH_REDIRECT,
        client_id: process.env.SNAKE_OAUTH_CLIENT_ID,
      };
      const query = new URLSearchParams(params);
      const url = `${
        cache.metadata.authorization_endpoint
      }?${query.toString()}`;
      const reason = "Redirecting to SSO platform...";
      res.writeHead(302, {
        Location: url,
        "Content-Type": "text/plain",
        "Content-Length": reason.length,
      });
      res.end(reason);
    } else if (req.path === "/auth/logout") {
      req.session.destroy((err) => {
        if (err) {
          console.error(err, "failed to destroy session during logout");
        } else {
          res.writeHead(302, {
            Location: "/login",
          });
          res.end();
        }
      });
    } else if (req.session.tokens || check(req.path, whitelist)) {
      if (req.session.tokens && isExpired(req.session.tokens.access_token)) {
        let error = false;
        try {
          if (!req.session.tokens.refresh_token) {
            console.warn("refresh token is missing...");
          }
          const data = {
            client_id: process.env.SNAKE_OAUTH_CLIENT_ID,
            client_secret: process.env.SNAKE_OAUTH_CLIENT_SECRET,
            refresh_token: req.session.tokens.refresh_token,
            grant_type: "refresh_token",
            redirect_uri: process.env.SNAKE_OAUTH_REDIRECT,
            scope: process.env.SNAKE_OAUTH_SCOPES ?? null,
          };
          const response = await fetch(cache.metadata.token_endpoint, {
            body: new URLSearchParams(data).toString(),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
          });
          const tokens = await response.json();
          if (tokens.error) {
            console.error(
              tokens.error,
              "failed to get a new token via the refresh token"
            );
            error = true;
          } else {
            req.session.tokens = Object.assign(req.session.tokens, tokens);
          }
        } catch (err) {
          console.warn(err, "failed to refresh tokens");
          error = true;
        }
        if (error) {
          console.warn("failed to refresh token");
          req.session.destroy((err) => {
            if (err) {
              console.error(
                err,
                "failed to destroy session after token refresh error"
              );
            } else {
              res.writeHead(302, {
                Location: "/login",
              });
              res.end();
            }
          });
          return;
        }
      }
      next();
    } else {
      console.info({ path: req.path, query: req.query }, "blocked");
      if (req.path === "/api") {
        res.writeHead(401, "Snake - Invalid Session");
        res.end();
      } else if (req.session.tokens) {
        next();
      } else if (
        req.path.endsWith(".css") ||
        req.path.endsWith(".eot") ||
        req.path.endsWith(".js") ||
        req.path.endsWith(".png") ||
        req.path.endsWith(".svg") ||
        req.path.endsWith(".ttf") ||
        req.path.endsWith(".woff") ||
        req.path.endsWith(".woff2")
      ) {
        res.writeHead(401, "Snake - Invalid Session");
        res.end();
      } else {
        res.writeHead(302, {
          Location: "/login",
        });
        res.end();
      }
    }
  };
}
