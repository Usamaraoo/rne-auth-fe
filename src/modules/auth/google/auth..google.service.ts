import prisma from "../../../config/prisma";


import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import { AuthProvider, User } from "@prisma/client";
import { generateToken } from "../../../utils/jwt";

dotenv.config();

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});


// Redirect User to google login
export const getGoogleAuthURL = (): string => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  return url;
};


// Get user from google
export const getGoogleUser = async (code: string) => {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Fetch user profile from Google
  const response = await client.request({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
  });

  return response.data;
};

export const authenticateGoogleUser = async (email: string, name: string): Promise<{ token: string; user: User }> => {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      name,
      email,
      provider: AuthProvider.Google
    },
  });
  const token = generateToken(user.id);

  return { token, user };
};



