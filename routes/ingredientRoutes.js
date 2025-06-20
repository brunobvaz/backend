const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const ingredientController = require('../controllers/ingredientController');

router.delete('/all', ingredientController.deleteAllIngredients);
router.delete('/:id', ingredientController.deleteIngredient);

router.post('/', upload.single('image'), ingredientController.createIngredient);
router.get('/', ingredientController.getIngredients);
router.put('/:id', upload.single('image'), ingredientController.updateIngredient);




module.exports = router;

