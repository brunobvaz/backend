const fs   = require('fs');
const path = require('path');
const User = require('../models/User');

// 🔄 GET /api/users?search=&status=&perfil=&sort=name|email&order=asc|desc
exports.getAll = async (req, res) => {
  try {
    const { search = '', status, perfil, sort = 'createdAt', order = 'desc' } = req.query;

    const query = {
      $or: [
        { name:  new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ],
    };
    if (status)  query.status = status;
    if (perfil)  query.perfil = perfil;

    const users = await User.find(query).sort({ [sort]: order === 'asc' ? 1 : -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar utilizadores' });
  }
};

// ✅ GET /api/users/:id
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Erro ao obter utilizador' });
  }
};

// ➕ POST /api/users  (multipart/form-data)
exports.create = async (req, res) => {
  try {
    const { name, email, perfil = 'user', status = 'inactive' } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email já registado' });

    const user = await User.create({
      name,
      email,
      perfil,
      status,
      photo: req.file ? req.file.filename : undefined,
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar utilizador' });
  }
};

// ✏️ PUT /api/users/:id  (multipart/form-data)
exports.update = async (req, res) => {
  try {
    const { name, email, perfil, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado' });

    // se chegar nova foto, apaga foto antiga
    if (req.file) {
      if (user.photo) {
        fs.unlinkSync(path.join('uploads', user.photo));
      }
      user.photo = req.file.filename;
    }

    Object.assign(user, { name, email, perfil, status });
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar utilizador' });
  }
};

// 🗑️ DELETE /api/users/:id
exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado' });

    if (user.photo) fs.unlinkSync(path.join('uploads', user.photo));
    res.json({ message: 'Utilizador eliminado com sucesso' });
  } catch {
    res.status(500).json({ message: 'Erro ao eliminar utilizador' });
  }
};

// 🔁 PATCH /api/users/:id/toggle-status
exports.toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado' });

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({ status: user.status });
  } catch {
    res.status(500).json({ message: 'Erro ao alternar status' });
  }
};
