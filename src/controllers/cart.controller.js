import { cartService } from "../services/index.js";
import { productService } from "../services/index.js";
import { userService } from "../services/index.js";
import { ticketService } from "../services/index.js";

export const getAllCarts = async (req, res) => {
	try {
		const allCarts = await cartService.getAllCarts();
		req.logger.info(`Numero de carritos obtenidos: ${allCarts.length}`);
		res.status(200).json({ status: 'success', payload: allCarts });
	} catch (error) {
		req.logger.error(`Error al obtener carritos: ${error.message}`);
		res.status(400).json({ error: error.message });
	}
};

export const createNewCart = async (req, res) => {
	try {
		const cartData = req.body;
		const createdCart = await cartService.createCart(cartData);
		req.logger.info(`ID del Carrito creado: ${createdCart._id}`);
		res.status(201).json({ status: 'success', payload: createdCart });
	} catch (error) {
		req.logger.error(`Error al crear un nuevo carrito: ${error.message}`);
		res.status(400).json({ error: error.message });
	}
};

export const getCartById = async (req, res) => {
	try {
		const cartID = req.params.cid;
		const getCart = await cartService.getCartById(cartID);
		if (!getCart) {
			throw new Error(`Carrito con el id ${cartID} no existe`);
		}
		const getProductsCart = getCart.products;
		req.logger.info(`Productos obtenidos del carrito ${cartID}: ${getProductsCart.length}`);
		res.status(200).json({ status: 'success', payload: getCart });
	} catch (error) {
		req.logger.error(`Error al obtener carrito por ID: ${error.message}`);
		res.status(400).json({ error: error.message });
	}
};

export const addProductToCart = async (req, res) => {
	try {
		const cartId = req.params.cid; 
		const productId = req.params.pid;
		const userId = req.user._id; 
		const product = await productService.getProductById(productId)
		if (product.owner == userId && req.user.role == 'premium') {
			req.logger.info(`El usuario premium ${userId} intentó agregar su propio producto ${productId} al carrito ${cartId}`);
			res.status(400).json({status:'error: un usuario premium no puede agregar su propio producto al carrito'});
		}else{
			const addProductToCart = await cartService.addProductToCart(cartId, productId);
			req.logger.info(`Producto ${productId} agregado al carrito ${cartId}`);
			res.status(200).json({status:'success: producto agregado al carrito correctamente'}); 
		}
	} catch (error) {
		req.logger.error(`Error al agregar producto al carrito: ${error.message}`);
		res.status(400).json({ error: error.message });
	}
}

export const deleteProdInCart = async (req, res) => {
	const { cid: cartId, pid: productId } = req.params;
	try {
		const cart = await cartService.getCartById(cartId);
		if (!cart) {
			req.logger.error('Carrito no encontrado');
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}
		const productExists = cart.products.find((product) => product.productID == productId);
		if (!productExists) {
			req.logger.error('Producto no encontrado en el carrito');
			return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
		}
		await cartService.deleteProdInCart(cartId, productId);
		req.logger.info(`Producto ${productId} eliminado del carrito ${cartId}`);
		res.status(200).json({ status: 'success', payload: productExists });
	} catch (error) {
		req.logger.error(`Error al eliminar producto del carrito: ${error.message}`);
		res.status(400).json({ error: error.message });
	}
};

export const deleteAllProductsInCart = async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartService.getCartById(cid);
        if (!cart) {
            res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
            return;
        }
        await cartService.deleteAllProductsInCart(cid);
        req.logger.info(`Todos los productos han sido eliminados del carrito ${cid}`);
        res.status(200).json({ status: 'success', message: 'Carrito vaciado con éxito' });
    } catch (err) {
        req.logger.error(`Error al eliminar todos los productos del carrito: ${err.message}`);
        res.status(500).json({ status: 'error', message: 'Error del servidor' });
    }
}

