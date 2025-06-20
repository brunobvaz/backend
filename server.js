const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');



// Inicializar app
const app = express();

// Middleware para CORS com cookies
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Middlewares básicos
app.use(cookieParser()); // necessário para ler cookies HttpOnly
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir imagens da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Definir rotas
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

// Conectar à base de dados MongoDB e iniciar servidor
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB conectado com sucesso');
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`🚀 Servidor a correr em http://localhost:${port}`);
  });
})
.catch((err) => {
  console.error('❌ Erro na conexão com o MongoDB:', err);
});

