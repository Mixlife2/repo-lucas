import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js'
import ProductManager from './ProductManager.js';

const productManager = new ProductManager()

class CartManager {
    constructor(){
        this.path = path.join(__dirname, './data/carts.json');  
        this.carts = [];  
        this.productManager = productManager; 
    }
    getAllCarts = async () => {
        try{
            const carts = await fs.promises.readFile(this.path,"utf-8")
            if (carts && carts.trim() !== "") {
                this.carts = JSON.parse(carts); 
                return this.carts;
            } else {
                return [];
            }
        }catch(error){
            console.log('Error al obtener los carritos:', error.message);
            return this.carts
        }
    }
    getCartById = async (idCart) => {
        try {
            const carts = await this.getAllCarts()
            return carts.find(cart => cart._id === +idCart);
        } catch (error) {
            console.log('Carrito inexistente:',error.message);
            throw error;
        }
    }
    createCart = async () => {
        try {
            this.carts = await this.getAllCarts();
            const carrito = {
                products: []
            }
            if(this.carts.length === 0){
                carrito._id = 1 
            }else{
                carrito._id = Math.max(...this.carts.map(cart => cart._id)) + 1
            }
            this.carts.push(carrito);
            await fs.promises.writeFile(this.path,JSON.stringify(this.carts,null,2)) 
            return carrito
        } catch (error) {
            throw error;
        }
    }
    addProductToCart = async (cartId , productId) => {
        try {
            const carts = await this.getAllCarts(); 
            const filterCart = carts.find(cart => cart._id === +cartId); 
            if (!filterCart) {
                throw new Error('Carrito no encontrado');
            }
            const product = await this.productManager.getProductById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            const existingProductInCart = filterCart.products.find(item => item.productID === +productId); 
            if(existingProductInCart){
                existingProductInCart.quantity += 1; 
            }else{
                filterCart.products.push({productID:+productId, quantity: 1}) 
            }
            await fs.promises.writeFile(this.path,JSON.stringify(carts,null,2))
        } catch (error) {
            throw error;
        }
    }
    modifyQuantity = async (cid, pid, quantity) => {
        try {
            const cartPath = path.join(__dirname, 'carts', `${cid}.json`);
            const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));
            const product = cart.products.find(item => item.productID.toString() === pid);
            if (product) {
                product.quantity = quantity;
            }
            await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');
            return cart;
        } catch (error) {
            console.log('Error al agregar un producto al carrito:', error.message);
            throw error;
        }
    };
    insertArrayOfProducts = async (cid, arrayOfproducts) => {
        try {
            const cartPath = path.join(__dirname, 'carts', `${cid}.json`);
            const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));
            const arr = [];
            for (const item of arrayOfproducts) {
                const productPath = path.join(__dirname, 'products', `${item.productID}.json`);
                const product = JSON.parse(await fs.promises.readFile(productPath, 'utf-8'));
                arr.push({
                    productID: product._id,
                    quantity: item.quantity
                });
            }
            cart.products = arr;
            await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');

            return cart;
        } catch (error) {
            console.log('Error al agregar un array de productos al carrito:', error.message);
            throw error;
        }
    };
    deleteProdInCart = async (cid, pid) => {
        try {
            const cartPath = path.join(__dirname, 'carts', `${cid}.json`);
            const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));
            cart.products = cart.products.filter(item => item.productID.toString() !== pid);
            await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');
        } catch (error) {
            console.log('Error al eliminar un producto del carrito:', error.message);
            throw error;
        }
    };
    deleteAllProductsInCart = async (cid) => {
        try {
            const cartPath = path.join(__dirname, 'carts', `${cid}.json`);
            const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));
            cart.products = [];
            await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');
            return cart;
        } catch (error) {
            console.log('Error al eliminar todos los productos:', error.message);
            throw error;
        }
    };
}

export default CartManager;