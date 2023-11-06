import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {encryptPassword, isAdmin, isAuthenticated} from "@/app/libs/auth";

export async function POST(request: Request) {
    const {
        email = null,
        firstName = null,
        password = null,
    } = await request.json();

    if (!email || !firstName || !password) {
        return NextResponse.json({}, {status: 422});
    }

    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
    if (!passwordRegex.test(password)) {
        return NextResponse.json({
            error: 'Password must contains at least an uppercase, a lowercase and a number and be a minimum of 8 caracters'},
            {status: 422}
        );
    }

    const prisma = new PrismaClient();

    if (prisma.user.findUnique({where: {email}}) !== null) {
        return NextResponse.json({error: 'Email already exists'}, {status: 422});
    }

    await prisma.user.create({
        data: {
            email,
            firstName,
            password: encryptPassword(password),
        }
    });

    return NextResponse.json({}, {status: 200});
}

export async function GET(request: Request) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({}, {status: 401});
    }

    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            role: true,
        },
    });

    return NextResponse.json(users, {status: 200});

}