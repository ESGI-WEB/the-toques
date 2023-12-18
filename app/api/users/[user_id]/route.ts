import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {isAuthenticated} from "@/app/libs/auth";
import {userSelectProtected} from "@/prisma/utils";

export async function GET(request: Request, {params}: { params: { user_id: string } }) {
    const loggedInUser = await isAuthenticated(request);
    if (!loggedInUser) {
        return new NextResponse(null, {status: 401});
    }

    if (loggedInUser.id !== Number(params.user_id)) {
        return new NextResponse(null, {status: 403});
    }

    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
        select: {
            ...userSelectProtected.select,
            _count: {
                select: {
                    recipes: true,
                    marks: true,
                    likes: true,
                }
            },
        },
        where: {
            id: Number(params.user_id)
        },
    });
    await prisma.$disconnect();

    return new NextResponse(JSON.stringify(user));
}

export async function PUT(request: Request, {params}: { params: { user_id: string } }) {
    const loggedInUser = await isAuthenticated(request);
    if (!loggedInUser) {
        return new NextResponse(null, {status: 401});
    }

    if (loggedInUser.id !== Number(params.user_id)) {
        return new NextResponse(null, {status: 403});
    }

    const editableFields = ["firstName", "email", "password", "preferences"];
    const body = await request.json();
    if (!body) {
        return new NextResponse(null, {status: 403});
    }

    // check if the body contains uneditable fields
    const uneditableFields = Object.keys(body).filter((field) => !editableFields.includes(field));
    if (uneditableFields.length > 0) {
        return new NextResponse(null, {status: 403});
    }

    const prisma = new PrismaClient();
    const user = await prisma.user.update({
        where: {
            id: Number(params.user_id),
        },
        data: {
            ...body,
        },
        ...userSelectProtected,
    });
    await prisma.$disconnect();
    return new NextResponse(JSON.stringify(user));
}

export async function DELETE(request: Request, {params}: { params: { user_id: string } }) {
    const loggedInUser = await isAuthenticated(request);
    if (!loggedInUser) {
        return new NextResponse(null, {status: 401});
    }

    if (loggedInUser.id !== Number(params.user_id)) {
        return new NextResponse(null, {status: 403});
    }

    const prisma = new PrismaClient();
    const userId = Number(params.user_id);
    const recipe = {
        authorId: userId,
    };
    await prisma.$transaction([
        prisma.like.deleteMany({
            where: {
                userId,
            }
        }),
        prisma.mark.deleteMany({
            where: {
                userId,
            }
        }),
        prisma.like.deleteMany({
            where: {
                recipe,
            }
        }),
        prisma.mark.deleteMany({
            where: {
                recipe,
            }
        }),
        prisma.recipeStep.deleteMany({
            where: {
                recipe,
            }
        }),
        prisma.recipeIngredient.deleteMany({
            where: {
                recipe,
            }
        }),
        prisma.recipe.deleteMany({
            where: {
                authorId: userId,
            }
        }),
        prisma.user.delete({
            where: {
                id: userId,
            },
        }),
    ]);
    await prisma.$disconnect();
    return new Response(null, {status: 204});
}