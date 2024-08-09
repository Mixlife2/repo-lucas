import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js';

class ResetPasswordCodeManager {
    constructor() {
        this.path = path.join(__dirname,'./data/resetPasswordCodes.json');
    }
    getNextId = async () => {
        const resetCodes = await this.getAllCodes();
        if (resetCodes.length === 0) {
            return 1;
        }
        const maxId = Math.max(...resetCodes.map(code => code._id));
        return maxId + 1;
    }
    getCode = async (code) => {
        try {
            const resetCodes = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
            const resetCode = resetCodes.find(resetCode => resetCode.code === code);
            if (resetCode) {
                const now = new Date();
                const createdAt = new Date(resetCode.createdAt);
                const expiresAt = new Date(resetCode.expiresAt);
                if (now >= createdAt && now <= expiresAt) {
                    return resetCode;
                }
            }
            return null;
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.promises.writeFile(this.path, JSON.stringify([]));
                return null;
            } else {
                console.error('Error al obtener los códigos de reinicio:', error.message); 
                throw error;
            }
        }
    }
    getAllCodes = async () => {
        try {
            return JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.promises.writeFile(this.path, JSON.stringify([]));
                return [];
            } else {
                console.error('Error al obtener los códigos de reinicio:', error.message); 
                throw error;
            }
        }
    }
    saveCode = async (email, code) => {
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!emailRegex.test(email)) {
            throw new Error('Por favor, introduce un correo electrónico válido.');
        }
        const resetCodes = await this.getAllCodes()
        const EXPIRATION_TIME_SECONDS = 60 * 60; 
        const newCode = {
            _id: await this.getNextId(),
            email,
            code,
            createdAt: new Date(), 
            expiresAt: new Date(Date.now() + EXPIRATION_TIME_SECONDS * 1000)
        };
        resetCodes.push(newCode);
        await fs.promises.writeFile(this.path, JSON.stringify(resetCodes, null , 2));
        return newCode;
    }
    deleteCode = async (email, code) => {
        let resetCodes = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
        resetCodes = resetCodes.filter(resetCode => !(resetCode.email === email && resetCode.code === code));
        await fs.promises.writeFile(this.path, JSON.stringify(resetCodes));
    }
}

export default ResetPasswordCodeManager;