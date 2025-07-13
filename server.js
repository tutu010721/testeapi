const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();

// ===================================================================
// ATUALIZAÇÃO FINAL: Configuração explícita do CORS
// Estamos dizendo ao nosso backend para aceitar requisições vindas
// do seu site hospedado no Vercel.
const corsOptions = {
  origin: 'https://testeapi-two.vercel.app',
  optionsSuccessStatus: 200 // Para navegadores mais antigos
};
app.use(cors(corsOptions));
// ===================================================================

app.use(express.json());

const BLACKCAT_PUBLIC_KEY = "pk_13YJ3DhtaH9ZPBo8eVPqMctGqpHB87NayFcO_j_iKEVfgvCR";
const BLACKCAT_SECRET_KEY = "sk_Y7izervKtLXqR4hUz6tU1eIMX6T9bWbyrCvHxIAsOerkH7Fe";
const BLACKCAT_URL = "https://api.blackcatpagamentos.com/v1/transactions";

const base64Auth = Buffer.from(`${BLACKCAT_PUBLIC_KEY}:${BLACKCAT_SECRET_KEY}`).toString('base64');

// Rota de verificação para sabermos que o servidor está no ar
app.get('/', (req, res) => {
    res.send('Servidor da loja está online!');
});

app.post('/criar-cobranca', async (req, res) => {
    console.log("Backend: Recebido pedido para criar cobrança:", req.body);
    const payload = req.body;
    
    console.log("Backend: Enviando payload para a Blackcat com autorização Basic (PublicKey:SecretKey)...");

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
            message: "Erro interno no servidor ao tentar contatar o gateway.",
            error_details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
});
