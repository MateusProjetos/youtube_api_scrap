// server.js
require('dotenv').config();
const express = require('express');
const videoController = require('./controllers/videoController')();
const videoRoutes = require('./routes/videoRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsing de JSON
app.use(express.json());

// Inicialize o browser quando o servidor iniciar
videoController.initBrowser().catch(console.error);

// Aplica o middleware de autenticação a todas as rotas /api
app.use('/api', authMiddleware);

// Use as rotas de vídeo
app.use('/api', videoRoutes);

// Rota de teste simples (não protegida)
app.get('/', (req, res) => {
    res.send('API de Scraping de Vídeos está funcionando!');
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Listener para fechar o browser quando o servidor for encerrado
process.on('SIGINT', async () => {
    console.log('Encerrando o servidor...');
    await videoController.closeBrowser();
    process.exit();
});

// Inicie o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
