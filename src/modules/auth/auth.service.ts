import prisma from "../../config/prisma";
import { CreateUserInput } from "../user/user.model";
import { LoginUserInput } from "./auth.modal";

import { generateToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/hash";

export const signup = async (params: CreateUserInput) => {
    const { name, email, password } = params;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already exists");

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, provider: "Email" } });

    return { id: user.id, name: user.name, email: user.email };
};

export const login = async (params: LoginUserInput) => {
    const { email, password } = params;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await comparePassword(password, user.password!);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = generateToken(user.id);

    return {
        token,
        user: { id: user.id, name: user.name, email: user.email },
    };
};
