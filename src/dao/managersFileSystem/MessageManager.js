import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js';

class messageManager{
    constructor() {
        this.path = path.join(__dirname, './data/messages.json');
    }
    getNextId = async () => {
        const messages = await this.getMessages();
        if (messages.length === 0) {
            return 1;
        }
        const maxId = Math.max(...messages.map(message => message._id));
        return maxId + 1;
    }
    getMessages = async () => {
        try{
            const messages = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(messages);
        }catch(error){
            console.error('No hay mensajes para leer',error.message); 
            return [];
        }
    }
    addMessages = async (message) => {
        try{
            const messages = await this.getMessages();
            message._id = await this.getNextId();
            messages.push(message);
            await fs.promises.writeFile(this.path, JSON.stringify(messages, null , 2)); 
        }catch(error){
            console.error('No se pudo entregar el mensaje',error.message);
            return error;
        }
    }
}

export default messageManager;