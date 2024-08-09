import { userService } from "../services/index.js"
import { cartService } from "../services/index.js";
import nodemailer from 'nodemailer'
import moment from 'moment';
import config from "../config/config.js";

export const premiumController = async(req,res) =>{
    const {uid} = req.params;
    req.logger.info(`Manejando lógica de usuarios premium para el usuario con ID: ${uid}`);
    const user = await userService.getUserById(uid)

    if(req.user.role === 'admin'){
        switch (user.role) {
            case 'user':
              user.role = 'premium';
              break;
            case 'premium':
              user.role = 'user';
              break;
        }
        const updateUser = await userService.updateUserById(uid, user);
        req.logger.info(`Usuario actualizado a rol: ${user.role}`);
        res.status(200).send({ status: 'success', user: user });
        return;
    }

    const REQUIRED_DOCUMENTS = ['identification', 'address_proof', 'account_statement'];
    if (REQUIRED_DOCUMENTS.every(doc => user.documents.map(document => document.name.split('.')[0]).includes(doc))) {
        switch (user.role) {
          case 'user':
            user.role = 'premium';
            break;
          case 'premium':
            user.role = 'user';
            break;
        }
        const updateUser = await userService.updateUserById(uid, user);
        req.logger.info(`Usuario actualizado a rol: ${user.role}`);
        res.status(200).send({ status: 'success', user: user });
    } else {
        req.logger.error('Faltan documentos requeridos');
        res.status(400).send('Faltan documentos requeridos');
    }
}
export const uploadDocuments = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.uid);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if(!req.files){
            return res.status(400).send({status:'error' , error:'No se puede guardar el archivo'})
        }
        let documents = req.files
        documents.forEach(doc => {
            user.documents.push({
            name: doc.originalname,
            reference: doc.path
            });
        });
        await userService.updateUserById(req.params.uid, user);
    } catch (error) {
        console.log(error)
    }
}

export const getUsers = async (req,res) => {
    const users = await userService.getUsers()
    req.logger.info(`Usuarios obtenidos: ${users.length}`);
    res.status(200).send({ status: 'success', users: users })
}

export const deleteUsers = async (req, res) => {
    try {
        const twoDaysAgo = moment().subtract(2, 'days').toDate();
        req.logger.info(`Fecha y hora de hace dos días: ${twoDaysAgo}`);
        const usersToDelete = await userService.getUsers({ last_connection: { $lt: twoDaysAgo } });
        req.logger.info(`Usuarios a eliminar: ${usersToDelete.length}`);

        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            } 
        });
        for (const user of usersToDelete) {
            if (user.email) {
                await transport.sendMail({
                    from: `Coder App <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: 'Tu cuenta ha sido eliminada',
                    text: `Hola ${user.first_name}, tu cuenta ha sido eliminada por inactividad.`,
                });
                req.logger.info(`Correo enviado a: ${user.email}`);
            } else {
                req.logger.warning(`No se pudo enviar correo a un usuario debido a que no tiene una dirección de correo electrónico definida.`);
            }
            await cartService.deleteCart(user.cart[0]._id);
            req.logger.info(`Carrito eliminado para el usuario: ${user._id}`);
        }
        await userService.deleteUsers({ _id: { $in: usersToDelete.map(user => user._id) } });
        req.logger.info(`Usuarios eliminados correctamente. Total eliminados: ${usersToDelete.length}`);
        res.json({ message: 'Usuarios eliminados correctamente' });
    } catch (error) {
        req.logger.error(`Error al eliminar usuarios: ${error}`);
        res.status(500).json({ message: 'Hubo un error al eliminar los usuarios' });  
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const userToDelete = await userService.getUserById(uid);
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            } 
        });
        if (userToDelete.email) {
            await transport.sendMail({
                from: `Coder App <${process.env.EMAIL_USER}>`,
                to: userToDelete.email,
                subject: 'Tu cuenta ha sido eliminada',
                text: `Hola ${userToDelete.first_name}, tu cuenta ha sido eliminada por inactividad.`,
            });
            req.logger.info(`Correo enviado a: ${userToDelete.email}`);
        } else {
            req.logger.warning(`No se pudo enviar correo a un usuario debido a que no tiene una dirección de correo electrónico definida.`);
        }
        await cartService.deleteCart(userToDelete.cart[0]._id);
        req.logger.info(`Carrito eliminado para el usuario: ${userToDelete._id}`);
        await userService.deleteUser(uid);
        res.json({ message: 'Usuario eliminado correctamente' });
    }catch (error) {
        req.logger.error(`Error al eliminar usuarios: ${error}`);
        res.status(500).json({ message: 'Hubo un error al eliminar los usuarios' });  
    }
}