const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

const app = express();
app.use(cors());
app.use(express.json());

const BLACKCAT_PUBLIC_KEY = "pk_13YJ3DhtaH9ZPBo8eVPqMctGqpHB87NayFcO_j_iKEVfgvCR";
const BLACKCAT_SECRET_KEY = "sk_Y7izervKtLXqR4hUz6tU1eIMX6T9bWbyrCvHxIAsOerkH7Fe";

const BLACKCAT_URL = "https://api.blackcatpagamentos.com/v1/payments";

const base64Auth = Buffer.from(`${BLACKCAT_PUBLIC_KEY}:${BLACKCAT_SECRET_KEY}`).toString('base64');

app.post('/criar-cobranca', async (req, res) => {
    console.log("Backend: Recebido pedido para criar cobrança:", req.body);

    // ===================================================================
    // ATUALIZAÇÃO FINAL: Adicionando os campos que faltavam no payload
    // A API da Blackcat exige a moeda e o endereço completo do cliente.
    // ===================================================================
    const payload = {
        amount: req.body.amount,
        payment_method: "pix",
        currency: "BRL", // Campo de moeda adicionado
        customer: {
            name: req.body.customer.name,
            email: req.body.customer.email,
            document: {
                type: "cpf",
                number: req.body.customer.document
            },
            // Endereço do cliente agora é incluído na requisição
            address: {
                street: req.body.address.street,
                number: req.body.address.number,
                neighborhood: req.body.address.neighborhood,
                city: req.body.address.city,
                state: req.body.address.state,
                zip_code: req.body.address.cep.replace(/\D/g, '') // Apenas números
            }
        },
        items: req.body.items
    };
    
    console.log("Backend: Enviando payload FINAL e COMPLETO para a Blackcat:", payload);

    try {
        const response = await fetch(BLACKCAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Auth}`
            },
            body: JSON.stringify(payload)
        });

        // Verificando se a resposta está vazia ANTES de tentar o .json()
        const responseText = await response.text();
        if (!responseText) {
            console.error("Backend: A API retornou uma resposta vazia.");
            // Mesmo com corpo vazio, se o status for OK (2xx), consideramos sucesso parcial
            if (response.ok) {
                 return res.status(200).json({ message: "Transação criada, mas sem dados de retorno." });
            }
            throw new Error("A API retornou uma resposta vazia e um status de erro.");
        }

        const data = JSON.parse(responseText);

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
