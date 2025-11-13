import axios from "axios";
import prisma from "../../../config/prisma";
import { AuthProvider } from "@prisma/client";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI!;

// Step 1: Generate the GitHub authorization URL
export const getGitHubAuthURL = (): string => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: "read:user user:email",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

// Step 2: Exchange the authorization code for an access token
export const getGitHubAccessToken = async (code: string) => {
  const { data } = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    },
    {
      headers: { Accept: "application/json" },
    }
  );
  if (!data.access_token) throw new Error("Failed to get GitHub access token");
  return data.access_token;
};

// Step 3: Fetch GitHub user info
export const getGitHubUser = async (accessToken: string) => {
  const [userRes, emailsRes] = await Promise.all([
    axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  ]);
  const primaryEmail = emailsRes.data.find((e: any) => e.primary)?.email;
  console.log('primaryEmail', primaryEmail);
  console.log('userRes', userRes.data.name);
  return {
    email: primaryEmail,
    name: userRes.data.name || userRes.data.login,
  };
};

// Step 4: Upsert user in DB
export const authenticateGitHubUser = async (email: string, name: string) => {
  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      name,
      email,
      provider: AuthProvider.Github,
    },
  });
};
