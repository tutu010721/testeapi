const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();
app.use(cors());
app.use(express.json());

// ===================================================================
// ATUALIZAÇÃO: Definindo as DUAS chaves, como a documentação exige.
const BLACKCAT_PUBLIC_KEY = "pk_13YJ3DhtaH9ZPBo8eVPqMctGqpHB87NayFcO_j_iKEVfgvCR";
const BLACKCAT_SECRET_KEY = "sk_Y7izervKtLXqR4hUz6tU1eIMX6T9bWbyrCvHxIAsOerkH7Fe";

// ATUALIZAÇÃO: Endpoint correto da Blackcat
const BLACKCAT_URL = "https://api.blackcatpagamentos.com/v1/payments";

// --- ATUALIZAÇÃO FINAL E CORRETA DA AUTENTICAÇÃO ---
// Codifica "chave_publica:chave_secreta" em Base64.
const base64Auth = Buffer.from(`${BLACKCAT_PUBLIC_KEY}:${BLACKCAT_SECRET_KEY}`).toString('base64');
// ===================================================================


app.post('/criar-cobranca', async (req, res) => {
    // A lógica interna desta função permanece a mesma, pois o payload está correto.
    // A única mudança crucial é o `base64Auth` que usamos abaixo.
    
    console.log("Backend: Recebido pedido para criar cobrança:", req.body);
    const payload = req.body;
    
    console.log("Backend: Enviando payload para a Blackcat com autenticação Basic (PublicKey:SecretKey)...");

    try {
        const response = await fetch(BLACKCAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Usando a autorização correta agora
                'authorization': `Basic ${base64Auth}`
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