export const addProductsToCart = async (req, res) => {
    const { body: productsToAdd } = req;
    const { cid: cartId } = req.params;
    try {
        const existingCart = await cartService.getCartById(cartId);
        if (!existingCart) {
            req.logger.warning(`Carrito ${cartId} no encontrado.`);
            res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
            return;
        }
        for (const product of productsToAdd) {
            const existingProduct = await productService.getProductById(product.productID);
            if (!existingProduct) {
                req.logger.error(`Producto ${product._id} no encontrado.`);
                res.status(404).json({ status: 'error', message: `Producto ${product._id} no encontrado` });
                return;
            }
        }
        const updatedCart = await cartService.insertArrayOfProducts(cartId, productsToAdd);
        req.logger.info(`Productos agregados al carrito ${cartId}.`);
        res.status(200).json({ status: 'success', message: 'Productos agregados con éxito', updatedCart });
    } catch (err) {
        req.logger.error(`Error al agregar productos al carrito: ${err.message}`);
        res.status(500).json({ status: 'error', message: 'Error del servidor' });
    }
}

export const modifyProductQuantity = async (req, res) => {
	const { cid, pid } = req.params;
	const { newQuantity } = req.body;
	try {
		const foundCart = await cartService.getCartById(cid);
		if (!foundCart) {
			throw new Error(`Carrito ${cid} no encontrado.`);
		}
		const productInCart = foundCart.products.find((product) => product.productID.toString() === pid);
		if (!productInCart) {
			throw new Error(`Producto ${pid} no encontrado en el carrito ${cid}.`);
		}
		const updatedCart = await cartService.modifyQuantity(cid, pid, Number(newQuantity));
		return res.status(200).json({ status: 'success', updatedCart });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

export const purchase = async (req,res) => {
	req.logger.info('Iniciando el proceso de compra');
	let purchaseComplete = []  
	let purchaseError = [] 
	let precioTotal = 0
	const userId = req.user._id; 
	const findUser = await userService.getUserById(userId);
	const cartId = findUser.cart[0]._id  
	const cart = await cartService.getCartById(cartId)
	const productsInCart = cart.products

	try {
		for (let product of productsInCart ) {
			const idproduct = product.productID
			const quantity = product.quantity
			const productInDB = await productService.getProductById(idproduct)
			if(quantity > productInDB.stock){ 
				purchaseError.push(product);  
				req.logger.warning(`El producto ${product.productID} no tiene suficiente stock.`);
			}
			if(quantity <= productInDB.stock){
				let productUpdate = productInDB;
				const quantityUpdate = productInDB.stock - quantity;
				productUpdate.stock = quantityUpdate; 
				const update = await productService.updateProduct(idproduct, productUpdate)
				purchaseComplete.push(product); 
				const monto = productInDB.price * quantity
				precioTotal = precioTotal + monto
				req.logger.info(`El producto ${product.productID} se ha procesado correctamente.`);
			}
		}
		const notPurchasedProductsInCart = await cartService.insertArrayOfProducts(cartId,purchaseError);
        if (purchaseComplete.length > 0) {
			const ticketData = {
				amount: precioTotal,
				purchaser: req.user.email
			}
			const ticket = await ticketService.addTicket(ticketData);
			req.logger.info(`Ticket de compra creado con éxito. ID del ticket: ${ticket._id} , Monto total:${precioTotal} , Usuario: ${req.user.email}`);
			const purchaseData = {
				ticket: ticket,
				productosProcesados: purchaseComplete,
				productosNoProcesados: purchaseError,
			}
			req.logger.info('Compra realizada con éxito.');
			res.status(200).send({ status: 'success', payload: purchaseData})
		}else {
			req.logger.warning('No se procesaron productos, por falta de stock.');
            res.status(200).send({ status: 'success', message: 'No se procesaron productos, por falta de stock.', productosNoProcesados: purchaseError});
        }	
	} catch (error) {
		req.logger.error(`Error en el proceso de compra: ${error.message}`);
		res.status(400).send({ error: error.message });
	}
}