import { cartService } from "../services/index.js";
import { productService } from "../services/index.js";
import { userService } from "../services/index.js";
import { ticketService } from "../services/index.js";

export const getProducts = async (req, res) => {
    const { limit, page, sort, category } = req.query;
    try {
        const products = await productService.getProductsQuery(limit, page, sort, category);
        res.render('home', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

export const pagination = async (req, res) => {
    const { limit, page, sort, category } = req.query;
    const user = req.user;
    const userPremiumOrAdmin = user.role === 'premium' || user.role === 'admin'
    const userObject = await userService.getUserById(user._id);
    const cart = userObject.cart[0]._id;
    try {
        const products = await productService.getProductsQuery(limit, page, sort, category);
        res.render('products', { products, user, userPremiumOrAdmin, cart });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

export const getProductsInRealTime = async (req, res) => {
    try {
        const listaProductos = await productService.getProducts({});
        const user = req.user;
        const userAdmin = user.role === 'admin'
        const userObject = await userService.getUserById(user._id);
        res.render('realTimeProducts', { listaProductos, user, userAdmin, style: 'style.css' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

export const cartView =  async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await userService.getUserById(userId);
        const cartId = user.cart[0]._id;
        const cart = await cartService.getCartById(cartId);
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }
        const productsInCart = cart.products
        const cartDetail = []
        let totalPrice = 0;
        for (let product of productsInCart ) {
            let productDetail = await productService.getProductById(product.productID);
            productDetail = productDetail.toObject(); 
            productDetail.quantity = product.quantity
            cartDetail.push(productDetail)
            totalPrice += productDetail.price * productDetail.quantity
        }
        res.render("cart", { cart, cartDetail, totalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

export const purchaseView = async (req, res) => {
    let purchaseComplete = []  
    let purchaseError = [] 
    let precioTotal = 0
    const userId = req.user._id; 
    try {
        const findUser = await userService.getUserById(userId);
        if (!findUser) {
            throw new Error('Usuario no encontrado');
        }
        const cartId = findUser.cart[0]._id  
        const cart = await cartService.getCartById(cartId)
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        const productsInCart = cart.products
        for (let product of productsInCart ) {
            const idproduct = product.productID
            const quantity = product.quantity
            const productInDB = await productService.getProductById(idproduct)
            if(quantity > productInDB.stock){  
                purchaseError.push(product);  
            }
            if(quantity <= productInDB.stock){
                let productUpdate = productInDB;
                const quantityUpdate = productInDB.stock - quantity;
                productUpdate.stock = quantityUpdate; 
                const update = await productService.updateProduct(idproduct, productUpdate) 
                purchaseComplete.push(product); 
                const monto = productInDB.price * quantity
                precioTotal = precioTotal + monto
            }
        }
        const notPurchasedProductsInCart = await cartService.insertArrayOfProducts(cartId,purchaseError);
        if (purchaseComplete.length > 0) {
            const ticketData = {
                amount: precioTotal,
                purchaser: req.user.email
            }
            const ticket = await ticketService.addTicket(ticketData);
            const purchaseData = {
                ticketId: ticket._id,
                amount: ticket.amount,
                purchase_datetime: ticket.purchase_datetime,
                purchaser:ticket.purchaser,
                productosProcesados: purchaseComplete,
                productosNoProcesados: purchaseError,
            }
            res.status(200).render('purchase', { status: 'success', payload: purchaseData , cartId});
        } else {
            res.status(200).send('errorPurchase', { status: 'success', message: 'No se procesaron productos, por falta de stock.', productosNoProcesados: purchaseError });
        }
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}

export const chatStyle = async (req, res) => {
    res.render("chat", { style: 'style.css' });
}

export const redirection = async (req, res) => {
    try {
        res.status(200).redirect('/home');
    } catch (err) {
        console.error(err);
        res.status(400).send({ error: err.message });
    }
}

export const loginView = (req, res) => {
    res.render('login');
}
export const registerView = (req, res) => {
    res.render('register');
}
export const resetPasswordView = (req, res) => {
    res.render('resetPassword', { style: 'style.css' });
}
export const newPasswordView = (req, res) => {
    res.render('newPassword');
}

export const profileView = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await userService.getUserById(userId);
        const cartId = user.cart[0]._id;
        res.render('profile', { user, cartId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

export const uploadDocumentView = async (req, res) => {
    const userId = req.user._id
    res.render('multer' , {userId});
}

export const usersAdminManager = async (req, res) => {
    const users = await userService.getUsers()
    res.render('admin' , {users});
}