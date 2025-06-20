const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },

  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  perfil: { type: String, enum: ['user', 'admin'], default: 'user' },

  photo: { type: String }, // ← armazena o nome do ficheiro

  activationToken: String,
  activationExpires: Date,

  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetToken: { type: String },
  resetExpires: { type: Date },



}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);



