const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();

// ===================================================================
// CORREÇÃO 1: Configuração do CORS
// A lista de domínios permitidos precisa ser um array de strings.
// Adicionado seu domínio 'ttkshopvans.shop' e o 'www' para garantir.
const allowedOrigins = [
  'https://testeapi-two.vercel.app',
  'https://ttkshopvans.shop',
  'https://www.ttkshopvans.shop'
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

// SUAS CHAVES DA PAGUE-X
const PAGUE_X_PUBLIC_KEY = "pk_live_v2BhVI3YN6FA8pS1M5j1XIae5UNj7w4uwA"; // Sua chave pública
const PAGUE_X_SECRET_KEY = "sk_live_v2wcnMTDb8qlnzOoOjKt7AR16cbYkTRZlnCLwYW6LZ";

const PAGUE_X_URL = "https://api.pague-x.com/v1/transactions";

// ===================================================================
// CORREÇÃO 2: Autenticação Basic com as duas chaves
// O formato correto é "chave_publica:chave_secreta" codificado em Base64.
const base64Auth = Buffer.from(`${PAGUE_X_PUBLIC_KEY}:${PAGUE_X_SECRET_KEY}`).toString('base64');
// ===================================================================

// Rota de verificação
app.get('/', (req, res) => {
    res.send('Servidor da loja está online e pronto!');
});

app.post('/criar-cobranca', async (req, res) => {
    const payload = req.body;
    console.log("Backend: Recebido pedido. Payload:", JSON.stringify(payload, null, 2));
    
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
