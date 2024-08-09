import { productModel } from '../../models/product.model.js';

export default class ProductManager{
    constructor(){
    }
	getProductsQuery = async (limit, page, sort, category) => {
		try {
            !limit && (limit = 9);
            !page && (page = 1);
            sort === 'asc' && (sort = 1);
            sort === 'des' && (sort = -1);
			const filter = category ? { category: category } : {};
			const queryOptions = { limit: limit, page: page, lean: true };
			if (sort === 1 || sort === -1) {
				queryOptions.sort = { price: sort };
			}
			const getProducts = await productModel.paginate(filter, queryOptions);
			getProducts.isValid = !(page <= 0 || page > getProducts.totalPages); 
			getProducts.prevLink =
				getProducts.hasPrevPage &&
				`?page=${getProducts.prevPage}&limit=${limit}`;
			getProducts.nextLink =
				getProducts.hasNextPage &&
				`?page=${getProducts.nextPage}&limit=${limit}`;
			getProducts.status = getProducts ? 'success' : 'error';
			return getProducts;
		} catch (error) {
			console.log(error.message);
		}
	};
    getProducts = async () => {
        try{
            return await productModel.find().lean() 
        }catch(error){
            console.error(error);
        }
    }
    getProductById = async (productId) => {
        try {
            return await productModel.findById(productId)
        } catch (error) {
            console.error(error)
        }
    }
    addProduct = async (product) => {
        try {
            return await productModel.create(product)
        } catch (error) {
            console.error(error)
        }
    }
    updateProduct = async (productId, product) =>{
        try{
            return await productModel.updateOne({ _id: productId } , product)
        }catch(error){
            console.error(error);
        }
    }
    deleteProduct = async (productId) => {
        try{
            return await productModel.findByIdAndDelete(productId)
        }catch (error) {
            console.error(error)
        }
    }
}