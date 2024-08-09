import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js';

export default class UserManager{
    constructor(){
        this.path = path.join(__dirname,'./data/users.json');
    }
    getUsers = async () => {
        try {
            const users = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
            return users;
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('Archivo no encontrado, devolviendo array vacío.');
                return [];
            } else {
                console.error(error);
                throw new Error('Error al obtener usuarios');
            }
        }
    }
    getUserById = async (userId) => {
        try {
            const users = await this.getUsers();
            const user = users.find(user => user._id === userId);
            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    getUserByEmail = async (userEmail) => {
        try {
            const users = await this.getUsers();
            const user = users.find(user => user.email === userEmail);
            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    addUser = async (user) => {
        try {
            const {first_name, last_name, email, age, password, cart, role, documents, last_connection} = user;
            if(!first_name || !last_name || !email || !password ){
                throw new Error("Datos del usuario incompletos");
            }
            const userList = await this.getUsers();
            if(userList.find(u => u.email === email)){
                throw new Error("Email ya en uso");
            }
            user.age = age || null;
            user.cart = [cart] || [];
            user.documents = documents || [];
            user.role = role || 'user';
            user.last_connection = last_connection || Date.now();
            user._id = userList.length > 0 ? Math.max(...userList.map(u => u._id)) + 1 : 1; // Genera un nuevo _id
            userList.push(user);
            await fs.promises.writeFile(this.path, JSON.stringify(userList, null, 2));
            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    updateUserById = async (idUser, user) => {
        try{
            const users = await this.getUsers();
            const updatedUsers = users.map(u => u._id === idUser ? {...u, ...user} : u);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedUsers, null, 2));
            return updatedUsers.find(u => u._id === idUser);
        }catch(error){
            console.error(error);
            throw error;
        }
    }
    updateUserByEmail = async (userEmail, user) => {
        try{
            const users = await this.getUsers();
            const updatedUsers = users.map(u => u.email === userEmail ? {...u, ...user} : u);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedUsers, null, 2));
            return updatedUsers.find(u => u.email === userEmail);
        }catch(error){
            console.error(error);
            throw error;
        }
    }
    deleteUser = async (idUser) => {
        try{
            const users = await this.getUsers();
            const updatedUsers = users.filter(u => u._id !== idUser);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedUsers, null, 2));
            return updatedUsers;
        }catch (error) {
            console.error(error);
            throw error;
        }
    }
}