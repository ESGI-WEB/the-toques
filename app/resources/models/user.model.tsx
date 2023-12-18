export const USER_ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
}

export interface User {
    id: number;
    firstName: string,
    role: string,
    email: string,
    preferences: string,
    _count?: any,
}