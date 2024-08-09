import { Router } from "express"; 
import { 
	getAllCarts,
	createNewCart, 
	getCartById, 
	addProductToCart,
	deleteProdInCart, 
	deleteAllProductsInCart, 
	addProductsToCart,
	modifyProductQuantity,
	purchase
} from "../controllers/cart.controller.js";
import { passportCall } from "../../utils.js";
import { addLogger } from "../utils/logger.js";

const router = Router();
router.use(addLogger);
router.get('/' , getAllCarts);
router.post('/', createNewCart);
router.get('/:cid' , getCartById);
router.post('/:cid/product/:pid' , passportCall('jwt'), addProductToCart);
router.delete('/:cid/product/:pid', passportCall('jwt'), deleteProdInCart);
router.delete('/:cid', passportCall('jwt'), deleteAllProductsInCart);
router.put('/:cid', passportCall('jwt'), addProductsToCart);
router.put('/:cid/product/:pid', passportCall('jwt'), modifyProductQuantity);
router.get('/:cid/purchase', passportCall('jwt'), purchase);

export default router;