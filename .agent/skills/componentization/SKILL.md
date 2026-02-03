---
name: Componentization
description: Protocolo para identificar, desenhar e implementar componentes de UI reutilizáveis.
---

# Componentization Skill

Esta skill define o processo padrão para a criação e refatoração de componentes de UI. O objetivo é garantir consistência, reusabilidade e manutenibilidade.

## 1. Identificação
Antes de codar, responda:
- **Responsabilidade**: O que este componente faz? Ele é puramente apresentacional ou possui lógica de negócio?
- **Reusabilidade**: Ele será usado em mais de um lugar? Se sim, quão genérico ele precisa ser?
- **Nível Atômico**: Ele é um Átomo (ex: Button), Molécula (ex: SearchBar) ou Organismo (ex: Header)?

## 2. Design da API (Props)
- **Props Explícitas**: Defina tipos claros para todas as props. Evite passar objetos inteiros se apenas um ou dois campos são usados.
- **Composição**: Use `children` para permitir flexibilidade de conteúdo sempre que possível.
- **Eventos**: Use convenções de nomenclatura padrão para callbacks, como `onClick`, `onChange`, `onSubmit`.

## 3. Estilização (Tailwind CSS)
- **Mobile First**: Escreva classes base para mobile e use breakpoints (`md:`, `lg:`) para desktop.
- **Classes Utilitárias**: Evite `@apply` a menos que estritamente necessário para manter consistência em componentes muito repetidos.
- **Tokens do Design System**: Use as cores e fontes definidas no `index.css` ou configuração do Tailwind. Não hardcode cores hexadecimais arbitrárias.

## 4. Estado e Lógica
- **Local vs Global**: Mantenha o estado local (`useState`) se ele afetar apenas o componente. Use `zustand` ou Context API apenas se o estado precisar ser compartilhado.
- **Custom Hooks**: Extraia lógica complexa para hooks customizados (ex: `useBlockFilter`) para manter o componente limpo.

## 5. Acessibilidade (a11y)
- **Semântica HTML**: Use as tags corretas (`<button>`, `<nav>`, `<header>`).
- **ARIA**: Adicione atributos `aria-*` quando a semântica visual não for suficiente (ex: `aria-expanded` para menus).
- **Teclado**: Garanta que todos os elementos interativos sejam focáveis e acionáveis via teclado.
