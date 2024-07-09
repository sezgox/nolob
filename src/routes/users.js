import { Router } from "express";
import { login } from "../controllers/users.js";

export const usersRouter = Router();

usersRouter.get('/',(req,res) => {
    res.send('<h1>Usuarios</h1>')
})

usersRouter.post('/login',login);