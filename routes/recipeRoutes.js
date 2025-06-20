const express = require('express');
const router = express.Router();
const { recipeUpload } = require('../middlewares/recipeUpload'); // exemplo


const recipeController = require('../controllers/recipeController');

router.delete('/all', recipeController.deleteAllRecipes);
router.delete('/:id', recipeController.deleteRecipe);

router.post('/', recipeUpload, recipeController.create);
router.get('/', recipeController.getAll);
router.get('/:id', recipeController.getById);
router.put('/:id', recipeUpload, recipeController.update);




module.exports = router;
