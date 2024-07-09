import bcrypt from 'bcrypt';
import jswt from 'jsonwebtoken';
import { Datafile } from '../models/datafile.js';

const userModel = new Datafile();

export const login = async (req,res) => {
    const {username,password} = req.body;
    if (!username || !password) {
        return res.status(400).json({ data: 'Username and password are required',success:false });
    }
    try {
        //const user = await userModel.getUser(username);
        const user = userModel.getUser()
        if(!user.success){
            res.json(user);
        }else{
            const hashedPassword = user.data.password;
            const passwordCorrect = await bcrypt.compare(password, hashedPassword);
            const token = jswt.sign({
                username: username
            },
            process.env.AUTH_TOKEN_KEY ?? 'klkmanito');
            passwordCorrect ? res.json({data:token,success:true}) : res.json({data:'Username or password incorrect',success:false});
        }
    } catch (error) {
        console.log(error)
        res.json('Unvalid data')
    }
}


export const validateToken = async(req,res,next) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        return res.status(401).json({ data: 'Token de autenticación no proporcionado',success:false});
    }
    const token = bearer.slice(7);
    jswt.verify(token, process.env.AUTH_TOKEN_KEY ?? 'klkmanito',function(err,decoded){
        if(err){
            res.json({data:'Token inválido',success:false})
        }else{
            next();
        }
    })

}