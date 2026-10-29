import express from 'express';
import {
    getOtsTickets,
    recordOtsTicket,
    deleteOtsTicket,
    updateOtsSettings
} from '../controllers/otsTicketController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireRole('admin', 'finance'));

router.get('/', getOtsTickets);
router.post('/', recordOtsTicket);
router.delete('/:id', deleteOtsTicket);
router.patch('/settings', updateOtsSettings);

export default router;
