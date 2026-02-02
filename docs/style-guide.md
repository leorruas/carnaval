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

### Cards de Blocos (Clean Gummy)
- **Cantos**: `rounded-[32px]` (Estética "Gummy").
- **Visual**: Cores pastéis suaves com bordas sutis em Dark Mode.
- **Interação**: Micro-interações de escala ao passar o mouse.

## 5. Diretrizes de Código
- Utilize classes utilitárias do Tailwind (`className`).
- Evite CSS puro (`style={{}}`) a menos que estritamente necessário para valores dinâmicos.
- Mantenha componentes pequenos e reutilizáveis.
