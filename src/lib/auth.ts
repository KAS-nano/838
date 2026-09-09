import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { getPrisma } from "./prisma";
import { getAuthConfiguration, sendAuthEmail } from "./auth-config";

export function createAuth(){
  const config = getAuthConfiguration();
  return betterAuth({
    appName: "838",
    baseURL: config.baseURL,
    secret: config.secret,
    trustedOrigins: config.trustedOrigins,
    database: prismaAdapter(getPrisma(),{provider:"postgresql"}),
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 3600,
      sendVerificationEmail: ({ user, url }) => sendAuthEmail("verification", user.email, url),
    },
    emailAndPassword:{
      enabled:true,
      requireEmailVerification: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 1800,
      sendResetPassword: ({ user, url }) => sendAuthEmail("password-reset", user.email, url),
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, window: 60, max: 10 },
    advanced:{database:{joins:true}},
  });
}
