import { productService } from "../services/index.js";
import { userService } from "../services/index.js";
import nodemailer from 'nodemailer';
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateProductErrorInfo } from "../services/errors/info.js";
import mongoose from "mongoose";

export const getProductsQuery = async (req, res) => {
    const { limit, page, sort, category  } = req.query;
    req.logger.info(`Obteniendo productos con los siguientes parámetros: limit=${limit}, page=${page}, sort=${sort}, category =${category }`);
	try {
		const products  = await productService.getProductsQuery(limit, page, sort, category );
        req.logger.info(`Productos obtenidos: ${products.length}`);
		res.status(200).send({ status: 'success', payload: products  });
	} catch (err) {
        req.logger.error(`Error al obtener productos: ${err.message}`);
		res.status(400).send({ error: err.message });
	}
}
export const getProductById = async (req, res) => {
    try{
        const {pid} = req.params
        if (!mongoose.Types.ObjectId.isValid(pid)) {
            throw new Error('El ID del producto no es valido')
        }
        const product = await productService.getProductById(pid)
        if (!product) {
            throw new Error('404:Producto no encontrado');
        }
        req.logger.info(`Producto obtenido: ${product.title}`);
        res.status(200).send({status:'success', payload:product});
    }catch(error){
        req.logger.error(`Error: ${error.message}`);
        res.status(400).send({status: 'error', message: error.message});
    }
}

export const addProduct = async (req, res) => {
    try {
        const {title, description, category, price, stock, code, } = req.body 
        if(!title || !description || !category || !price || isNaN(price) || !stock || isNaN(stock) || !code   ){
            throw CustomError.createError({
                name:"Product creation error",
                cause: generateProductErrorInfo({title,description,price,thumbnail,code,stock, category}),
                message: "Error Trying to create Product",
                code: EErrors.INVALID_TYPES_ERROR
            })
        }
        const newProduct = {
            title,
            description,
            category,
            price,
            stock,
            code,
            thumbnail: req.file ? `/static/products/${req.file.filename}` : '/static/products/default.png',
        }   
        const userId = req.user._id;
        const userRole = req.user.role
        if (!userId && userRole === 'admin') {
            const result = await productService.addProduct(newProduct)
            res.status(201).send({status:"Sucess: Producto agregado" , payload: result})
            return;
        }
        const user = await userService.getUserById(userId);
        if(user) newProduct.owner = user._id
        const result = await productService.addProduct(newProduct)
        req.logger.info(`Producto agregado: ${newProduct.title}`);
        res.status(201).send({status:"Sucess: Producto agregado" , payload: result})
    } catch (error) {
        req.logger.error(`Error al agregar el producto: ${error.message}`);
        res.status(400).send({ error: 'Error al agregar el producto', details: error.message });
    }
}

export const updateProduct = async (req, res) => {
    const productID = req.params.pid 
    const updateData = req.body     
    req.logger.info(`Actualizando producto con ID: ${productID} con los siguientes datos: ${JSON.stringify(updateData)}`)
    try{
        const product = await productService.getProductById(productID);
        if (!product) {
            return res.status(404).send('El producto no existe');
        }
        if(req.user.role == 'admin'){
            await productService.updateProduct(productID, { $set: updateData });
            const productUpdated = await productService.getProductById(productID);
            req.logger.info(`Producto actualizado: ${productUpdated.title}`);
            return res.status(200).send({status:'Sucess: product updated', payload: productUpdated});
        }
        const user = await userService.getUserById(product.owner);
        if (req.user.role != 'admin' && product.owner != user._id) {
            return res.status(403).send('No tienes permiso para eliminar este producto');
        }
        await productService.updateProduct(productID, { $set: updateData });
        const productUpdated = await productService.getProductById(productID);
        req.logger.info(`Producto actualizado: ${productUpdated.title}`);
        res.status(200).send({status:'Sucess: product updated', payload: productUpdated});
    } catch (error) {
        req.logger.error(`Error al modificar el producto: ${error.message}`);
        res.status(400).send('Error al eliminar el producto: ' + error.message);
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productService.getProductById(pid);
        if (!product) {
            return res.status(404).send('El producto no existe');
        }
        if(req.user.role == 'admin'){
            await productService.deleteProduct(pid);
            req.logger.info(`Producto eliminado: ${product.title}`);
            return res.status(204).send({ status: 'Success: Producto eliminado' });
        }
        const user = await userService.getUserById(product.owner);
        if (req.user.role != 'admin' && product.owner != user._id) {
            return res.status(403).send('No tienes permiso para eliminar este producto');
        }
        await productService.deleteProduct(pid);
        req.logger.info(`Producto eliminado: ${product.title}`);
        if (user.role === 'premium') {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            await transporter.sendMail({
                from: `Coder App: Ecommerce <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Tu producto ha sido eliminado',
                text: `Hola ${user.first_name}, tu producto "${product.title}" con ID: ${product._id} ha sido eliminado.`,
            });
            req.logger.info(`Correo enviado de Producto eliminado a: ${user.email}`);
        }
        return res.status(204).send({ status: 'Success: Producto eliminado' });
    } catch (error) {
        req.logger.error(`Error al eliminar el producto: ${error.message}`);
        return res.status(400).send(`Error al eliminar el producto: ${error.message}`);
    }
};