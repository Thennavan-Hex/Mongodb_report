import { Router } from 'express';
import { postMethod1, getMethod1Data } from '../controller/method1_controller';

const router = Router();

router.post('/method1', postMethod1);
router.get('/method1/data', getMethod1Data);

export default router;
