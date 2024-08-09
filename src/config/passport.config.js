import passport from "passport";
import local from "passport-local";
import jwt from 'passport-jwt';
import GitHubStrategy from 'passport-github2';
import { userService, cartService } from "../services/index.js";
import {cookieExtractor , createHash , isValidPassword} from '../../utils.js'
import config from './config.js'
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateUserErrorInfo } from "../services/errors/info.js";

const admin = {
    first_name: 'Coder',
    last_name: 'Admin',
    email: config.ADMIN_EMAIL,
    password: config.ADMIN_PASSWORD,
    role: 'admin'
};

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt; 

const initializePassport = async () => {
    passport.use('register', new LocalStrategy(
        {passReqToCallback:true , usernameField: 'email' , session:false }, async (req, username, password, done) => {
            const {first_name, last_name, email, age} = req.body; 
            req.logger.info(`Passport - Registrando nuevo usuario con email: ${email}`);
            try {
                if (!first_name || !last_name || !email || !age) {
                    CustomError.createError({
                        name:"User creation error",
                        cause: generateUserErrorInfo({first_name,last_name,email,age}),
                        message: "Error Trying to create User",
                        code: EErrors.INVALID_TYPES_ERROR
                    })
                    req.logger.error('Passport - Valores incompletos para el registro de usuario');
                    return done(null, false, { message: 'Incomplete Values' });
                }
                let exist = await userService.getUserByEmail(username);
                if(exist){
                    req.logger.warning('Passport - El usuario ya existe');
                    return done(null, false, { message: 'User already exists' });
                }
                const newUser = {
                    first_name, 
                    last_name, 
                    email, 
                    age,
                    cart: await cartService.createCart(),
                    password: createHash(password),
                }
                let result = await userService.addUser(newUser);
                req.logger.info(`Passport - Usuario registrado con éxito: ${email}`);
                return done(null,result); 
            } catch (error) {
                req.logger.error(`Passport - Error al obtener el usuario: ${error}`);
                return done('Error al obtener el usuario:' + error)   
            }
        }
    ))
    passport.use('login', new LocalStrategy({ 
        usernameField: 'email',
        session: false, 
    }, async (username, password, done) => {
        try {
            if (username === admin.email && password === admin.password) {
                const adminUser = admin
                return done(null, adminUser)
            }
            const user = await userService.getUserByEmail(username) 
            if(!user){
                return done(null, false ,{message: "No se encontro el usuario"});
            }
            if(!isValidPassword(user,password)){
                return done(null, false , {message: "Contraseña incorrecta"}) 
            };
            return done(null, user); 
        } catch (error) {
            req.logger.error(`Passport - Error al iniciar sesión: ${error}`);
            return done(error); 
        }
    }));
    passport.use('github', new GitHubStrategy({
        clientID: config.CLIENT_ID,
        clientSecret: config.CLIENT_SECRET,
        callbackURL:"http://localhost:8080/api/sessions/githubCallback"
    }, async(accessToken, refreshToken, profile, done) => {
        try{
            console.log(profile); 
            let user = await userService.getUserByEmail(profile._json.email)
            if(!user){
                let newUser = {
                    first_name: profile._json.name,
                    last_name: ' ', 
                    age: 18, 
                    cart: await cartService.createCart(),
                    email: profile._json.email,
                    password: '', 
                    role: 'user'
                }
                let result = await userService.addUser(newUser);
                done(null, result);
            }else{ 
                done(null, user);
            }
        }catch(error){
            done(error);
        }
    }))
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: 'CoderSecret' 
    }, async(jwt_payload, done) => {
        try {
            if(jwt_payload.email === admin.email){
                const adminUser = admin
                return done(null, adminUser);
            }
            return done(null, jwt_payload);
        } catch (error) {
            return done(error);
        }
    }))
    passport.serializeUser((user, done) => {
        done(null, user._id); 
    });
    passport.deserializeUser( async(id, done) => {
        let user = await userService.getUserById(id); 
        done(null, user); 
    });
    
}

export default initializePassport;