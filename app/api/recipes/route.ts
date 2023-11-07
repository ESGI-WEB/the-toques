import {NextResponse} from "next/server";
import {isAuthenticated} from "@/app/libs/auth";
import {Prisma, PrismaClient} from "@prisma/client";
import {createRecipeSchema} from "@/app/libs/recipes/validators";

export async function POST(request: Request) {
    const user = await isAuthenticated(request);
    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    const prisma = new PrismaClient();

    const {value, error} = createRecipeSchema.validate(await request.json());
    if (error) {
        return NextResponse.json({error: error.details}, {status: 422});
    }

    try {
        const {title, steps, ingredients} = value;
        const recipe = await prisma.recipe.create({
            data: {
                title,
                authorId: user.id,
                ingredients: {
                    create: ingredients,
                },
                steps: {
                    create: steps,
                },
            },
            include: {
                ingredients: true,
                steps: true,
            }
        });

        return NextResponse.json(recipe, {status: 200});
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({error: error.message}, {status: 422});
        }
        console.error(error);
        return NextResponse.json({}, {status: 500});
    }
}

export async function GET() {
    const prisma = new PrismaClient();
    const recipes = await prisma.recipe.findMany({
        include: {
            ingredients: true,
            steps: true,
            author: {
                select: {
                    firstName: true,
                }
            }
        }
    });
    return NextResponse.json(recipes, {status: 200});
}