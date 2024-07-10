import { Router } from 'express';
import { postMethod2, getMethod2Data } from '../controller/method2_controller';

const router = Router();

router.post('/method2', postMethod2);
router.get('/method2/data', getMethod2Data);

export default router;
