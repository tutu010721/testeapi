const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();

const corsOptions = {
  origin: [
    'https://testeapi-two.vercel.app',
    'https://www.ttkshopvans.shop',
    'https://ttkshopvans.shop'
  ],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

const PAGUE_X_SECRET_KEY = "sk_live_v2wcnMTDb8qlnzOoOjKt7AR16cbYkTRZlnCLwYW6LZa";
const PAGUE_X_URL = "https://api.pague-x.com/v1/transactions";

// ===================================================================
// CORREÇÃO DEFINITIVA DA AUTENTICAÇÃO
// O formato é "chave_secreta" + ":x" codificado em Base64.
const base64Auth = Buffer.from(`${PAGUE_X_SECRET_KEY}:x`).toString('base64');
// ===================================================================

app.get('/', (req, res) => {
    res.send('Servidor da loja está online e pronto!');
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
