import { Router } from 'express';
import { addLogger } from '../utils/logger.js';
import { premiumController, getUsers , uploadDocuments , deleteUsers , deleteUser} from '../controllers/usersController.js';
import upload from '../middlewares/multerConfig.js'
import { passportCall} from "../../utils.js";

const router = Router()
router.use(addLogger);
router.get('/premium/:uid' , passportCall('jwt'), premiumController);
router.post('/:uid/documents', upload.array('documents'), uploadDocuments);
router.get('/' , getUsers);
router.delete('/' , deleteUsers);
router.get('/:uid' , deleteUser);

export default router;