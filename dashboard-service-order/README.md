# 📊 Dashboard de Ordens de Serviço

Dashboard para controle e acompanhamento de ordens de serviço com sincronização em tempo real via Firebase.

## 🚀 Funcionalidades

- ✅ Adicionar registros de OS
- 📊 Estatísticas em tempo real
- 📈 Gráficos interativos
- 🔍 Filtros e busca
- 📅 Histórico mensal
- ☁️ Sincronização em nuvem (Firebase)
- 💾 Fallback para armazenamento local

## ⚠️ Problema Atual: Erro ao Adicionar ao Firestore

**Se você está recebendo erro ao adicionar dados ao Firestore, siga estas instruções:**

### 🔧 Solução Rápida

1. **Abra o arquivo de teste**: `test-firebase.html`
2. **Verifique o status da conexão** na página
3. **Configure o Firebase** seguindo o guia completo

### 📋 Passos para Configurar o Firebase

1. **Acesse o Firebase Console**: [https://console.firebase.google.com](https://console.firebase.google.com)
2. **Crie um projeto** ou use um existente
3. **Ative o Firestore Database**
4. **Configure as regras de segurança** (veja `FIREBASE-SETUP.md`)
5. **Obtenha as configurações** do seu app web
6. **Atualize o arquivo** `public/assets/firebase-config.js`

### 📖 Guia Completo

Para instruções detalhadas, consulte: **[FIREBASE-SETUP.md](FIREBASE-SETUP.md)**

## 🧪 Teste de Conexão

Use o arquivo `test-firebase.html` para:
- ✅ Verificar se o Firebase está conectado
- 📝 Testar escrita no Firestore
- 📖 Testar leitura do Firestore
- 🗑️ Limpar dados de teste

## 🏃‍♂️ Como Executar

### Desenvolvimento Local

1. Clone o repositório
2. Abra `public/index.html` no navegador
3. Configure o Firebase (veja instruções acima)
4. Teste a funcionalidade

### Deploy no Vercel

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente se necessário
3. Faça deploy automático

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Banco de Dados**: Firebase Firestore
- **Gráficos**: Chart.js
- **Deploy**: Vercel
- **Sincronização**: Firebase Realtime

## 📱 Responsivo

Interface adaptada para:
- 🖥️ Desktop
- 📱 Tablet
- 📱 Mobile

## 🔒 Segurança

**⚠️ ATENÇÃO**: Configuração atual permite acesso total ao banco (modo desenvolvimento).

Para produção, configure:
- Autenticação de usuários
- Regras de segurança restritivas
- Limitação de acesso por domínio

## 📞 Suporte

Se encontrar problemas:

1. **Verifique o console** do navegador (F12)
2. **Use o arquivo de teste** `test-firebase.html`
3. **Consulte o guia** `FIREBASE-SETUP.md`
4. **Verifique as regras** do Firestore

## 📄 Licença

Este projeto é de uso interno para Samsung.

---

**🎯 Objetivo**: Dashboard compartilhado onde múltiplos usuários podem ver mudanças em tempo real via Firebase.
