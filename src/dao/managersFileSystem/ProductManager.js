import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js';

class ProductManager{
    constructor(){
        this.path = path.join(__dirname,'./data/products.json');
        this.products = [];
    }
    getProductsQuery = async (limit, page, sort, query) => {
        try {
            !limit && (limit = 10);
            !page && (page = 1);
            sort === 'asc' && (sort = 1);
            sort === 'des' && (sort = -1);
            const filter = query ? JSON.parse(query) : {};
            let products = await this.getProducts();
    
            if (Object.keys(filter).length > 0) {
                products = products.filter(product => {
                    for (let key in filter) {
                        if (product[key] !== filter[key]) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            if (sort) {
                products.sort((a, b) => sort * (a.price - b.price));
            }
    
            const totalPages = Math.ceil(products.length / limit);
            const start = (page - 1) * limit;
            const end = start + limit;
            products = products.slice(start, end);
            return {
                docs: products,
                totalDocs: products.length,
                limit: limit,
                totalPages: totalPages,
                page: page,
                pagingCounter: start + 1,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null
            };
        } catch (error) {
            console.log('Error al obtener productos con consulta:', error.message);
            return 'Error al obtener productos con consulta: ' + error.message;
        }
    }
    getProducts = async () => {
        try{
            const productsList = await fs.promises.readFile(this.path,"utf-8")
            const productsListParse = JSON.parse(productsList)
            return productsListParse
        }catch{
            return [];
        }
    }
    getProductById = async (productId) => {
        const products = await this.getProducts()
        for(const item of products){
            if(item._id === productId){
                return item;
            }
        }
        return 'Not found'
    }
    addProduct = async (obj) => {
        const {title, description, price, thumbnail, code, stock, category} = obj;
        if(!title || !description || !price || !thumbnail || !code || !stock || !category){
            console.error("ERROR: Datos del producto incompletos");
            return;
        }
        const productList = await this.getProducts();
        const product = {
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            category,
            status: true,
            owner: 'admin'
        }
        for( const item of productList){
            if(item.code === product.code){
                console.error('ERROR: Codigo existente');
                return
            }
        }
        if(productList.length === 0){
            product._id = 1
        }else{
            product._id = productList[productList.length -1]._id + 1;  
        }
        productList.push(product);
        await fs.promises.writeFile(this.path,JSON.stringify(productList,null,2)) 
    }
    updateProduct = async (productId , productUpdate) => {
        const pid = productId
        const {title, description, price, thumbnail, code, stock} = productUpdate
        if( !title || !description || !price || !thumbnail || !code || !stock){
          console.error("ERROR: Datos del producto incompletos")
          return 
        }
        const currentProductsList = await this.getProducts()
        for( const item of currentProductsList){
            if(item.code === code && item._id !== pid){ 
                console.error('ERROR: Codigo existente');
                return
            }
        }
        let newProductsList = currentProductsList.map(item => {
            if (item._id === pid) {
                const updatedProduct = {
                    _id: pid, 
                    title,
                    description,
                    price,
                    thumbnail,
                    code,
                    stock,
                };
                return updatedProduct; 
            }else{
                return item;
            }     
        });
        await fs.promises.writeFile(this.path,JSON.stringify(newProductsList,null,2));
    }
    deleteProduct = async (searchId) => {
        const productsList = await this.getProducts();
        const existingCode = productsList.find(product =>product._id===searchId)
        if(!existingCode){
            console.error('ERROR: Codigo inexistente')
            return
        }
        const updatedProductsList = productsList.filter(product => product._id !== searchId); 
        await fs.promises.writeFile(this.path,JSON.stringify(updatedProductsList,null,2))
        console.log('Producto eliminado correctamente')
        return updatedProductsList;  
    }
}

export default ProductManager;