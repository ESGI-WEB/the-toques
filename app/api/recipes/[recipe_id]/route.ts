import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {isAuthenticated} from "@/app/libs/auth";
import {getRecipeWithAvg, getRecipeWithIsLiked, userSelect} from "@/prisma/utils";

export interface GETRecipeParams {
    recipe_id: number;
}

export async function GET(request: Request, {params}: { params: GETRecipeParams }) {
    const {recipe_id} = params;
    const prisma = new PrismaClient();

    let recipe = await prisma.recipe.findUnique({
        where: {
            id: Number(recipe_id),
        },
        include: {
            ingredients: true,
            steps: true,
            marks: {
                include: {
                    user: {
                        ...userSelect
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                }
            },
        }
    }) as any;

    if (!recipe) {
        return NextResponse.json({}, {status: 404});
    }

    recipe = await getRecipeWithAvg(recipe, prisma);

    const user = await isAuthenticated(request);
    if (user) {
        recipe = await getRecipeWithIsLiked(recipe, prisma, user.id);
    }

    return NextResponse.json(recipe, {status: 200});
}

export async function DELETE(request: Request, {params}: { params: { recipe_id: number } }) {
    const user = await isAuthenticated(request);
    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    const prisma = new PrismaClient();
    const {recipe_id} = params;

    const recipe = await prisma.recipe.findUnique({
        where: {
            id: Number(recipe_id),
        }
    });

    if (!recipe) {
        return NextResponse.json({}, {status: 404});
    }

    if (recipe.authorId !== user.id) {
        return NextResponse.json({}, {status: 403});
    }

    const recipeId = Number(recipe_id);
    await prisma.$transaction([
        prisma.like.deleteMany({
            where: {
                recipeId,
            }
        }),
        prisma.mark.deleteMany({
            where: {
                recipeId,
            }
        }),
        prisma.recipeStep.deleteMany({
            where: {
                recipeId,
            }
        }),
        prisma.recipeIngredient.deleteMany({
            where: {
                recipeId,
            }
        }),
        prisma.recipe.delete({
            where: {
                id: Number(recipe_id),
            }
        }),
    ]);

    return new Response(null, {status: 204});
}