import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from 'bcrypt';
import passport from "passport";
import nodemailer from 'nodemailer'
import config from "./src/config/config.js";

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);
const __filename = fileURLToPath(import.meta.url) // __filename contiene la ruta del archivo actual.
const __dirname = dirname(__filename);// __dirname contiene el directorio del archivo actual.

export default __dirname;

//Para jwt , extractor de token en Cookies
export const cookieExtractor = req => {
    let token;
    if (req && req.cookies) {  
        token = req.cookies['coderCookie'] 
    }
    return token;
}

// export const bearerTokenExtractor = req => {
//     return req.headers.authorization.split(' ')[1];
// }

export const passportCall = (strategy) => {
    return async(req, res, next) => {
        passport.authenticate(strategy, function(err, user, info) {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send({error: info.messages ? info.messages: info.toString()})
            }
            req.user = user;
            next();
        }) (req, res, next);
    }
}

export const passportCallForHome = (strategy) => {
    return async(req, res, next) => {
        passport.authenticate(strategy, function(err, user, info) {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        }) (req, res, next);
    }
}

export const authorization = (role) => {
    return async(req, res, next)=> {
        if (!req.user) {
            return res.status(401).send({error: 'Unauthorized'});
        }
        if (req.user.role != role) {
            return res.status(403).send({error: 'No permissions'});
        }
        next();
    }
}

import { Faker, es } from '@faker-js/faker';
const faker = new Faker({ locale: [es] }) 
export const generateProduct = () => {
    return {
        title: faker.commerce.productName(), 
        description: faker.commerce.productAdjective(),
        price: faker.commerce.price(), 
        code: faker.string.alphanumeric(10), 
        stock: +faker.string.numeric(1), 
        category: faker.commerce.department(), 
        _id: faker.database.mongodbObjectId(), 
    }
}

export const generateRandomCode = () => {
    const codeLength = 6;
    return crypto.randomBytes(Math.ceil(codeLength / 2))
        .toString('hex')
        .slice(0, codeLength);
}
const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD
    }
});

export const sendEmailToUser = async (email, subject, html) => {
    const result = await transport.sendMail({
        from: 'Inicio de sesion en Coder App <' + config.EMAIL_USER + '>',
        to: email,
        subject: subject,
        html: html
    })
    return (result);
}