import prisma from "../../config/prisma";
import { CreateUserInput } from "./user.model";

export const createUser = async (data: CreateUserInput) => {
  return await prisma.user.create({ data });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany();
};
