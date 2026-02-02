---
description: Como finalizar uma tarefa garantindo a qualidade
---

Este workflow DEVE ser executado pelo Agente de IA ao final de cada tarefa antes de solicitar a revisão do usuário.

1. **Limpeza de Debug**
   - Remova todos os `console.log` adicionados para depuração.
   - Remova blocos de código comentados ou "mortos".

2. **Execução de Testes (Obrigatório)**
   - Utilize a skill `test_application` para executar a suíte de testes (`npm test` ou `vitest`).
   - Se ainda não houver testes automatizados, valide manualmente e considere criar um teste de regressão.
   - **NUNCA** finalize a tarefa com erros de build.

3. **Verificação de Regras de Negócio**
   - Consulte o `docs/business-rules.md` para garantir que a mudança não viola nenhuma regra conheicda.

4. **Atualização de Documentação (Skill Check)**
   - Utilize a skill `update_documentation` para registrar as mudanças no `CHANGELOG.md` e em outros documentos afetados.

5. **Commit e Push (Skill Check)**
   - Utilize a skill `github_interaction` para criar um commit semântico com as alterações.
   - Realize o push para o repositório remoto.

6. **Notificação de Sucesso**
   - Inclua no sumário de entrega a confirmação de que a build passou e a documentação foi atualizada.
