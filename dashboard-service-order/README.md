# 📊 Dashboard de Ordens de Serviço

Dashboard para controle e acompanhamento de ordens de serviço com sincronização em tempo real com AWS DynamoDB.

## 🚀 Funcionalidades

- ✅ Adicionar registros de OS
- 📊 Estatísticas em tempo real
- 📈 Gráficos interativos
- 🔍 Filtros e busca
- 📅 Histórico mensal
- 💾 Armazenamento local persistente
- 🔄 Atualizações em tempo real

## 💾 Armazenamento Local

A aplicação utiliza o **LocalStorage** do navegador para:

- ✅ Salvar todos os registros de OS
- 📊 Manter estatísticas entre sessões
- 🔒 Dados persistentes mesmo após fechar o navegador
- 📱 Funcionamento offline

### ⚠️ Importante

- Os dados são salvos apenas no navegador atual
- Limpar o cache do navegador apagará os dados
- Faça backup dos dados importantes regularmente

### � Backup e Restauração

Para fazer backup dos seus dados:

1. Abra o Console do Navegador (F12)
2. Execute: `localStorage.getItem('dashboardEntries')`
3. Copie e salve o resultado em um arquivo

## 🏃‍♂️ Como Executar

### Desenvolvimento Local

1. Clone o repositório
2. Abra `public/index.html` no navegador
3. Comece a adicionar registros

### Deploy

1. Faça upload dos arquivos para qualquer servidor web
2. Não é necessária configuração adicional
3. Funciona em qualquer host estático

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Armazenamento**: LocalStorage API
- **Gráficos**: Chart.js
- **Compatibilidade**: Todos navegadores modernos

## 📱 Responsivo

Interface adaptada para:
- 🖥️ Desktop
- 📱 Tablet
- 📱 Mobile

## 🔒 Privacidade

**✅ BENEFÍCIOS**: 
- Dados salvos localmente
- Sem compartilhamento externo
- Sem necessidade de login
- Funcionamento offline completo

## 📞 Suporte

Se encontrar problemas:

1. **Verifique o console** do navegador (F12)
2. **Verifique o LocalStorage** na aba Application do DevTools
3. **Limpe o cache** se necessário
4. **Faça backup** dos dados importantes

## 📄 Licença

Este projeto é de uso interno para Infinity Center Plus.

---

**🎯 Objetivo**: Dashboard simples e eficiente para controle de ordens de serviço com armazenamento local.
