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
- **Pastéis**: Cores como `pastel-purple`, `pastel-peach`, `pastel-teal` e `pastel-pink` são usadas para categorização visual dos blocos.

## 3. Tipografia
- **Fonte Principal**: `Outfit` (Geométrica e moderna).
- **Headings**: Grandes e com tracking reduzido para impacto visual.

## 4. Componentes UI

### Pill Toggle
- Utilizado para alternar entre "Hoje", "Calendário" e "Favoritos".
- Possui animação de fundo via `framer-motion`.

### Dynamic Header
- **Comportamento**: O header reduz sua altura e padding ao rolar a página para cima (scroll > 50px).
- **Escala**: O logo e os elementos internos são escalonados proporcionalmente via `useTransform`.
- **Blur**: Utiliza `backdrop-blur-xl` para manter a legibilidade sobre o conteúdo.

### Cards de Blocos (Clean Gummy)
- **Cantos**: `rounded-[32px]` (Estética "Gummy").
- **Visual**: Cores pastéis suaves com bordas sutis em Dark Mode.
- **Interação**: Micro-interações de escala ao passar o mouse.
- **Utilitários**: Inclui botões de "Rota", "Uber" e "Bus", além de um botão de cópia rápida para o endereço com feedback animado.

## 5. Diretrizes de Código
- Utilize classes utilitárias do Tailwind (`className`).
- Evite CSS puro (`style={{}}`) a menos que estritamente necessário para valores dinâmicos.
- Mantenha componentes pequenos e reutilizáveis.
