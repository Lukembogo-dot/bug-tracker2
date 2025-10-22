import bcrypt from 'bcrypt';
import { Response } from 'express';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { CreateUser } from '../Types/user.types';

export const createUser = async (req: Request, res: Response) => {
    const user = req.params;
    console.log("User received",user);
    if(!user){
        console.log("you need to fill in credentials");
    };
    try {
        
    } catch (error) {
        
    }

}