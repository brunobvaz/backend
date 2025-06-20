const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const isPasswordValid = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~|\\:;"',./`]).{8,}$/;
  return regex.test(password);
};


const crypto = require('crypto');
const transporter = require('../utils/mailer'); // novo

exports.register = async (req, res) => {
  try {
    const { name, email, password, status = 'inactive', perfil = 'user' } = req.body;

    if (!isPasswordValid(password)) {
      return res.status(400).json({
        message:
          'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um símbolo.'
      });
    }


    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email já registado' });

    const hash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');
    const activationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    const user = await User.create({
      name,
      email,
      password: hash,
      status,
      perfil,
      activationToken: token,
      activationExpires,
    });

    const activationLink = `http://localhost:3001/api/auth/activate?token=${token}`;

    await transporter.sendMail({
      from: '"Menument" <info@menumentapp.com>', // ← ESSENCIAL
      to: email,
      subject: 'Ative a sua conta',
      html: `
        <p>Bem-vindo(a), ${name}!</p>
        <p>Clique no botão abaixo para ativar a sua conta:</p>
        <a href="${activationLink}" style="background:#6f42c1;color:white;padding:10px 20px;border-radius:5px;text-decoration:none">Ativar Conta</a>
        <p>O link é válido por 24 horas.</p>
      `,
    });

    res.status(201).json({ message: 'Conta criada. Verifique o seu email para ativar.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao registar' });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // 🔐 Verificar se a conta está ativada
    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'A conta ainda não foi ativada. Verifique o seu email.'
      });
    }

    const token = createToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // coloca true em produção com HTTPS
      sameSite: 'lax',
      maxAge,
    });

    res.json({
      name: user.name,
      email: user.email,
      perfil: user.perfil,
      status: user.status
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao autenticar' });
  }
};


exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sessão terminada' });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado' });
    res.json(user);
  } catch {
    res.status(401).json({ message: 'Erro ao carregar utilizador' });
  }
};


exports.resendActivation = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });
    if (user.status === 'active') return res.status(400).json({ message: 'Conta já está ativa.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.activationToken = token;
    user.activationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const link = `http://localhost:3001/api/auth/activate?token=${token}`;

    await transporter.sendMail({
      from: '"Menument" <info@menumentapp.com>', // ← ESSENCIAL
      to: user.email,
      subject: 'Reenvio do link de ativação',
      html: `<p>Clique no link para ativar a sua conta:</p>
             <a href="${link}" style="color:white;background:#6f42c1;padding:10px 20px;border-radius:5px;text-decoration:none">Ativar Conta</a>`
    });

    res.json({ message: 'Novo link de ativação enviado para o seu email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao reenviar link de ativação.' });
  }
};


// controller
exports.activateWithRedirect = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      activationToken: token,
      activationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?activated=invalid`);
    }

    user.status = 'active';
    user.activationToken = undefined;
    user.activationExpires = undefined;
    await user.save();

    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?activated=true`);
  } catch (err) {
    console.error(err);
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?activated=error`);
  }
};

// Solicitação de redefinição de senha
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Email não encontrado.' });
    }

    // ❌ Bloquear se conta estiver inativa
    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'A conta ainda não está ativa. Verifique seu email e ative sua conta.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 60 * 60 * 1000; // 1h

    user.resetToken = resetToken;
    user.resetExpires = resetExpires;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: '"Menument" <info@menumentapp.com>', // ← ESSENCIAL
      to: user.email,
      subject: 'Redefinição de senha',
      html: `
        <p>Olá, ${user.name},</p>
        <p>Clique no botão abaixo para redefinir a sua senha:</p>
        <a href="${resetLink}" style="background:#6f42c1;color:white;padding:10px 20px;border-radius:5px;text-decoration:none">Redefinir Senha</a>
        <p>O link é válido por 1 hora.</p>
      `
    });

    res.json({ message: 'Email de recuperação enviado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao solicitar redefinição de senha.' });
  }
};

// Redefinir senha com token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Token inválido ou expirado.' });

    if (!isPasswordValid(password)) {
      return res.status(400).json({
        message:
          'A nova senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um símbolo.'
      });
    }


    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetToken = undefined;
    user.resetExpires = undefined;

    await user.save();

    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
};
