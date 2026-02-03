---
description: Processo seguro para refatorar arquivos grandes antes de enviar para o GitHub.
---

# Safe Refactor & Push Workflow

Este workflow garante que códigos grandes sejam refatorados e testados antes de serem versionados.

1. **Identificar Arquivos Grandes**
   Execute o comando para listar arquivos JSX com mais de 250 linhas:
   ```bash
   find src -name "*.jsx" -print0 | xargs -0 wc -l | awk '$1 > 250'
   ```

2. **Selecionar Alvo**
   Escolha o arquivo com maior contagem ou maior complexidade para refatorar primeiro.

3. **Aplicar Skill de Redução**
   Consulte a skill de redução para estratégias:
   - [Skill: Line Count Reduction](file:///Users/leoruas/Desktop/carnaval/.agent/skills/refactoring_for_size/SKILL.md)

4. **Planejamento de Verificação**
   Adicione explicitamente no `task.md` tarefas para verificar a refatoração. O planejamento deve incluir:
   - Quais testes automatizados rodar (ex: `npm test src/file.test.jsx`).
   - Quais fluxos manuais verificar.
   - Critérios de aceitação (ex: "Build passa", "Lint sem erros").

5. **Verificação Local (Turbo)**
   // turbo-all
   Rode os testes especificamente para o arquivo modificado (substitua pelo nome do seu arquivo de teste):
   ```bash
   npm test -- src/path/to/test.jsx
   ```

5. **Verificação Global**
   Garanta que nada quebrou regressivamente.
   ```bash
   npm run build
   ```

6. **Commit & Push**
   Se tudo passar, prossiga com o envio.
