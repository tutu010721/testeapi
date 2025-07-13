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

// ATUALIZAÇÃO: Endpoint correto para CRIAR TRANSAÇÕES
const BLACKCAT_URL = "https://api.blackcatpagamentos.com/v1/transactions";

// ATUALIZAÇÃO FINAL E CORRETA DA AUTENTICAÇÃO:
// Codifica "chave_publica:chave_secreta" em Base64.
const base64Auth = Buffer.from(`${BLACKCAT_PUBLIC_KEY}:${BLACKCAT_SECRET_KEY}`).toString('base64');
// ===================================================================

app.post('/criar-cobranca', async (req, res) => {
    console.log("Backend: Recebido pedido para criar cobrança:", req.body);

    // O payload recebido do frontend já está no formato correto para a API da Blackcat.
    // A API usa `paymentMethod` (com M maiúsculo).
    const payload = req.body;
    
    console.log("Backend: Enviando payload para a Blackcat com autenticação Basic (PublicKey:SecretKey)...");

    try {
        const response = await fetch(BLACKCAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Auth}` // Usando o formato correto
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend: Erro retornado pela API Blackcat:", data);
            return res.status(response.status).json({ message: data.error || 'Erro desconhecido do gateway.' });
        }

        console.log("Backend: Transação criada com sucesso:", data);
        // A resposta da Blackcat pode ter uma estrutura diferente,
        // vamos repassar o objeto 'pix' inteiro se ele existir.
        res.status(200).json({ payment_info: data.pix || data });

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
