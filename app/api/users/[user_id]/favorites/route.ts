import {isAuthenticated} from "@/app/libs/auth";
import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {getRecipesWithAvg, getRecipesWithIsLiked} from "@/prisma/utils";

export async function GET(request: Request) {
    const user = await isAuthenticated(request);
    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    const prisma = new PrismaClient();

    let likedRecipes = await prisma.recipe.findMany({
        where: {
            likes: {
                some: {
                    userId: user.id,
                }
            }
        }
    });

    likedRecipes = await getRecipesWithAvg(likedRecipes, prisma);
    likedRecipes = await getRecipesWithIsLiked(likedRecipes, prisma, user.id);
    return NextResponse.json(likedRecipes, {status: 200});
}
