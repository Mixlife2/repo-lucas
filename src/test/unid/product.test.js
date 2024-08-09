import { expect } from 'chai';
import mongoose from 'mongoose';
import config from '../../config/config.js';
import productService from '../../services/productService.js';

describe('Pruebas unitarias del módulo de productos', () => {
    let testProduct;
    const productMock = {
        title: "Gabinete Corsair",
        description: "Gabinete gamer para PC de escritorio nuevo",
        price: 125,
        thumbnail: "No disponible",
        code: "PC127gfGTJYgfdfdGGg",
        stock: 25,
        category: "PC",
    };
    beforeEach(async () => {
        try {
            await mongoose.connect(config.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
            testProduct = await productService.addProduct(productMock);
        } catch (error) {
            console.error(error);
        }
    });
    afterEach(async () => {
        try {
            await mongoose.connection.db.dropCollection('products');
        } catch (error) {
            console.error(error);
        }
    });
    it('Prueba de products.getProducts ', async () => {
        const products = await productService.getProducts();
        expect(products).to.be.an('array');
    });
    it('Prueba de products.addProduct', async () => {
        const newProduct = await productService.addProduct(testProduct);
        expect(newProduct).to.have.property('_id').and.not.null;
    });
    it('Prueba de products.getProductById', async () => {
        const getProduct = await productService.getProductById(testProduct._id);
        expect(getProduct).to.have.property('_id').and.not.null;
        expect(getProduct._id.toString()).to.equal(testProduct._id.toString());
        expect(getProduct.code).to.equal(testProduct.code);
    });
    it('Prueba de products.deleteProduct', async () => {
        const response = await productService.deleteProduct(testProduct._id);
        const productsNull = await productService.getProducts();
        expect(productsNull).to.be.an('array').that.is.empty;
    });
});