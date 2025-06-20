#!/bin/bash

echo "🔁 Atualizando código do backend..."

git pull origin main

echo "📦 Instalando dependências..."
npm install

echo "🚀 Reiniciando backend com PM2..."
pm2 restart server

echo "✅ Deploy concluído!"
