const Recipe = require('../models/Recipe');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar receitas' });
  }
};


exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ message: 'Receita não encontrada' });
    }

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar a receita' });
  }
};


exports.create = async (req, res) => {
  try {
    const {
      title, categoryId, preparationTime, servings,
      nutritions, ingredients, instructions, status
    } = req.body;

    let parsedNutritions = {};
    let parsedIngredients = [];
    let parsedInstructions = [];

    try {
      parsedNutritions = JSON.parse(nutritions);
      parsedIngredients = JSON.parse(ingredients);
      parsedInstructions = JSON.parse(instructions);
    } catch (parseError) {
      console.error('Erro ao fazer parse dos dados:', parseError);
      return res.status(400).json({ message: 'Dados inválidos no envio (parse JSON)' });
    }

    const image = req.files?.image?.[0]?.filename || null;
    const extraImages = req.files?.extraImages?.map(f => f.filename) || [];

    const recipe = new Recipe({
      title,
      categoryId,
      preparationTime,
      servings,
      nutritions: parsedNutritions,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      image,
      extraImages,
      status: true, // ou outro valor padrão
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    console.error('Erro ao criar receita no backend:', err);
    res.status(500).json({ message: 'Erro ao criar receita' });
  }
};


// Apagar
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Recipe.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Recipe não encontrado' });

    res.json({ message: 'Receita apagada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Apagar todos
exports.deleteAllRecipes = async (req, res) => {
  try {
    await Recipe.deleteMany({});
    res.json({ message: 'Todas as receitas foram apagadas com sucesso' });
  } catch (err) {
    console.error('❌ Erro ao apagar todas as receitas', err);
    res.status(500).json({ message: 'Erro interno ao apagar todas as receitas' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se a receita existe
    const existing = await Recipe.findById(id);
    if (!existing) return res.status(404).json({ message: 'Receita não encontrada' });

    const updateData = { ...req.body };

    // 🧠 Faz parse apenas se necessário (string vindo de FormData)
    const fieldsToParse = ['nutritions', 'ingredients', 'instructions'];
    for (const key of fieldsToParse) {
      if (updateData[key] && typeof updateData[key] === 'string') {
        try {
          updateData[key] = JSON.parse(updateData[key]);
        } catch (err) {
          return res.status(400).json({ message: `Erro ao processar ${key}` });
        }
      }
    }

    // 📷 Tratamento de imagem principal
    const image = req.files?.image?.[0]?.filename;
    if (image) {
      // Remove a anterior, se houver
      if (existing.image) {
        const oldPath = path.join(__dirname, '..', 'uploads', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = image;
    }

    // 📷 Tratamento de imagens extras
    const extraImages = req.files?.extraImages?.map(f => f.filename);
    if (extraImages?.length) {
      // Remove anteriores
      if (existing.extraImages?.length) {
        for (const file of existing.extraImages) {
          const oldPath = path.join(__dirname, '..', 'uploads', file);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
      updateData.extraImages = extraImages;
    }

    // ✅ Atualiza no Mongo
    const updated = await Recipe.findByIdAndUpdate(id, updateData, { new: true });

    res.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar receita:', err);
    res.status(500).json({ message: 'Erro ao atualizar receita' });
  }
};

