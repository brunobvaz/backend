const Ingredient = require('../models/Ingredient');

// Criar Ingrediente
exports.createIngredient = async (req, res) => {
  try {
    const image = req.file ? req.file.filename : null;

    const ingredient = new Ingredient({
      name: req.body.name,
      unit: req.body.unit,
      quantity: req.body.quantity,
      color: req.body.color,
      textColor: req.body.textColor,
      type: req.body.type,
      image,
      status: req.body.status !== undefined ? req.body.status : true,
      nutritions: {
        proteins: req.body['nutritions.proteins'],
        calories: req.body['nutritions.calories'],
        fats: req.body['nutritions.fats'],
        carbohydrates: req.body['nutritions.carbohydrates'],
        fiber: req.body['nutritions.fiber'],
      },
    });

    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (err) {
    console.error('❌ Erro ao criar ingrediente:', err);
    res.status(500).json({ message: 'Erro interno ao criar ingrediente' });
  }
};



// Listar todos
exports.getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Atualizar
exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file ? req.file.filename : undefined;

    const updateData = { ...req.body };
    if (image) updateData.image = image;

    const updated = await Ingredient.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Ingrediente não encontrado' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Apagar
exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Ingredient.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Ingrediente não encontrado' });

    res.json({ message: 'Ingrediente apagado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Apagar todos
exports.deleteAllIngredients = async (req, res) => {
  try {
    await Ingredient.deleteMany({});
    res.json({ message: 'Todos os ingredientes foram apagados com sucesso' });
  } catch (err) {
    console.error('❌ Erro ao apagar todos os ingredientes:', err);
    res.status(500).json({ message: 'Erro interno ao apagar todos os ingredientes' });
  }
};

