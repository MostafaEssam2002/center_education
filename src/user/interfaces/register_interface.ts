import { Role } from "./role";
export interface RegisterResponse {
    message: string;
    user: {
        id: number;
        first_name: string | null;
        last_name: string | null;
        email: string;
        age: number | null;
        phone?: string | null;
        address?: string | null;
        role: Role;
        image_path?: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
}
