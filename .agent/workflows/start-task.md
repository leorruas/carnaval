---
description: Como iniciar uma tarefa garantindo o uso das ferramentas e documentos corretos
---

Este workflow DEVE ser executado pelo Agente de IA no início de QUALQUER solicitação do usuário.

1. **Mapeamento de Contexto**
   - Liste todos os arquivos mencionados ou relacionados à tarefa.
   - Identifique quais subdiretórios serão afetados.

2. **Seleção de Skills (Obrigatório)**
   - Identifique e liste skills relevantes para a tarefa (ex: `test_application` para novos recursos).
   - Leia o arquivo `SKILL.md` das skills selecionadas.

3. **Mandated Document Reading (Obrigatório)**
   - Leia integralmente o `docs/business-rules.md`.
   - Leia integralmente o `docs/tech-stack.md` (se existir).

4. **Criação do Plano (PLANNING & BREAKDOWN)**
   - Utilize a skill `task_breakdown` (se disponível) para decompor a solicitação.
   - **Breakdown Atômico (Obrigatório)**: O `task.md` deve conter tarefas granulares.
     - Cada tarefa deve ter uma responsabilidade única.
     - Deve existir um critério de verificação claro para cada item.
     - Evite tarefas genéricas como "Implementar feature X"; use "Criar componente Y", "Adicionar lógica de Z", "Validar rendering de W".
   - **Critical**: Utilize a skill `test_application` para definir a estratégia de testes *antes* de codar (Quais testes unitários? Quais snapshots?).
   - Crie o `implementation_plan.md` incluindo uma seção dedicada a testes.
   - Liste explicitamente no `task.md` as etapas de verificação para cada item atômico.

5. **Análise do Plano (Skill Check)**
   - Leia as instruções em `.agent/skills/plan_analysis/SKILL.md`.
   - Execute uma análise crítica do seu próprio plano usando a skill `plan_analysis`.
   - Se a análise apontar falhas ou riscos, revise o plano ANTES de pedir aprovação ao usuário.
