import { Request, Response, NextFunction } from "express";
import {
    getGitHubAuthURL,
    getGitHubAccessToken,
    getGitHubUser,
    authenticateGitHubUser,
} from "./auth.github.service";
import jwt from "jsonwebtoken";
import { errorResponse, successResponse } from "../../../utils/response";
import dotenv from "dotenv";

export const githubAuth = (req: Request, res: Response) => {
    const url = getGitHubAuthURL();
    return res.redirect(url);
};
dotenv.config();

export const githubCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.query.code as string;
        const accessToken = await getGitHubAccessToken(code);
        const { email, name } = await getGitHubUser(accessToken);
        const user = await authenticateGitHubUser(email, name);
        // Create JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        // Set JWT in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return successResponse(res, user, "GitHub login success");
    } catch (err: any) {
        // return errorResponse(res, err.message);
    }
};
