import {NextResponse} from "next/server";
import {isAuthenticated} from "@/app/libs/auth";
import {Prisma, PrismaClient} from "@prisma/client";
import {createRecipeMarkSchema} from "@/app/libs/marks/validators";
import {GETRecipeParams} from "@/app/api/recipes/[recipe_id]/route";
import {userSelect} from "@/prisma/utils";

export async function POST(request: Request, {params}: { params: GETRecipeParams }) {
    const user = await isAuthenticated(request);
    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    const {value, error} = createRecipeMarkSchema.validate(await request.json());
    if (error) {
        return NextResponse.json({error: error.details}, {status: 422});
    }

    const prisma = new PrismaClient();
    const {recipe_id} = params;

    if (!(await prisma.recipe.findUnique({
        where: {id: Number(recipe_id)}
    }))) {
        return NextResponse.json({}, {status: 404});
    }

    try {
        const {title = null, content = null, mark} = value;
        const savedMark = await prisma.mark.create({
            data: {
                recipeId: Number(recipe_id),
                userId: user.id,
                title,
                content,
                mark
            },
            include: {
                user: {
                    ...userSelect
                }
            }
        });

        return NextResponse.json(savedMark, {status: 200});
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({error: error.message}, {status: 422});
        }
        console.error(error);
        return NextResponse.json({}, {status: 500});
    }
}

export async function GET(request: Request, {params}: { params: GETRecipeParams }) {
    const prisma = new PrismaClient();
    const {recipe_id} = params;

    if (!(await prisma.recipe.findUnique({
        where: {id: Number(recipe_id)}
    }))) {
        return NextResponse.json({}, {status: 404});
    }

    const marks = await prisma.mark.findMany({
        where: {
            recipeId: Number(recipe_id),
        },
        include: {
            user: {
                ...userSelect
            }
        }
    })

    return NextResponse.json(marks ?? [], {status: 200});
}