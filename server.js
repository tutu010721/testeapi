const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();

// ===================================================================
// CORREÇÃO FINAL: Adicionando seu domínio à lista de origens permitidas (CORS)
const allowedOrigins = [
  'https://testeapi-two.vercel.app', // Mantemos para testes
  'https://www.ttkshopvans.shop',    // Seu domínio principal com www
  'https://ttkshopvans.shop'         // Seu domínio principal sem www
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  }
};
app.use(cors(corsOptions));
// ===================================================================

app.use(express.json());

// Suas chaves da Pague-X (ou outra, se tiver trocado)
const PAGUE_X_PUBLIC_KEY = "pk_live_v2BhVI3YN6FA8pS1M5j1XIae5UNj7w4uwA";
const PAGUE_X_SECRET_KEY = "sk_live_v2wcnMTDb8qlnzOoOjKt7AR16cbYkTRZlnCLwYW6LZa";
const PAGUE_X_URL = "https://api.pague-x.com/v1/transactions";
const base64Auth = Buffer.from(`${PAGUE_X_PUBLIC_KEY}:${PAGUE_X_SECRET_KEY}`).toString('base64');

app.get('/', (req, res) => {
    res.send('Servidor da loja está online e pronto para receber pedidos!');
});

app.post('/criar-cobranca', async (req, res) => {
    const payload = req.body;
    console.log("Backend: Recebido pedido de:", req.headers.origin);
    
    try {
        const response = await fetch(PAGUE_X_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Auth}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend: Erro retornado pela API Pague-X:", data);
            return res.status(response.status).json(data);
        }

        console.log("Backend: Transação criada com sucesso:", data);
        res.status(200).json(data);

    } catch (error) {
        console.error("Backend: Erro crítico na função fetch:", error);
        res.status(500).json({ 
            message: "Erro interno no servidor.",
            error_details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
});
