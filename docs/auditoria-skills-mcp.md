# Skills e MCP — auditoria

## frontend-design

- Origem e licença preservadas em skills/frontend-design/SKILL.md e LICENSE.txt.
- A adaptação local determina precedência de rules/ e ADRs; preserva Nocturne e não pode criar requisito, biblioteca ou identidade visual nova.
- Uso nesta entrega: implementação das seis telas da spec 001. Tokens existentes, Open Sans, primária de fundo #001449, ação #5B7FE0, texto #E6EAF6, sidebar 236px, conteúdo alinhado à esquerda.
- Composição: `sidebar | conteúdo`; login `hero | formulário`; catálogo `filtros / cards`; detalhe `ficha | solicitação`; cadastro `formulário | prévia`. Sem gráficos ou ilustrações novas, pois não há CA que os peça.
- Ativação positiva: construir/revisar interface. Ativação negativa: migration, autenticação e handoff não exigem essa skill.
- Scripts de instalação externos: nenhum da skill é executado.

### Evidência de uso e limite das provas

A skill foi carregada para implementar as telas desta spec, e suas orientações foram aplicadas preservando os ADRs. Migrações, roteadores e diagnóstico de conexão seguiram os procedimentos correspondentes do projeto. As provocações de ativação positiva e negativa em sessões novas, pedidas na aula 10, não foram executadas como sessões independentes; não são marcadas como concluídas por mera inspeção da description. Para reproduzi-las, abrir uma sessão limpa por caso: pedir revisão visual de uma tela com CA existente e observar a skill; em outra, pedir diagnóstico de migration e observar que a skill visual não é carregada. Registrar as chamadas e a decisão de ativação, sem mudar código ou decisões do produto.

## MCP

.mcp.json mantém inventário explícito vazio: não há servidor de banco configurado no repositório. Não se presume uma integração só porque o arquivo existe.

Prisma Migrate, testes e diagnóstico de conectividade já resolvem a execução técnica por CLI. Nenhum MCP genérico recebe DIRECT_URL/service_role. Se for conectado um servidor futuramente, deverá ter identidade própria, escopo de projeto e leitura, ser auditado contra as regras e ter as três provas da aula 10 registradas.

O pedido de verificar Supabase é atendido pelo diagnóstico `npm run check:supabase`: saúde de Auth e SELECT 1 apenas quando uma conexão PostgreSQL remota válida estiver configurada. Não é apresentado como prova de MCP.
