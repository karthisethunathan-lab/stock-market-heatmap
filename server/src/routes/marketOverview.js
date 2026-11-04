import { Router } from 'express';
import { getMarketOverview } from '../services/marketOverviewService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getMarketOverview();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
