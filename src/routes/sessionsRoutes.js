import { Router } from "express"
import passport from "passport";
import { passportCall} from "../../utils.js";
import { applyPolicy } from "../middlewares/authMiddleware.js";
import { addLogger } from '../utils/logger.js';
import userDTO from "../dao/DTOs/userDTO.js";

const router = Router()
router.use(addLogger);

router.post('/register' , passport.authenticate('register',{session:false, failureRedirect:'/api/sessions/failregister'}));

router.get('/failregister', (req, res)=> {
    return res.redirect('registro?error=Error en el proceso de registro')
})

router.post('/login', passport.authenticate('login',{session: false, failureRedirect:'/api/sessions/faillogin'}));

router.get('/faillogin', (req, res)=>{
    return res.status(400).json({error:`Error en el proceso de login..`})
})

router.get('/current2', async (req, res) => {
    res.send(req.user); 
});
router.get('/current', passportCall('jwt'), applyPolicy(['USER' , 'PREMIUM']), (req,res) => {
    console.log(req.user)
    const user = new userDTO(req.user)
    res.send({status:"success", payload: user});
})
router.get("/github", passport.authenticate("github", {}), (req, res) => {})

router.get('/callbackGithub', passport.authenticate("github", {failureRedirect:"/api/sessions/errorGitHub"}), (req,res)=>{

    req.session.usuario=req.user
    return res.redirect('/perfil');
})

router.get("/errorGitHub", (req, res)=>{
    res.setHeader('Content-Type','application/json');
    return res.status(500).json(
        {
            error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle:`Fallo al autenticar con GitHub`
        }
    )
    
})
router.get('/logout',(req,res)=>{

    req.session.destroy(e=>{
        if(e){
            res.setHeader('Content-Type','application/json');
            return res.status(500).json(
                {
                    error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle:`${e.message}`
                }
            )
            
        }
    })
    
    res.setHeader('Content-Type','application/json');
    res.status(200).json({
        message:"Logout exitoso"
    });
});
router.post('/resetpassword');
router.put('/newpassword');

export default router;