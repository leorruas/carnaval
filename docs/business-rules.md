# Regras de Negócio e Funcionalidades

## 1. Funcionalidades Core (Já Implementadas)

### 1.1. Catálogo de Blocos
- O sistema exibe uma lista de 179 blocos do Carnaval BH 2026.
- **Regra**: A lista deve ser performática e carregada localmente ou via API otimizada.
- **Regra de Tempo**: Eventos passados devem ser ocultados automaticamente da visualização padrão para não poluir a lista.

### 1.2. Favoritos & Agenda
- Usuários podem favoritar blocos.
- **Persistência Cloud**: Os favoritos são sincronizados com o **Firebase Firestore** quando o usuário está logado. 
    - **Hidratação**: Ao logar, se a nuvem tiver dados, eles substituem os locais. Se a nuvem estiver vazia, os favoritos locais são subidos automaticamente.
    - **Offline**: Usuários deslogados usam persistência local (fallback).
- **Minha Agenda**: Uma visualização filtrada apenas com os blocos favoritados.
- **Compartilhamento Stateful**: Usuários logados podem gerar um link único para compartilhar sua agenda. As agendas compartilhadas são salvas na coleção `shared_agendas`.
    - **Timeout Protection**: Operações de compartilhamento têm timeout de 10 segundos para evitar estados de loading infinito.
    - **Validação**: Não é possível compartilhar uma agenda vazia - o sistema valida antes de tentar criar o link.
    - **Error Handling**: Mensagens de erro amigáveis para timeout, problemas de conexão, e permissões Firebase.
- **Match System**: Ao visualizar a agenda de um amigo, o sistema compara com os seus favoritos e exibe um badge de "Match" em blocos comuns.
- **Seguidores (Following)**: Usuários logados podem "Seguir" a agenda de amigos. Amigos seguidos são salvos no perfil do usuário e podem ser acessados rapidamente na aba "Amigos" da agenda.

### 1.3. Filtros e Busca
- **Busca Global**: O usuário pode buscar por nome do bloco, bairro ou endereço. A busca é ativada por um botão no header.
- **Filtro por Data**: 
    - **Hoje**: Exibe eventos do dia atual (ou próximo disponível).
    - **Calendário**: Exibe estritamente os eventos do dia selecionado no seletor horizontal (Quick Nav). O seletor é "sticky" no topo da tela.
    - **Favoritos**: Exibe apenas blocos favoritados.
    - Eventos passados são filtrados automaticamente da visualização padrão.
- **Ações Rápidas**: Reposicionamento do botão de filtro para o header para evitar obstrução visual.

### 1.4. Ferramentas Úteis
- **Countdown**: Contador em tempo real para o início do carnaval.
- **Exportação**: Funcionalidade de "Add to Calendar" para Google Calendar.
- **Geolocalização**:
    - Cálculo de distância até o bloco usando OSRM (grátis).
    - Integração com Google Maps para rotas de ônibus.
    - Integração com Deep Link do Uber para estimativa de preço.
- **Address & Copy**: Exibição do endereço completo do bloco com funcionalidade de cópia rápida para a área de transferência.

## 2. Autenticação & Social (Firebase)
- **Firebase Auth**: Suporte para Login/Cadastro via E-mail e **Google Sign-In**.
- **Perfil**: Usuários podem ver seu progresso (blocos favoritados) e logout.
- **Sincronização**: Favoritos são persistentes entre dispositivos para usuários logados.

## 3. Regras de Interface
- **Responsividade**: Mobile-first obrigatório.
- **Feedback**: Ações como "Favoritar" devem ter feedback visual imediato (micro-interações).
