const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// CORS configurado para frontend(s)
app.use(cors({
  origin: ['https://menumentapp.com', 'http://localhost:5173'], // ou todos os domínios autorizados
  credentials: true
}));

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/ingredients', require('./routes/ingredientRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// ... outras rotas

// Conexão à base de dados e arranque do servidor
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log('Servidor iniciado em http://localhost:3001');
  });
})
.catch(err => console.error('Erro de conexão à base de dados:', err));


