const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();

// Configuração do CORS para permitir requisições do seu frontend
const allowedOrigins = [
  'https://testeapi-two.vercel.app',
  'https://www.ttkshopvans.shop',
  'https://ttkshopvans.shop'
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
app.use(express.json());

// ===================================================================
// SUAS CHAVES - Blackcat Pagamentos
const BLACKCAT_PUBLIC_KEY = "pk_o-Y_QVQ8SA8Gibe1ipowB8Fx14_9Edi3KX83Ea_wH3uR94zL";
const BLACKCAT_SECRET_KEY = "sk_cftziiCPEueBMulreJmm9ZkzDpTgTlA7PTYNAgOeKSgvTnLS";

// ENDPOINT CORRETO
const BLACKCAT_URL = "https://api.blackpayments.pro/v1/transactions";

// AUTENTICAÇÃO CORRETA (Basic Auth com PublicKey:SecretKey)
const base64Auth = Buffer.from(`${BLACKCAT_PUBLIC_KEY}:${BLACKCAT_SECRET_KEY}`).toString('base64');
// ===================================================================

app.get('/', (req, res) => {
    res.send('Servidor da loja (Blackcat) está online!');
});

app.post('/criar-cobranca', async (req, res) => {
    const payload = req.body;
    console.log("Backend: Recebido pedido para Blackcat. Payload:", JSON.stringify(payload, null, 2));
    
    try {
        const response = await fetch(BLACKCAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Auth}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend: Erro retornado pela API Blackcat:", data);
            return res.status(response.status).json({ message: data.error || 'Erro desconhecido do gateway.' });
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
