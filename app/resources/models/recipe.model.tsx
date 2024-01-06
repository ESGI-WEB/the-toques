import {User} from "@/app/resources/models/user.model";

export interface Recipe {
    id: number;
    title: string;
    ingredients?: Ingredient[];
    steps?: Step[];
    image: string;
    marks?: Mark[];
    isLiked?: boolean;
    marksAvg?: number;
    marksCount?: number;
    authorId: number;
    calories?: number;
    plates: number;
}

export interface Ingredient {
    id: number;
    name: string;
    quantity: string;
}

export interface Step {
    id: number;
    name: string;
    description: string;
}

export interface Mark {
    id: number;
    user: User;
    title?: string;
    content?: string;
    mark: number;
    createdAt: string;
}