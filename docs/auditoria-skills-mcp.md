# Skills e MCP — auditoria

## frontend-design

- Origem e licença preservadas em skills/frontend-design/SKILL.md e LICENSE.txt.
- A adaptação local determina precedência de rules/ e ADRs; preserva Nocturne e não pode criar requisito, biblioteca ou identidade visual nova.
- Uso nesta entrega: implementação das seis telas da spec 001. Tokens existentes, Open Sans, primária de fundo #001449, ação #5B7FE0, texto #E6EAF6, sidebar 236px, conteúdo alinhado à esquerda.
- Composição: `sidebar | conteúdo`; login `hero | formulário`; catálogo `filtros / cards`; detalhe `ficha | solicitação`; cadastro `formulário | prévia`. Sem gráficos ou ilustrações novas, pois não há CA que os peça.
- Ativação positiva: construir/revisar interface. Ativação negativa: migration, autenticação e handoff não exigem essa skill.
- Scripts de instalação externos: nenhum da skill é executado.

### Evidência de uso e limite das provas

A skill foi carregada para implementar as telas desta spec, preservando os ADRs. A ativação agora também foi conferida pelo scanner nativo do Codex (`skills/list`, com releitura): `frontend-design`, escopo `repo`, `enabled: true`, sem erros, tanto na pasta do projeto como na pasta de trabalho aberta. Os registros em `.agents/skills/frontend-design` são Junctions para a mesma fonte em `skills/frontend-design`; não há cópia duplicada. O template não foi ativado. A configuração `agents/openai.yaml` permite seleção implícita.

As duas provocações da aula 10 foram executadas em subagentes com contexto novo, sem indicar o resultado esperado ou nomear a skill no pedido:

| Prova | Pedido natural | Resultado observado |
|---|---|---|
| Positiva — prova_visual_skill | Revisar composição, tipografia, foco e movimento do catálogo contra layout/CA-12, somente leitura | Leu as descriptions, carregou frontend-design por pertinência e realizou a revisão; encontrou diferenças reais de contagem, chips, faixa e foco, encaminhadas à correção. |
| Negativa — prova_banco_skill | Explicar DATABASE_URL/DIRECT_URL e o procedimento de migration sem modificar código/banco | Leu somente frontmatter das skills; não carregou a skill visual, cujo escopo exclui banco. Respondeu a partir de schema, ADR e rules. |

Nenhum dos avaliadores alterou arquivos ou acessou credenciais. As provas demonstram os dois casos observados; não garantem seleção correta para todo pedido futuro. O carregamento automático é por pertinência da description, e a invocação explícita continua disponível como `$frontend-design`.

## MCP

.mcp.json mantém inventário explícito vazio: não há servidor de banco configurado no repositório. Não se presume uma integração só porque o arquivo existe.

Prisma Migrate, testes e diagnóstico de conectividade já resolvem a execução técnica por CLI. Nenhum MCP genérico recebe DIRECT_URL/service_role. Se for conectado um servidor futuramente, deverá ter identidade própria, escopo de projeto e leitura, ser auditado contra as regras e ter as três provas da aula 10 registradas.

O pedido de verificar Supabase é atendido pelo diagnóstico `npm run check:supabase`: saúde de Auth e SELECT 1 apenas quando uma conexão PostgreSQL remota válida estiver configurada. Não é apresentado como prova de MCP.
