const express      = require('express');
const router       = express.Router();
const uploadPhoto  = require('../middlewares/uploadUser');
const controller   = require('../controllers/userController');

// GET /api/users         → listar (com filtros & ordenação)
router.get('/', controller.getAll);

// GET /api/users/:id     → detalhe
router.get('/:id', controller.getById);

// POST /api/users        → criar
router.post('/', uploadPhoto, controller.create);

// PUT /api/users/:id     → editar
router.put('/:id', uploadPhoto, controller.update);

// DELETE /api/users/:id  → eliminar
router.delete('/:id', controller.remove);

// PATCH /api/users/:id/toggle-status
router.patch('/:id/toggle-status', controller.toggleStatus);

module.exports = router;
