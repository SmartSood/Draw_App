import { z} from "zod";


export const CreateUserSchemma=z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    email:z.string().email()
})


export const CreateRoomSchemma=z.object({
    roomName: z.string().min(1, "Room name is required"),
});

export const SignInSchemma=z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});





