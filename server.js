const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();
app.use(cors());
app.use(express.json());

// Sua chave secreta privada da Pague-X.
const PAGUE_X_SECRET_KEY = "sk_live_v2wcnMTDb8qlnzOoOjKt7AR16cbYkTRZlnCLwYW6LZa";

const PagueX_URL = "https://api.pague-x.com/v1/transactions";

// ===================================================================
// CORREÇÃO FINAL: Vamos testar o formato de autenticação SEM os dois-pontos (:)
// antes de codificar em Base64. Esta é uma variação comum do padrão Basic Auth.
const base64Auth = Buffer.from(PAGUE_X_SECRET_KEY).toString('base64');
// ===================================================================

app.post('/criar-cobranca', async (req, res) => {
    console.log("Backend: Recebido pedido para criar cobrança:", req.body);

    const payload = {
        amount: req.body.amount,
        payment_type: "pix",
        customer: {
            name: req.body.customer.name,
            email: req.body.customer.email,
            document: {
                type: "cpf",
                number: req.body.customer.document
            }
        },
        items: req.body.items
    };
    
    console.log("Backend: Enviando payload para a Pague-X com autorização Basic (formato 2)...");

    try {
        const response = await fetch(PagueX_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Basic ${base64Auth}`
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
