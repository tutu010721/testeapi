const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();

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
// SUAS CHAVES CORRETAS - Blackpayments.pro
const BLACKPAYMENTS_PUBLIC_KEY = "pk_o-Y_QVQ8SA8Gibe1ipowB8Fx14_9Edi3KX83Ea_wH3uR94zL";
const BLACKPAYMENTS_SECRET_KEY = "sk_cftziiCPEueBMulreJmm9ZkzDpTgTlA7PTYNAgOeKSgvTnLS";

// ENDPOINT CORRETO
const BLACKPAYMENTS_URL = "https://api.blackpayments.pro/v1/transactions";

// AUTENTICAÇÃO CORRETA (Basic Auth com PublicKey:SecretKey)
const base64Auth = Buffer.from(`${BLACKPAYMENTS_PUBLIC_KEY}:${BLACKPAYMENTS_SECRET_KEY}`).toString('base64');
// ===================================================================

app.get('/', (req, res) => {
    res.send('Servidor da loja (Blackpayments) está online!');
});

app.post('/criar-cobranca', async (req, res) => {
    const payload = req.body;
    console.log("Backend: Recebido pedido. Payload:", JSON.stringify(payload, null, 2));
    
    try {
        const response = await fetch(BLACKPAYMENTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Auth}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend: Erro retornado pela API Blackpayments:", data);
            return res.status(response.status).json({ message: data.error || 'Erro do gateway.' });
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
