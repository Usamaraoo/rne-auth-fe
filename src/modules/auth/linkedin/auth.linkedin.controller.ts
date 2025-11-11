import { Request, Response, NextFunction } from "express";
import {
    getLinkedInAuthURL,
    getLinkedInAccessToken,
    getLinkedInUser,
    authenticateLinkedInUser,
} from "./auth.linkedin.service";
import { errorResponse, successResponse } from "../../../utils/response";

export const linkedInAuth = (req: Request, res: Response) => {
    const url = getLinkedInAuthURL();
    return res.redirect(url);
};

export const linkedInCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.query.code as string;
        const accessToken = await getLinkedInAccessToken(code);
        const { email, name } = await getLinkedInUser(accessToken);
        const user = await authenticateLinkedInUser(email, name);

        // Optionally create JWT & set cookie
        res.cookie("token", user.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return successResponse(res, user, "LinkedIn login success");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};
