import jwt from 'jsonwebtoken'
import "dotenv/config"
import process from "process";

const secret_key= process.env.JWT_SECRET;

export const authentication = (req,res,next) =>{
    if (!req.headers['authorization']) return res.sendStatus(401);

    const token = req.headers['authorization'].split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token,secret_key,(err) =>{
        console.log("error", err)
        if (err) return res.sendStatus(403);
        next();
    });
}