const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();

// Configuração do CORS para permitir requisições do seu frontend
const corsOptions = {
  origin: [
    'https://testeapi-two.vercel.app', // Sua URL do Vercel
    'https://ttkshopvans.shop',        // Seu domínio principal
    'https://www.ttkshopvans.shop'     // Seu domínio com www
  ],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// ===================================================================
// SUAS CHAVES DA PAGUE-X
const PAGUE_X_SECRET_KEY = "sk_live_v2wcnMTDb8qlnzOoOjKt7AR16cbYkTRZlnCLwYW6LZa";

// ENDPOINT CORRETO
const PAGUE_X_URL = "https://api.pague-x.com/v1/transactions";

// ATUALIZAÇÃO FINAL E CORRETA DA AUTENTICAÇÃO:
// Codifica "chave_secreta:x" em Base64, como manda a documentação.
const base64Auth = Buffer.from(`${PAGUE_X_SECRET_KEY}:x`).toString('base64');
// ===================================================================

// Rota de verificação para sabermos que o servidor está no ar
app.get('/', (req, res) => {
    res.send('Servidor da loja está online e pronto para receber pedidos!');
});

app.post('/criar-cobranca', async (req, res) => {
    const payload = req.body;
    console.log("Backend: Recebido pedido de:", req.headers.origin);
    console.log("Backend: Enviando payload CORRETO para a Pague-X...");
    
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
            message: "Erro interno no servidor ao tentar contatar o gateway.",
            error_details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
});
