# Regras de Negócio e Funcionalidades

## 1. Funcionalidades Core (Já Implementadas)

### 1.1. Catálogo de Blocos
- O sistema exibe uma lista de 179 blocos do Carnaval BH 2026.
- **Regra**: A lista deve ser performática e carregada localmente ou via API otimizada.
- **Regra de Tempo**: Eventos passados devem ser ocultados automaticamente da visualização padrão para não poluir a lista.

### 1.2. Favoritos & Agenda
- Usuários podem favoritar blocos.
- **Persistência**: Os favoritos são salvos no **Local Storage** do navegador (não requer login).
- **Minha Agenda**: Uma visualização filtrada apenas com os blocos favoritados.

### 1.3. Filtros e Busca
- **Busca Global**: O usuário pode buscar por nome do bloco, bairro ou endereço. A busca é ativada por um botão no header.
- **Filtro por Data**: O usuário pode filtrar blocos por dia específico através das abas de navegação (Hoje, Calendário, Favoritos) e um seletor rápido de dias (Quick Nav) centralizado no modo Calendário/Favoritos. Eventos passados são filtrados automaticamente.
- **Ações Rápidas**: Reposicionamento do botão de filtro para o header para evitar obstrução visual.

### 1.4. Ferramentas Úteis
- **Countdown**: Contador em tempo real para o início do carnaval.
- **Exportação**: Funcionalidade de "Add to Calendar" para Google Calendar.
- **Geolocalização**:
    - Cálculo de distância até o bloco usando OSRM (grátis).
    - Integração com Google Maps para rotas de ônibus.
    - Integração com Deep Link do Uber para estimativa de preço.
- **Address & Copy**: Exibição do endereço completo do bloco com funcionalidade de cópia rápida para a área de transferência.

## 2. Funcionalidades Opcionais (Firebase)
*Estas funcionalidades dependem de configuração explicita das chaves do Firebase.*
- Login/Cadastro (Auth)
- Notificações Push
- Sistema de Amigos
- Sincronização Cloud

## 3. Regras de Interface
- **Responsividade**: Mobile-first obrigatório.
- **Feedback**: Ações como "Favoritar" devem ter feedback visual imediato (micro-interações).
