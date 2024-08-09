import { messageModel } from "../../models/message.model.js";

export default class messageManager{
    constructor() {
    }
    getMessages = async () => {
        try{
            const messages = await messageModel.find()
            return messages
        }catch(error){
            console.error('No hay mensajes para leer',error.message); 
            return error
        }
    }
    addMessages = async (message) => {
        try{
            return await messageModel.create(message);
        }catch(error){
            console.error('No se pudo entregar el mensaje',error.message);
            return error;
        }
    }
}

