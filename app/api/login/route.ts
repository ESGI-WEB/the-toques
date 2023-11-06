import {SignJWT} from "jose";
import {NextResponse} from "next/server";
import {getJwtSecretKey} from "@/app/libs/auth";
import {PrismaClient} from "@prisma/client";

export async function POST(request: Request) {
    const {email, password} = await request.json();
    const prisma = new PrismaClient();
    const bcrypt = require("bcrypt");

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    const isPasswordMatched = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatched) {
        return NextResponse.json({}, {status: 401});
    }

    const token = await new SignJWT({
        id: user.id,
        email,
        firstName: user.firstName,
        role: user.role,
    })
        .setProtectedHeader({alg: "HS256"})
        .sign(getJwtSecretKey());

    return NextResponse.json(
        {token},
        {status: 200, headers: {"content-type": "application/json"}}
    );
}