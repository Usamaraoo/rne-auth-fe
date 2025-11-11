import axios from "axios";
import querystring from "querystring";
import prisma from "../../../config/prisma";
import { AuthProvider } from "@prisma/client";
import { generateToken } from "../../../utils/jwt";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI!;

// Step 1: Generate LinkedIn authorization URL
export const getLinkedInAuthURL = (): string => {
    const params = new URLSearchParams({
        response_type: "code",
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        scope: "openid profile email",
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

// Step 2: Exchange code for access token
export const getLinkedInAccessToken = async (code: string) => {
    const body = querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
    });

    const { data } = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        body,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return data.access_token;
};

// Step 3: Fetch user info
export const getLinkedInUser = async (accessToken: string) => {
    const profileRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    return { email: profileRes.data?.email, name: profileRes.data.name };

};

// Step 4: Upsert user in DB
export const authenticateLinkedInUser = async (email: string, name: string) => {

    const user = await prisma.user.upsert({
        where: { email },
        update: { name },
        create: {
            email,
            name,
            provider: AuthProvider.LinkedIn,
        },
    });
    const token = generateToken(user.id);
    return { token, user };

};
