# 🎭 Carnaval BH 2026 - App de Agenda

App completo para organizar sua agenda do Carnaval de Belo Horizonte 2026!

## ✨ Funcionalidades

### ✅ Implementadas
- 📅 **Lista completa de 179 blocos** do Carnaval BH 2026
- ❤️ **Sistema de favoritos** - marque os blocos que você quer ir
- ⏱️ **Countdown em tempo real** - veja quanto tempo falta para cada bloco
- 📍 **Cálculo de distância** - veja a distância até o bloco usando sua localização
- 🚌 **Rotas de transporte** - abra Google Maps com rota de ônibus
- 🚗 **Integração Uber** - estimativa de preço e deep link para o app
- 🗓️ **Minha Agenda** - visualize apenas seus blocos favoritos
- 📤 **Compartilhar agenda** - compartilhe seus blocos nas redes sociais
- 💾 **Exportar para calendário** - baixe arquivo .ics para importar no Google Calendar
- 🎨 **Interface responsiva** - funciona em mobile, tablet e desktop
- 🔍 **Filtros avançados** - filtre por data e favoritos

### 🚧 Para Implementar
- 🔐 Login/Cadastro com Firebase Auth
- 🔔 Notificações push customizáveis
- 👥 Sistema de amigos
- 🗺️ Mapa interativo com todos os blocos
- 💬 Chat entre amigos
- 📸 Feed de fotos dos blocos

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Instalação

1. **Clone ou extraia o projeto**
```bash
cd carnaval-bh-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase (Opcional para funcionalidades básicas)**

Se quiser usar Firebase (auth, notificações, etc):
- Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
- Copie as credenciais do Firebase
- Copie `.env.example` para `.env`
- Preencha as credenciais em `.env`
- Atualize `src/services/firebase.js` com suas credenciais

4. **Rode o projeto**
```bash
npm run dev
```

O app estará disponível em `http://localhost:3000`

## 📦 Build para Produção

### Vercel (Recomendado - 100% Grátis)

1. **Crie conta no Vercel**: https://vercel.com
2. **Conecte seu repositório GitHub**
3. **Deploy automático!** ✨

Ou via CLI:
```bash
npm install -g vercel
npm run build
vercel
```

### Firebase Hosting

```bash
npm install -g firebase-tools
npm run build
firebase login
firebase init hosting
firebase deploy
```

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework frontend
- **Vite** - Build tool super rápido
- **TailwindCSS** - Estilização
- **React Router** - Navegação
- **Zustand** - Gerenciamento de estado
- **date-fns** - Manipulação de datas
- **Leaflet** - Mapas (OpenStreetMap)
- **Lucide React** - Ícones
- **Firebase** - Backend (auth, database, notificações)
- **OSRM** - Rotas e distâncias (100% gratuito!)

## 📁 Estrutura do Projeto

```
carnaval-bh-app/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── BlockCard.jsx
│   │   └── BottomNav.jsx
│   ├── pages/          # Páginas/rotas
│   │   ├── Home.jsx
│   │   └── MyAgenda.jsx
│   ├── services/       # Serviços (Firebase, etc)
│   │   └── firebase.js
│   ├── store/          # Estado global (Zustand)
│   │   └── useStore.js
│   ├── utils/          # Funções utilitárias
│   │   ├── dateUtils.js
│   │   └── locationUtils.js
│   ├── data/           # Dados dos blocos
│   │   ├── blocos.json
│   │   └── blocos.csv
│   ├── styles/         # Estilos globais
│   │   └── index.css
│   ├── App.jsx         # Componente principal
│   └── main.jsx        # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Customização

### Adicionar mais blocos

Edite `src/data/blocos.json` ou `src/data/blocos.csv`

### Mudar cores do tema

Edite `tailwind.config.js`:
```js
colors: {
  carnival: {
    yellow: '#FFD700',
    green: '#00A86B',
    blue: '#0047AB',
    red: '#DC143C',
    purple: '#9370DB'
  }
}
```

### Adicionar novos campos aos blocos

1. Adicione o campo em `src/data/blocos.json`
2. Atualize `BlockCard.jsx` para exibir o novo campo

## 🔒 Configuração do Firebase (Completa)

### 1. Criar projeto Firebase

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Siga o wizard de criação

### 2. Ativar serviços

No console do Firebase:
- **Authentication** → Ativar "Email/senha" e "Google"
- **Firestore Database** → Criar database (modo teste)
- **Cloud Messaging** → Ativar

### 3. Obter credenciais

1. Configurações do projeto → Configurações gerais
2. Seus apps → Adicionar app Web
3. Copie as credenciais

### 4. Configurar no app

Edite `src/services/firebase.js` e substitua:
```js
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  // ...
};
```

### 5. Configurar Cloud Messaging (Notificações)

1. Cloud Messaging → Gerar par de chaves (VAPID)
2. Copie a chave pública
3. Adicione em `firebase.js`:
```js
vapidKey: 'SUA_VAPID_KEY'
```

## 🌐 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Build
npm run build

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Firebase Hosting
```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Build
npm run build

# Deploy
firebase deploy
```

## 🐛 Troubleshooting

### Localização não funciona
- Verifique se o site está em HTTPS (obrigatório para geolocalização)
- Verifique permissões do navegador

### Notificações não aparecem
- Notificações Web não funcionam no iOS Safari
- Verifique se deu permissão no navegador
- Verifique se configurou o VAPID key no Firebase

### Build falha
```bash
# Limpar cache
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

## 📱 PWA (Progressive Web App)

Para transformar em PWA instalável:

1. Instale o plugin:
```bash
npm install vite-plugin-pwa -D
```

2. Configure em `vite.config.js`
3. Adicione manifest e ícones

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Licença

MIT License - sinta-se livre para usar em seus projetos!

## 🎉 Próximos Passos

### Funcionalidades Sugeridas

1. **Sistema de Login completo**
   - Implementar AuthContext
   - Telas de login/cadastro
   - Recuperação de senha

2. **Notificações Push**
   - Implementar Cloud Functions
   - Sistema de agendamento
   - Customização por bloco

3. **Sistema de Amigos**
   - Adicionar por email/link
   - Ver agenda dos amigos
   - Criar grupos

4. **Mapa Interativo**
   - React Leaflet
   - Marcadores dos blocos
   - Rota entre blocos

5. **Funcionalidades Sociais**
   - Feed de fotos
   - Check-in nos blocos
   - Comentários e avaliações

6. **Melhorias UX**
   - Modo offline (PWA)
   - Dark mode
   - Animações

## 💡 Dicas de Desenvolvimento

### Performance
- Use `React.memo()` em componentes pesados
- Lazy loading de rotas
- Otimize imagens

### SEO
- Adicione meta tags
- Configure Open Graph
- Sitemap.xml

### Acessibilidade
- Use ARIA labels
- Navegação por teclado
- Alto contraste

## 📞 Suporte

Problemas? Abra uma issue no GitHub!

---

**Desenvolvido com ❤️ para o Carnaval de BH 2026** 🎭✨
