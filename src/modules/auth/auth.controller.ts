import { Request, Response } from "express";
import * as authService from "./auth.service"
import { CreateUserInput } from "../user/user.model";
import { errorResponse, successResponse } from "../../utils/response";
import { LoginUserInput } from "./auth.modal";



export const signupHandler = async (
    req: Request<{}, {}, CreateUserInput>,
    res: Response
) => {
    try {
        const user = await authService.signup(req.body);
        return successResponse(res, user, "Signup successful");
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const loginHandler = async (
    req: Request<{}, {}, LoginUserInput>,
    res: Response
) => {
    try {
        const data = await authService.login(req.body);
        // Set cookie (secure & httpOnly)
        res.cookie("token", data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return successResponse(res, data, "Login successful");
    } catch (err: any) {
        return errorResponse(res, err.message, 400);
    }
};
