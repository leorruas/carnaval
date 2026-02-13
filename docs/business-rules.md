# Regras de Negócio e Funcionalidades

## 1. Funcionalidades Core (Já Implementadas)

### 1.1. Catálogo de Blocos
- O sistema exibe uma lista de 179 blocos do Carnaval BH 2026.
- **Regra**: A lista deve ser performática e carregada localmente ou via API otimizada.
- **Regra de Tempo**: Eventos passados devem ser ocultados automaticamente da visualização padrão para não poluir a lista.

### 1.2. Favoritos & Agenda
- Usuários podem favoritar blocos.
- **Persistência Cloud**: Os favoritos são sincronizados com o **Firebase Firestore** quando o usuário está logado. 
    - **Sincronização Imediata**: Toda alteração (favoritar/desfavoritar) é enviada instantaneamente ao Firestore para garantir consistência em tempo real.
    - **Hidratação**: Ao logar, se a nuvem tiver dados, eles substituem os locais. Se a nuvem estiver vazia, os favoritos locais são subidos automaticamente.
    - **Offline**: Usuários deslogados usam persistência local (fallback).
- **Minha Agenda**: Uma visualização filtrada apenas com os blocos favoritados.
- **Live Link (Link Permanente)**: Usuários logados têm um link único e permanente (`/agenda?uid=USER_ID`) que reflete sua agenda em tempo real.
    - **Sincronização Dupla**: Favoritos são sincronizados automaticamente para a coleção privada `users` e pública `public_agendas`.
    - **Sem Snapshot**: Não é necessário gerar links snapshot; o link é sempre vivo.
    - **Force Sync**: O sistema força uma sincronização imediata ao clicar em "Compartilhar" para prevenir dados desatualizados.
    - **Sem Bloqueio de Vazio**: É permitido compartilhar uma agenda vazia (ex: para começar a seguir amigos).
    - **Error Handling**: Feedback visual para sucesso (cópia) ou erro (permissões/falhas).
- **Seguidores (Following)**: Usuários logados podem "Seguir" a agenda de amigos.
    - **Persistência Cloud**: A lista de amigos é sincronizada com o perfil do usuário no Firestore, garantindo acesso em múltiplos dispositivos.
    - Amigos seguidos podem ser acessados rapidamente na aba "Amigos" da agenda.
- **Fluxo de Onboarding de Amigos**:
    - Ao acessar um Live Link, o sistema detecta se o usuário já segue o dono da agenda.
    - **Preview Mode**: Se não seguir, o usuário é direcionado automaticamente para a aba **Amigos**, exibindo um card de pré-visualização ("Novo Amigo Encontrado").
    - **Seguir para Ver**: O acesso à agenda completa do amigo é liberado após o clique em "Seguir", promovendo o engajamento social.

### 1.3. Filtros e Busca
- **Busca Global**: 
    - O usuário pode buscar por nome do bloco, bairro ou endereço globalmente.
    - **Regra de Prioridade**: Ao digitar uma busca, os filtros de data ("Hoje", "Calendário") são ignorados, exibindo resultados de todos os dias agrupados por data.
    - O campo de busca se sobrepõe visualmente aos seletores de data para indicar esse escopo global. (z-index fix).
- **Filtro por Data**: 
    - **Hoje**: Exibe eventos do dia atual (ou próximo disponível).
    - **Calendário**: Exibe estritamente os eventos do dia selecionado no seletor horizontal (Quick Nav).
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
- **Compartilhamento como Story**:
    - Permite gerar uma imagem (9:16) formatada para Instagram/Facebook Stories.
    - **Regra de Limite**: Máximo de 4 blocos por imagem para garantir legibilidade.
    - **Seleção Inteligente**: Se o usuário tiver > 4 favoritos no dia, ele deve selecionar exatamente quais 4 deseja compartilhar.
    - **Geração On-device**: A imagem é gerada via `html-to-image` e compartilhada diretamente do dispositivo (Native Share) ou baixada (Desktop).
    - **Design System Adaptável**: A imagem adapta cores e elementos automaticamente conforme o modo claro/escuro do dispositivo.

### 1.5. Sugestão e Aprovação de Blocos
- **Sugestão de Usuário**:
    - Qualquer usuário (logado) pode sugerir um novo bloco através de um formulário.
    - Campos obrigatórios: Nome, Data, Horário e Localização.
    - Status inicial: `pending`.
- **Painel Administrativo**:
    - **Segurança**: Acesso **exclusivo** para o e-mail administrador (`leoruas@gmail.com`). Regras de segurança do Firestore bloqueiam leitura/escrita para outros usuários.
    - **Tempo Real**: A lista de sugestões utiliza `onSnapshot` para atualizações instantâneas sem necessidade de refresh manual.
    - **Proteção**: Envios de sugestão possuem timeout de 30s e sistema de feedback aprimorado para conexões lentas.
    - Permite visualizar sugestões pendentes, aprovar ou rejeitar.
    - **Aprovação**: Move o bloco da coleção `suggested_blocks` para `approved_blocks`.
    - **Rejeição**: Exclui permanentemente a sugestão.
- **Dados Dinâmicos**: O app exibe a união dos blocos estáticos (JSON) com os blocos aprovados (Firestore).

### 1.6. Sistema de Avaliações e Comentários
- **Avaliação por Estrelas**: Usuários logados podem avaliar blocos (1 a 5 estrelas).
- **Auto-Aprovação (Regra de Rapidez)**: 
    - Avaliações enviadas **sem comentário de texto** são aprovadas automaticamente e publicadas no mesmo instante.
    - As estatísticas agregadas (média e total de reviews) no componente `BlockCard` são atualizadas em tempo real via Firestore.
- **Moderação de Comentários**:
    - Avaliações que contenham **texto (comentário)** são marcadas como `pending` e enviadas para o Painel Administrativo.
    - Apenas após a aprovação manual do admin o comentário fica visível para outros usuários e a nota é contabilizada na média.
- **Unicidade**: Cada usuário pode avaliar um bloco apenas uma vez. O sistema previne duplicidade via regras de segurança do Firestore e lógica no serviço.
- **Privacidade**: Comentários são exibidos de forma anônima para a comunidade.

## 2. Autenticação & Social (Firebase)
- **Firebase Auth**: Suporte para Login/Cadastro via E-mail e **Google Sign-In**.
- **Perfil**: Usuários podem ver seu progresso, logout e acessar recursos exclusivos como o Painel Admin (se autorizado).
- **Sincronização**: Favoritos são persistentes entre dispositivos para usuários logados.

## 3. Regras de Interface
- **Responsividade**: Mobile-first obrigatório.
- **Feedback**: Ações como "Favoritar" devem ter feedback visual imediato (micro-interações).
