# Style Guide & Design System

## 1. Tech Stack
- **Framework CSS**: TailwindCSS + PostCSS
- **Framework JS**: React (Vite)
- **Animações**: Framer Motion

## 2. Cores (Sistema HSL)
O projeto utiliza um sistema de variáveis HSL para facilitar a manutenção e suporte a **Dark Mode**.

- **Background (`--background`)**: Cor de fundo principal.
- **Foreground (`--foreground`)**: Cor principal do texto.
- **Primary (`--primary`)**: Cor de destaque (Deep Purple).
- **Secondary (`--secondary`)**: Tons de cinza claro para fundos alternativos.
- **Card (`--card`)**: Estilização específica para containers de blocos.
- **Brand Colors**:
    - `brand-blue`: #0038FF
    - `brand-green`: #00BD6D
    - `brand-orange`: #FF5F1E
    - `brand-light`: #E7E0D3
    - `brand-pink`: #F2AEC1
- **Pastéis**: Cores como `pastel-purple`, `pastel-peach`, `pastel-teal` e `pastel-pink` são usadas para categorização visual dos blocos.

## 3. Tipografia
- **Fonte Principal**: `Outfit` (Geométrica e moderna).
- **Headings**: Grandes e com tracking reduzido para impacto visual.

## 4. Logo e Identidade
- **Logo**: SVG otimizado ("TáTeno") focado no logotype.
- **Aplicações**:
    - **Header**: Versão monocromática (`text-foreground`) escalável.
    - **Responsividade**: Adapta-se à largura do container (`max-w-full`) para evitar overflow em telas pequenas.

## 4. Componentes UI

### Pill Toggle
- Utilizado para alternar entre "Hoje", "Calendário" e "Favoritos".
- Possui animação de fundo via `framer-motion`.
- **Glassmorphism**: Utiliza classe `glass` com `backdrop-blur-sm` e `bg-muted/20` para efeito de vidro fosco.

### Dynamic Header
- **Comportamento**: Header **sticky** no topo com apenas logo e botões de ação (busca, filtro, tema).
- **Navigation Section**: PillToggle e seletor de dias foram movidos para **fora do header** e rolam naturalmente com a página.
- **Escala**: O logo e os elementos internos são escalonados proporcionalmente via `useTransform`.
- **Blur**: Utiliza `backdrop-blur-xl` para manter a legibilidade sobre o conteúdo.
- **Search UX**: Implementa padrão mobile com botão "Cancelar" visível ao lado do input de busca.

### Cards de Blocos (Clean Gummy)
- **Cantos**: `rounded-[32px]` (Estética "Gummy").
- **Visual**: Cores pastéis suaves com bordas sutis em Dark Mode.
- **Interação**: Micro-interações de escala ao passar o mouse.
- **Utilitários**: Inclui botões de "Rota", "Uber" e "Bus", além de um botão de cópia rápida para o endereço com feedback animado.
- **Countdown**: Redesenhado para um formato de pílula vibrante com fundo na cor primária. Inclui prefixo "Falta: " para clareza.
- **Favorite Button**: Heart icon vermelho (`fill-red-500`, `text-red-500`) quando favoritado para melhor feedback visual.

### Day Selector Buttons
- **Visual**: Utilizam classe `glass` para efeito glassmorphic consistente.
- **Layout**: Scroll horizontal com `rounded-2xl` e hover states com `bg-primary/10`.

### My Agenda Page
- **Header**: Sticky com título estilizado ("Minha" em itálico + "Agenda" em primary).
- **Empty State**: Layout centralizado com ícone circular, tipografia moderna e botão "Explorar blocos" em estilo tabbar.
- **Action Buttons**: Share e Export com `bg-muted/30` e `hover:bg-primary/10` matching BottomNav aesthetic.
- **Next Block Card**: Utiliza classe `countdown-card` do design system com gradiente.

### Header Centrado
- Elementos de navegação (PillToggle) e seletores de data são horizontalmente centrados para melhor equilíbrio visual.

### Bottom Navigation (Minimalist)
- **Labels**: Permanently removed (`span` and `label` logic deleted).
- **Icons**: Uses Lucide icons with dynamic stroke weights (2.5px when active, 1.5px when inactive).
- **Background**: `backdrop-blur-2xl` with a subtle primary background overlay on the active icon's container.

## 5. Diretrizes de Código
- Utilize classes utilitárias do Tailwind (`className`).
- Evite CSS puro (`style={{}}`) a menos que estritamente necessário para valores dinâmicos.
- Mantenha componentes pequenos e reutilizáveis.
- **Testes**: Todos os componentes UI devem ter testes automatizados com Vitest e React Testing Library.
