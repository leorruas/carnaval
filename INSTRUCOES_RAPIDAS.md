# 🚀 INÍCIO RÁPIDO

## Para rodar o app AGORA:

### 1. Abra o terminal/prompt na pasta do projeto

### 2. Instale as dependências:
```bash
npm install
```

### 3. Rode o app:
```bash
npm run dev
```

### 4. Abra no navegador:
```
http://localhost:3000
```

## ✅ O que JÁ FUNCIONA (sem configuração):

✅ Lista de 179 blocos do Carnaval BH 2026
✅ Favoritar blocos (salva no navegador)
✅ Countdown em tempo real
✅ Filtros por data
✅ Minha agenda personalizada
✅ Compartilhar agenda
✅ Exportar para Google Calendar
✅ Ver distância até o bloco (OSRM - grátis!)
✅ Abrir Google Maps com rota de ônibus
✅ Estimativa de preço Uber + deep link

## ⚙️ Configuração Opcional (Firebase)

Só configure se quiser:
- Login/cadastro de usuários
- Notificações push
- Sistema de amigos
- Sincronização entre dispositivos

Veja README.md completo para instruções detalhadas!

## 🐛 Problemas?

### Erro "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta 3000 ocupada
No arquivo `vite.config.js`, mude a porta:
```js
server: { port: 3001 }
```

---

**Divirta-se! 🎉**
