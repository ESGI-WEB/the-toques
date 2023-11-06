import {jwtVerify} from "jose";
import {PrismaClient, User} from "@prisma/client";

export function getJwtSecretKey() {
    const secret = process.env.NEXT_PUBLIC_JWT_SECRET_KEY;
    if (!secret) {
        throw new Error("JWT Secret key is not matched");
    }
    return new TextEncoder().encode(secret);
}

export async function verifyJwtToken(token: string | Uint8Array) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        return payload;
    } catch (error) {
        return null;
    }
}

export function encryptPassword(password: string): any {
    const bcrypt = require("bcrypt");
    return bcrypt.hashSync(password, 10);
}

export async function isAuthenticated(request: Request) {
    const authorization = request.headers.get("authorization");
    if (!authorization) {
        return false;
    }
    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") {
        return false;
    }
    return await verifyJwtToken(token);
}

export async function isAdmin(request: any) {
    const payload = (await isAuthenticated(request)) as unknown as UserPayload;
    if (!payload) {
        return false;
    }

    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
        where: {id: payload.id}
    }) as User|null;

    if (!user) {
        return false;
    }

    return user.role === "ADMIN";
}

export interface UserPayload {
    id: number;
    email: string;
    firstName: string;
    role: string;
}