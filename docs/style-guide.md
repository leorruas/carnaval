# Style Guide & Design System

## 1. Tech Stack
- **Framework CSS**: TailwindCSS
- **Framework JS**: React (Vite)

## 2. Cores (Tailwind Config)
*Consultar `tailwind.config.js` para valores hexadecimais exatos.*

- **Primary**: Cores vibrantes alusivas ao carnaval.
- **Background**: Suporte a Dark Mode (se aplicável) ou fundos claros para leitura.

## 3. Tipografia
- Fontes modernas e legíveis (Inter, Roboto ou similar configurado no projeto).

## 4. Componentes UI

### Botões
- Devem ter estados de `:hover` e `:active`.
- Botões de ação principal (CTA) devem se destacar.

### Cards de Blocos
- Devem conter: Nome, Data, Hora, Local e botão de Favoritar.
- Layout deve ser consistente em lista.

## 5. Diretrizes de Código
- Utilize classes utilitárias do Tailwind (`className`).
- Evite CSS puro (`style={{}}`) a menos que estritamente necessário para valores dinâmicos.
- Mantenha componentes pequenos e reutilizáveis.
