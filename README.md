# QR Code Encryption API

API para a geração e verificação de QR codes digitalmente assinados em ambiente seguro com registro de usuários e denúncias.

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (pode ser obtido com Node.js)
- Algum banco de dados relacional

## 🚀 Instalação

1. Clone o repositório
   `git clone https://github.com/denis-albertini/qr-code-encryption-api.git`

2. Instale as dependências
   `cd qr-code-encryption-api`
   `npm i`

## 🔧 Configuração

1. Crie um arquivo .env
   `touch .env`

2. Escreva as seguintes variáveis de ambiente

- `DATABASE_CONNECTION_URI` Url para a conexão com o banco de dados
- `JWT_SECRET` Chave para geração e validação de tokens (pode ser gerada com openssl rand)
- `EMAIL_HOST` Host SMTP (e.g., \[smtp.gmail.com\])
- `EMAIL_USER` Endereço de email
- `EMAIL_PASS` Senha de acesso ao email (pode não ser a senha da conta dependendo do host)

## 📦 Scripts disponíveis

- `npm start` Inicia o servidor
- `npm run dev` Inicia o servidor em modo de reinicialização automática (para desenvolvimento)
- `npm run swagger` Gera/atualiza o arquivo de especificação Swagger/OpenAPI

## 📚 Documentação

O próprio servidor serve a documentação da API e esta pode ser acessada pelo endpoint `/api/doc`. Ademais, ela se encontra no arquivo `swagger-doc.json`.
