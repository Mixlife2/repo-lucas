import express from "express"; 
import __dirname from "../utils.js"; 
import handlebars from 'express-handlebars'; 
import { Server } from "socket.io"; 
import mongoose, { connect } from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import productsRouter from './routes/productRoutes.js'; 
import cartsRouter from './routes/cartRoutes.js';
import sessionRouter from './routes/sessionsRoutes.js';
import mockingRouter from './routes/mocking.router.js'
import mailingRouter from './routes/mailing.router.js'
import loggerRouter from './routes/logger.router.js'
import usersRouter from './routes/users.router.js'
import viewsRouter from './routes/views.router.js';
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import { productService } from "./services/index.js";
import { messageService } from "./services/index.js";
import { userService } from "./services/index.js";
import config from './config/config.js';
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

const app = express()
const port = config.PORT || 8080;
const httpServer = app.listen( port , () => {console.log('Server ON in port:', config.PORT)})
const socketServer = new Server(httpServer);
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentacion Market Place',
            description: 'API pensada para aplicacion de un Marketplace'
        }
    },
    apis: [`${__dirname}/src/docs/**/*.yaml`]
}
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs',swaggerUiExpress.serve, swaggerUiExpress.setup(specs))
app.use(express.json()); 
app.use(express.urlencoded({extended:true})); 
app.use(express.Router()); 
mongoose.connect(process.env.MONGO_URL)
app.use(session({
    store: MongoStore.create({
        mongoUrl: config.MONGO_URL,
        ttl:3600
    }),
    secret: 'CoderSecret',
    resave: false,
    saveUninitialized: false
}))
initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use('/static' , express.static(__dirname +'/src/public'));
app.engine('handlebars' , handlebars.engine());
app.set('views', __dirname + '/src/views');
app.set('view engine', 'handlebars');
app.use('/api/products' , productsRouter); 
app.use('/api/carts' , cartsRouter); 
app.use('/api/sessions', sessionRouter); 
app.use('/mocking' , mockingRouter);
app.use('/mail', mailingRouter); 
app.use('/loggerTest', loggerRouter ); 
app.use('/api/users' , usersRouter); 
app.use('/', viewsRouter); 

socketServer.on('connection', async (socket) => {
    console.log("nuevo cliente conectado")
    const products = await productService.getProducts()
    socket.emit('productos', products);
    socket.on('addProduct', async data => {
        const updateProductsList = await productService.getProducts();
        socket.emit('updatedProducts', updateProductsList ); 
        socket.emit('productAdded'); 
    })
    socket.on('updateProduct', async (productData, userData) => {
        const idProduct = productData._id;
        delete productData._id; 
        const product = await productService.getProductById(idProduct);
        if (userData.role === 'admin' || product.owner === userData._id) {
            await productService.updateProduct(idProduct, { $set: productData });
            const updateProductsList = await productService.getProducts();
            socket.emit('updatedProducts', updateProductsList ); 
            socket.emit('productUpdated');
        } else {
            socket.emit('error',  'No tienes permiso para actualizar este producto.' );
        }
    });
    socket.on('deleteProduct', async (productId , userData) => {
        const updateProducts = await productService.getProducts();
        socket.emit('updatedProducts', updateProducts ); 
    })
})

socketServer.on('connection', async (socket) => {
    console.log("nuevo cliente conectado 2")
    socket.on('authenticated', data => {
        console.log(data)
        socket.broadcast.emit('newUserConnected', data);
    })
    socket.on('message', async data => {
        console.log(data)
        const addMessage = await messageService.addMessages(data); 
        const messages = await messageService.getMessages(); 
        socket.emit('messageLogs', messages); 
    })
});

export default app;