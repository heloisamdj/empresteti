## Quando
Ao iniciar qualquer funcionalidade nova do PRD.

## Procedimento
1. Crie docs/specs/<NNN-nome-curto>/ com spec.md.
2. Antes de escrever a spec, liste as perguntas que o PRD não
   responde. Espere as respostas.
3. plan.md sai da spec e cita os ADRs que o restringem.
4. tasks.md sai do plano. Cada tarefa cita um CA-xx e cabe
   num commit.
5. Uma tarefa por vez. Ao terminar, siga rules/checks.md.

## Não faça
- Não escreva código antes do plano aprovado.
- Não crie pasta de spec fora do padrão NNN-nome-curto.


## Antes de declarar uma spec pronta
- Delegue ao subagente verificador-spec (agents/verificador-spec.md),
  passando o caminho da spec e o intervalo de commits.
- A spec só é pronta com "Veredito: PRONTA". Qualquer outro resultado
  volta para as tarefas — quem corrige é o agente principal, nunca o
  verificador.
- Para a prática, inicie uma sessão Codex nova em snapshot somente de
  arquivos versionados, sem credenciais, com sandbox somente leitura,
  rede do shell bloqueada e aprovações desativadas. Acione o papel
  `verificador-spec` de `.codex/agents/`. O verificador recebe a spec,
  o SHA e as saídas dos checks executados fora da sessão isolada.
- Na rodada final da prática, passe o SHA-base ao executor
  `node scripts/review-spec.mjs <spec.md> <SHA> <checks.txt> <SHA-base>`
  para incluir o diff. Registre evidências de produção na pasta da spec
  e confira que `checks.txt` não contém segredos antes de enviá-lo.
- Registre a tabela e o veredito em `verificacao.md`. O CI do PR e da
  tag `entrega-pratica` confere o parecer, a cobertura dos CAs e se a
  revisão ainda corresponde aos arquivos entregues.
