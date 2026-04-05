import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      // Decode state to get returnPath
      let returnPath = "/";
      try {
        const decodedState = JSON.parse(atob(state));
        if (decodedState.returnPath) {
          returnPath = decodedState.returnPath;
        }
      } catch (e) {
        console.warn("[OAuth] Failed to parse state for returnPath", e);
      }

      // Determine userType from the returnPath
      let userType: 'candidate' | 'company' = 'candidate';
      if (returnPath.includes('/company')) {
        userType = 'company';
      }

      // Check if user already exists
      const existingUser = await db.getUserByOpenId(userInfo.openId);

      // For existing users: respect the returnPath they chose
      // This allows the same user to switch between candidate and company views
      // The returnPath from the login button determines where they go
      if (!existingUser) {
        // New user: upsert with the chosen userType
        await db.upsertUser({
          openId: userInfo.openId,
          userType,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: new Date(),
        });
      } else {
        // Existing user: just update lastSignedIn, keep their existing userType
        await db.upsertUser({
          openId: existingUser.openId,
          userType: existingUser.userType as 'candidate' | 'company',
          lastSignedIn: new Date(),
        });
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Always redirect to the returnPath the user chose from the landing page
      // This ensures clicking "Sou Empresa" goes to company dashboard
      // and clicking "Sou Candidato" goes to candidate dashboard
      res.redirect(302, returnPath);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
