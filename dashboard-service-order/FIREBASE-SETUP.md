# Configuração do Firebase para a Dashboard

Este guia te ajudará a configurar o Firebase corretamente para que o dashboard funcione com sincronização em tempo real.

## 🚀 Passo a Passo

### 1. Criar Projeto no Firebase Console

1. Acesse [https://console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Criar projeto"
3. Digite o nome do projeto
4. Desative o Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Ativar o Realtime Database

1. No menu lateral, clique em "Realtime Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Escolha a localização mais próxima (ex: `us-central1`)
5. Clique em "Ativar"

Nota: O URL do seu banco de dados será semelhante a: `https://seu-projeto-default-rtdb.firebaseio.com`

### 3. Configurar Regras de Segurança

1. Na aba "Regras" do Realtime Database, substitua o conteúdo por:

```json
{
  "rules": {
    ".read": true,  // Permite leitura para todos (modo de desenvolvimento)
    ".write": true  // Permite escrita para todos (modo de desenvolvimento)
    // IMPORTANTE: Em produção, configure regras mais restritas e autenticação adequada
  }
}
```

2. Clique em "Publicar"

### 4. Configurar o Aplicativo Web

1. No menu lateral, clique na engrenagem ⚙️ ao lado de "Visão geral do projeto"
2. Selecione "Configurações do projeto"
3. Role para baixo até "Seus aplicativos"
4. Clique no ícone da web (</>)
5. Digite um nome para o app (ex: "Dashboard")
6. Clique em "Registrar app"

### 5. Copiar Configuração

1. Após registrar o app, você verá um código como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

2. Copie esses valores

### 6. Atualizar o Código

1. Abra o arquivo `public/assets/firebase-config.js`
2. Substitua os valores placeholder pelos valores reais:

```javascript
// Importe os módulos necessários
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";

const firebaseConfig = {
  apiKey: "SUA_API_KEY_REAL",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  databaseURL: "https://SEU_PROJETO-default-rtdb.firebaseio.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Inicialize o Realtime Database
const database = getDatabase(app);
```

### 7. Testar

1. Abra o arquivo `index.html` no navegador
2. Abra o Console do DevTools (F12)
3. Tente adicionar um registro
4. Verifique se aparece a mensagem "✅ Firebase inicializado com sucesso!"

## 🔧 Solução de Problemas

### Erro: "Firebase não está carregado"
- Verifique se os scripts do Firebase estão sendo carregados
- Confirme se não há bloqueadores de script

### Erro: "Configuração inválida"
- Verifique se todos os campos estão preenchidos
- Confirme se não há espaços extras
- Certifique-se de que o `databaseURL` está correto

### Exemplos de Uso do Realtime Database

```javascript
// Exemplo de como escrever dados
function writeData(path, data) {
  const reference = ref(database, path);
  set(reference, data);
}

// Exemplo de como ler dados
async function readData(path) {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, path));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Erro ao ler dados:", error);
    throw error;
  }
}

// Uso:
// writeData('users/123', { name: 'João', email: 'joao@email.com' });
// const data = await readData('users/123');
```

### Erro: "Permissão negada"
- Verifique as regras do Firestore
- Confirme se está no modo de teste

### Erro: "Projeto não encontrado"
- Verifique se o `projectId` está correto
- Confirme se o projeto existe no Firebase Console

## 📱 Deploy no Vercel

1. Faça push do código para o GitHub
2. Conecte o repositório ao Vercel
3. Configure as variáveis de ambiente se necessário
4. Faça deploy

## 🔒 Segurança em Produção

⚠️ **ATENÇÃO**: As regras atuais permitem acesso total ao banco. Para produção:

1. Implemente autenticação de usuários
2. Configure regras mais restritivas
3. Use variáveis de ambiente para configurações sensíveis

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique o console do navegador para mensagens de erro
2. Confirme se o Firebase está ativo no console
3. Teste com um projeto Firebase novo
