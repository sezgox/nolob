import bcrypt from 'bcrypt';
import jswt from 'jsonwebtoken';
import User from '../models/User.js';


export const login = async (req, res) => {
    const { username, password } = req.body;
    console.log(username)

    if (!username || !password) {
        return res.status(400).json({ data: 'Username and password are required', success: false });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ data: 'Username or password incorrect', success: false });
        }

        const passwordCorrect = await bcrypt.compare(password, user.password);

        if (passwordCorrect) {
            const token = jswt.sign(
                { username: user.username },
                process.env.AUTH_TOKEN_KEY ?? 'klkmanito',
                { expiresIn: '1h' } // Opcional: Configura la expiración del token
            );
            res.json({ data: token, success: true });
        } else {
            res.status(401).json({ data: 'Username or password incorrect', success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ data: 'Something went wrong... Try again later.', success: false });
    }
};

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