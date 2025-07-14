const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();

// Configuração do CORS para permitir requisições do seu frontend no Vercel
const corsOptions = {
  origin: 'https://testeapi-two.vercel.app',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Suas chaves da Blackcat Pagamentos
const BLACKCAT_PUBLIC_KEY = "pk_live_v2BhOFVtdZnnvWDSR9w6YyCuMjNV4Ig66H";
const BLACKCAT_SECRET_KEY = "sk_live_v24TJSZGAPap65GseGo9KYzsW0mlNdjonkDHF7aRnX";

// ===================================================================
// CORREÇÃO FINAL: Usando a variável correta que definimos acima.
const BLACKCAT_URL = "https://api.blackcatpagamentos.com/v1/transactions";
// ===================================================================

// Autenticação no formato CORRETO (PublicKey:SecretKey)
const base64Auth = Buffer.from(`${BLACKCAT_PUBLIC_KEY}:${BLACKCAT_SECRET_KEY}`).toString('base64');

// Rota de verificação para sabermos que o servidor está no ar
app.get('/', (req, res) => {
    res.send('Servidor da loja está online e pronto para receber pedidos!');
});

app.post('/criar-cobranca', async (req, res) => {
    const payload = req.body;
    console.log("Backend: Recebido pedido para criar cobrança. Payload:", JSON.stringify(payload, null, 2));
    
    console.log("Backend: Enviando payload para a Blackcat com autenticação Basic (PublicKey:SecretKey)...");

    try {
        // CORREÇÃO: Usando a variável BLACKCAT_URL
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
