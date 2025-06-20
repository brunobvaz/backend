const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  proteins: String,
  carbohydrates: String,
  fats: String,
  calories: String,
  vitaminC: String,
  calcium: String,
}, { _id: false });

const ingredientDetailSchema = new mongoose.Schema({
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true,
  },
  quantity: { type: String, required: true },
  unit: { type: String, enum: ['gr', 'ml', 'un', 'cl'], required: true }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  categoryId: { type: String, required: true },
  preparationTime: String,
  servings: String,
  nutritions: nutritionSchema,
  ingredients: [ingredientDetailSchema], // atualizado para suportar ID, quantidade e unidade
  instructions: [String],
  status: { type: Boolean, default: true },
  image: String, // imagem principal
  extraImages: [String], // até 3 imagens
}, {
  timestamps: true,
});

module.exports = mongoose.model('Recipe', recipeSchema);

