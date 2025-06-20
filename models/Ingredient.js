const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  proteins: String,
  calories: String,
  fats: String,
  carbohydrates: String,
  fiber: String,
}, { _id: false });

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: String,
  quantity: String,
  color: String,
  type: String,
  nutritions: nutritionSchema,
  image: String,
  status: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
