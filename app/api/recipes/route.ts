import {NextResponse} from "next/server";
import {isAuthenticated} from "@/app/libs/auth";
import {Prisma, PrismaClient} from "@prisma/client";
import {createRecipeSchema} from "@/app/libs/recipes/validators";
import {getRecipesWithAvg, getRecipesWithIsLiked} from "@/prisma/utils";
import {uploadToDropbox} from "@/app/libs/utils";

export async function POST(request: Request) {
    const user = await isAuthenticated(request);
    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    const prisma = new PrismaClient();

    const {value, error} = createRecipeSchema.validate(await request.json());
    if (error) {
        await prisma.$disconnect();
        return NextResponse.json({error: error.details}, {status: 422});
    }

    try {
        const {title, steps, ingredients, image} = value;

        const imageBase64 = image.split(",")[1];
        const imageBuffer = Buffer.from(imageBase64, "base64");
        const imageName = `${Date.now()}-${Math.random() * 10000}.png`;
        const url = await uploadToDropbox(imageBuffer, imageName);

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
                image: url,
            },
            include: {
                ingredients: true,
                steps: true,
            }
        });

        await prisma.$disconnect();
        return NextResponse.json(recipe, {status: 200});
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            await prisma.$disconnect();
            return NextResponse.json({error: error.message}, {status: 422});
        }
        console.error(error);
        await prisma.$disconnect();
        return NextResponse.json({}, {status: 500});
    }
}

export async function GET(request: Request) {
    const prisma = new PrismaClient();

    let recipes = await prisma.recipe.findMany();

    recipes = await getRecipesWithAvg(recipes, prisma);

    const user = await isAuthenticated(request);
    if (user) {
        recipes = await getRecipesWithIsLiked(recipes, prisma, user.id)
    }

    await prisma.$disconnect();
    return NextResponse.json(recipes, {status: 200});
}