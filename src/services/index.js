import { carts, products, users, tickets, resetPasswordCodes, messages } from '../dao/factory.js';

import CartsRepository from './carts.repository.js'
import ProductsRepository from './products.repositoy.js'
import UsersRepository from './users.repository.js'
import TicketsRepository from './tickets.repository.js'
import ResetPasswordCodesRepository from './resetPasswordCodes.repository.js'
import MessagesRepository from './messages.repository.js'

export const cartService = new CartsRepository(new carts());
export const productService = new ProductsRepository(new products());
export const userService = new UsersRepository(new users());
export const ticketService = new TicketsRepository(new tickets());
export const resetPasswordCodeService = new ResetPasswordCodesRepository(new resetPasswordCodes());
export const messageService = new MessagesRepository(new messages());