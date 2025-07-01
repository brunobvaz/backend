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

// ⚙️ CORS configurado com suporte a cookies
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:8081', // origem do React Native
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
}));

// 🔐 Middlewares essenciais
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🖼️ Servir a pasta "uploads" publicamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📦 Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

// 🚀 Conectar MongoDB e iniciar o servidor
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB conectado com sucesso');

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`🚀 Servidor a correr em http://localhost:${port}`);
    console.log(`📂 Pasta pública disponível em http://localhost:${port}/uploads`);
  });
})
.catch((err) => {
  console.error('❌ Erro na conexão com o MongoDB:', err);
});

