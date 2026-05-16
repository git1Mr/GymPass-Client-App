const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const gymStaff = require('../middleware/gymstaff');
const { validateGymAccess, getLedgerBalance } = require('../controllers/gymAccessController');

router.post('/validate', [auth, gymStaff], validateGymAccess);
router.get('/balance/:userId', auth, getLedgerBalance);

module.exports = router;
