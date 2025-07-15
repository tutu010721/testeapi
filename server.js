const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();

// Configuração do CORS para permitir requisições do seu frontend
const corsOptions = {
  origin: [
    'https://testeapi-two.vercel.app', // Sua URL de teste do Vercel
    'https://www.ttkshopvans.shop',    // Seu domínio principal com www
    'https://ttkshopvans.shop'         // Seu domínio principal sem www
  ],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// SUAS CHAVES DA PAGUE-X
const PAGUE_X_PUBLIC_KEY = "pk_13YJ3DhtaH9ZPBo8eVPqMctGqpHB87NayFcO_j_iKEVfgvCR";
const PAGUE_X_SECRET_KEY = "sk_Y7izervKtLXqR4hUz6tU1eIMX6T9bWbyrCvHxIAsOerkH7Fe";

// ENDPOINT CORRETO
const PAGUE_X_URL = "https://api.pague-x.com/v1/transactions";

// AUTENTICAÇÃO CORRETA (Basic Auth com PublicKey:SecretKey)
const base64Auth = Buffer.from(`${PAGUE_X_PUBLIC_KEY}:${PAGUE_X_SECRET_KEY}`).toString('base64');

// Rota de verificação
app.get('/', (req, res) => {
    res.send('Servidor da loja está online e pronto para receber pedidos!');
});

app.post('/criar-cobranca', async (req, res) => {
    const payload = req.body;
    console.log("Backend: Recebido pedido de:", req.headers.origin);
    console.log("Backend: Enviando payload para a Pague-X...");
    
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
