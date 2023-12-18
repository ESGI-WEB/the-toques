import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {encryptPassword, isAdmin} from "@/app/libs/auth";
import {createUserSchema} from "@/app/libs/users/validators";
import {userSelectProtected} from "@/prisma/utils";

export async function POST(request: Request) {
    const {value, error} = createUserSchema.validate(await request.json());
    if (error) {
        return NextResponse.json({error: error.details}, {status: 422});
    }

    const {
        email,
        firstName,
        password,
    } = value;

    const prisma = new PrismaClient();

    if (await prisma.user.findUnique({where: {email}}) !== null) {
        await prisma.$disconnect();
        return NextResponse.json({error: 'Email already exists'}, {status: 422});
    }

    await prisma.user.create({
        data: {
            email,
            firstName,
            password: encryptPassword(password),
        }
    });

    await prisma.$disconnect();
    return NextResponse.json({}, {status: 200});
}

export async function GET(request: Request) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({}, {status: 401});
    }

    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({
        ...userSelectProtected
    });

    await prisma.$disconnect();
    return NextResponse.json(users, {status: 200});
}