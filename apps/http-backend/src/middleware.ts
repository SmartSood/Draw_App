import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";


declare global {
  namespace Express {
    interface Request {
      userId?: string | jwt.JwtPayload; 
    }
  }
}


export  function middleware(req: Request, res: Response, next: NextFunction): void {
    const token =req.header("authorization")
  
    if (!token) {
      res.status(401).json({ message: "Unauthorized" }); // ✅ no return
      return;
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      //@ts-ignore
      req.userId = decoded.userId;
      next(); // ✅ pass control to next handler
    } catch (err) {
      res.status(401).json({ message: "Invalid token" }); // ✅ no return
    }
  }
  
