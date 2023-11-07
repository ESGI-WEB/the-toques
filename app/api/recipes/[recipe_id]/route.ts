import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

export interface GETRecipeParams {
    recipe_id: number;
}

export async function GET(request: Request, {params}: { params: GETRecipeParams }) {
    const prisma = new PrismaClient();
    const {recipe_id} = params;

    const recipe = await prisma.recipe.findUnique({
        where: {
            id: Number(recipe_id),
        },
        include: {
            ingredients: true,
            steps: true,
            marks: true,
        }
    })

    if (!recipe) {
        return NextResponse.json({}, {status: 404});
    }

    return NextResponse.json(recipe, {status: 200});
}