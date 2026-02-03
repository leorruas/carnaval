---
name: Line Count Reduction
description: Estratégias para manter arquivos abaixo de 250 linhas através de extração de código.
---

# Line Count Reduction Skill

Esta skill foca em técnicas para reduzir a complexidade e tamanho de arquivos, visando o limite de 250 linhas.

## 1. Diagnóstico
Identifique o motivo do arquivo estar grande:
- **Excesso de JSX**: Renderização condicional complexa, muitos modais/diálogos inline? -> *Extrair Componentes*
- **Excesso de Lógica**: Muitos `useState`, `useEffect` e handlers? -> *Extrair Custom Hooks*
- **Constantes/Helpers**: Objetos de configuração estáticos ou funções puras? -> *Extrair Utils/Constants*

## 2. Estratégias de Extração

### A. Extração de Componentes (Prioridade 1)
Identifique blocos lógicos no JSX.
- **Candidatos**: Modais, Listas, Cards, Headers.
- **Ação**: Mova para arquivo separado em `src/components/<Feature>/`.
- **Exemplo**: `MyAgenda` -> `src/components/MyAgenda/AgendaHeader.jsx`.

### B. Extração de Hooks (Prioridade 2)
Agrupe estados e efeitos relacionados.
- **Candidatos**: Lógica de formulário, fetching de dados, listeners de eventos.
- **Ação**: Crie `src/hooks/use<Feature>.js`.
- **Retorno**: O hook deve retornar tudo que o componente precisa (dados e funções).

### C. Extração de Utilitários (Prioridade 3)
Funções que não dependem de estado do React.
- **Candidatos**: Formatadores de data, cálculos, validações.
- **Ação**: Mova para `src/utils/` ou `src/constants/`.

## 3. Checklist de Validação
- [ ] O arquivo original tem < 250 linhas?
- [ ] O código extraído tem responsabilidade única?
- [ ] Os imports foram atualizados corretamente?
- [ ] A aplicação roda sem erros no browser?
- [ ] Os testes associados continuam passando?
