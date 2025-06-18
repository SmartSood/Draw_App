import express,{request, Request,Response} from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {CreateUserSchemma,SignInSchemma,CreateRoomSchemma} from "@repo/common/types"
import { prismaClient } from "@repo/db/index";
import { SALT_ROUNDS } from "@repo/backend-common/config";
import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from "../../../packages/db/src/generated/prisma/runtime/library";
import cors from 'cors'




const app=express();
app.use(express.json())
app.use(cors())
app.post("/signup",async (
    req:Request,
    res:Response
)=>{
    const {username,password,email}=req.body;
    // Validate the request body against the schema
   
    if(!username || !password||!email){
        res.send("Username and password are required");
        return
    }

    const validation = CreateUserSchemma.safeParse({username,password,email})
    if (!validation.success) {
        res.status(400).json({ errors: validation.error.errors });
        return
    }

    const encrypted_passowrd=await bcrypt.hash(password,SALT_ROUNDS)
    // Simulate user creation logic
    // For example, save to a database or in-memory store
    await prismaClient.user.create({
        data:{
            name:validation.data.username,
            email:validation.data.email,
            password:encrypted_passowrd
        }
    }).then((user:any)=>{
        res.json({mssg:"User created successfully",user})
    }).catch((err: any) => {
        if (err instanceof PrismaClientKnownRequestError) {
            // Duplicate key (unique constraint failed)
            if (err.code === "P2002") {
                return res.status(409).json({
                    mssg: "A user with this email already exists.",
                    meta: err.meta
                });
            }
        }
    
        console.error("Database error:", err);
        return res.status(500).json({ mssg: "Internal server error" });
    });
})


app.post("/signin",async (
    req:Request,
    res:Response
)=>{
    const {password,email}=req.body;
    if( !password||!email){
        res.json({mssg:"email and password are required"});
        return
    }
   const validation= SignInSchemma.safeParse({email,password});
   if(!validation.success){
    res.status(400).json({ errors: validation.error.errors });
    return
   }
   //@ts-ignore
   const user=await prismaClient.user.findUnique({where:{email:validation.data.email}});
   if(!user){
    res.json({mssg:"User not found"});
    return
    }
    const isValidPassword=await bcrypt.compare(password,user.password);
    if(!isValidPassword){
        res.json({mssg:"Invalid password"});
        return
        }

    // Simulate user authentication logic
    // For example, check against a database or in-memory store
    const token=jwt.sign({userId:user.id},JWT_SECRET)
    res.json({mssg:"User signed in successfully",token});
})



app.post("/createRoom", middleware, (req: Request, res: Response) => {
    const roomName  = req.body.roomName;

    const AuthorId=req.userId
  

  
    if (!roomName||!AuthorId) {
    res.status(400).json({ mssg: "Room name and Author ID is required" });
    }
    const validation=CreateRoomSchemma.safeParse({roomName:roomName})
    if(!validation.success){
        res.status(400).json({ errors: validation.error.errors });
        return
    }
    prismaClient.room.create({
        data:{
            //@ts-ignore
            adminId:AuthorId,
            slug:validation.data.roomName
        }
    }).then((Room:any)=>{
        res.json({mssg:"Room created successfully",Room})
    }).catch((err:Error)=>{
        console.error(err);
        res.status(500).json({mssg:"Roomname already exists or Server is down"});
    })
})

app.get("/chats/:roomId",async (req,res)=>{
    const roomId=Number(req.params.roomId)
  const messages= await  prismaClient.chat.findMany({
    where:{
        roomId:roomId
    },
        orderBy:{
        id:"desc"
        }})
        console.log(messages)
        res.json({messages:messages})


})

app.get("/room/:slug",async (req,res)=>{
    const slug=req.params.slug
  const room= await  prismaClient.room.findFirst({
    where:{
        slug:slug
    }
        })

res.json(room?.id)


})

app.get("/allrooms",middleware,async (req,res)=>{
    const userId=req.userId;
    const rooms= await  prismaClient.room.findMany({
        where:{
            }
            })

    const user_rooms=rooms.filter((room)=>{
        if(room.adminId===userId){
            return true
        }
    })
            res.json({rooms,
            user_rooms})

   
            
})
  

app.post("/shape/update", middleware, async (req: Request, res: Response) => {

    const { id, roomId, shapeData } = req.body;
    console.log(id)
    console.log(shapeData)
    if (!id || !roomId || !shapeData) {
        res.status(400).json({ mssg: "id, roomId, and shapeData are required" });
        return
    }
    try {
        const shape = await prismaClient.chat.upsert({
            where: { id:Number(id) },
            update: { message:shapeData },
            //@ts-ignore
            create: { userId:req.userId, roomId, message:shapeData }
        });
        res.json({ mssg: "Shape updated", shape });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mssg: "Failed to update shape" });
    }
});

app.listen(3001,()=>{
    console.log(`Server is running on port ${3001}`);
})