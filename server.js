const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();
app.use(cors());
app.use(express.json());

// ===================================================================
// ATUALIZAÇÃO: Chave secreta da Blackcat Pagamentos
const BLACKCAT_SECRET_KEY = "sk_Y7izervKtLXqR4hUz6tU1eIMX6T9bWbyrCvHxIAsOerkH7Fe";

// ATUALIZAÇÃO: Endpoint correto da Blackcat para criar pagamentos
const BLACKCAT_URL = "https://api.blackcatpagamentos.com/v1/payments";
// ===================================================================

app.post('/criar-cobranca', async (req, res) => {
    console.log("Backend: Recebido pedido para criar cobrança:", req.body);

    // O payload recebido do frontend já está no formato correto que a Blackcat espera.
    // Vamos apenas repassá-lo.
    const payload = req.body;
    
    console.log("Backend: Enviando payload para a Blackcat com autorização Bearer Token...");

    try {
        const response = await fetch(BLACKCAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // --- ATUALIZAÇÃO CRUCIAL: Autenticação no formato Bearer Token ---
                'Authorization': `Bearer ${BLACKCAT_SECRET_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend: Erro retornado pela API Blackcat:", data);
            // Repassamos a mensagem de erro exata que a Blackcat enviou
            return res.status(response.status).json({ message: data.message || 'Erro desconhecido do gateway.' });
        }

        console.log("Backend: Transação criada com sucesso:", data);
        // A API da Blackcat retorna os dados do PIX dentro de `pix_details`
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
