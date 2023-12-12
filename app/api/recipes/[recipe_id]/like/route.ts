import {GETRecipeParams} from "@/app/api/recipes/[recipe_id]/route";
import {PrismaClient} from "@prisma/client";
import {isAuthenticated} from "@/app/libs/auth";
import {NextResponse} from "next/server";

export async function POST(request: Request, {params}: { params: GETRecipeParams }) {
    const {recipe_id} = params;
    const prisma = new PrismaClient();

    const user = await isAuthenticated(request);
    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    // create like if not already liked
    const like = await prisma.like.findFirst({
        where: {
            recipeId: Number(recipe_id),
            userId: user.id,
        }
    });

    if (like) {
        return NextResponse.json({message: 'recipe already liked'}, {status: 403});
    }

    const savedLike = await prisma.like.create({
        data: {
            recipeId: Number(recipe_id),
            userId: user.id,
        }
    });

    return NextResponse.json(savedLike, {status: 200});
}

export async function DELETE(request: Request, {params}: { params: GETRecipeParams }) {
    const {recipe_id} = params;
    const prisma = new PrismaClient();

    const user = await isAuthenticated(request);
    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    const like = await prisma.like.findFirst({
        where: {
            recipeId: Number(recipe_id),
            userId: user.id,
        }
    });

    if (!like) {
        return NextResponse.json({message: 'recipe not liked'}, {status: 403});
    }

    await prisma.like.delete({
        where: {
            id: like.id,
        }
    });

    return new Response(null, {status: 204});
}