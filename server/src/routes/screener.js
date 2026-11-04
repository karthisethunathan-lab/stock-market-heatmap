import { Router } from 'express';
import { screenStocks } from '../services/screenerService.js';

const router = Router();

router.get('/', (req, res, next) => {
  try {
    const result = screenStocks(req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
