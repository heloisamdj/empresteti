# Spec 002 — Dados iniciais da prática

Status: aprovada pela estudante para implementação local.

## Objetivo

Preparar 12 equipamentos fotografados no tenant `suporte_ti` e a conta do professor para a correção no EmpresTI publicado. O responsável pela entrega executa as gravações no Supabase.

## Decisões

- A lista literal da atividade está em `skills/imagens-equipamentos/assets/equipamentos.json`. O TI-0004, TI-0007 e TI-0010 ficam em manutenção e os outros nove começam disponíveis. A estudante confirmou seguir a lista diante da divergência com o briefing.
- Cada foto vem da API do Pixabay conforme a atualização comunicada pela estudante. O recorte usa o Playwright existente e a revisão humana impede fotos com pessoas, marcas, logos, texto ou telas com conteúdo. A página que mostra as fotos inclui o crédito com link.
- O patrimônio é único no tenant. Uma repetição com os mesmos dados mantém o estado e o histórico. Em conflito com um cadastro existente, a carga informa a diferença e para.
- A categoria Cabo é adicionada ao cadastro. A categoria Acessório permanece para registros existentes e itens de outras classes.
- O professor tem perfil colaborador no tenant e zero empréstimos. O operador provisiona e confirma a identidade no Supabase Auth e vincula o UID correspondente. A senha padrão da turma é configurada fora do Git. Os testes usam outra conta.
- Cadastro pela interface, importação da planilha e redesenho do catálogo ficam fora desta spec. Os componentes existentes recebem o campo de foto e o crédito. Itens antigos sem foto mantêm sua apresentação atual.

## Critérios de aceite

- CA-01: a carga cria exatamente os 12 patrimônios, com as categorias e situações da lista, sem criar empréstimos.
- CA-02: repetir a carga não duplica equipamentos, objetos do Storage nem vínculo do professor. A operação preserva o estado de equipamento já em uso.
- CA-03: as 12 fotos são distintas e medem 800 × 600. O manifesto identifica foto, origem, fotógrafo, licença e hash, com revisão visual registrada.
- CA-04: as 12 URLs de foto no bucket público abrem sem login e a interface mostra o crédito do Pixabay com link.
- CA-05: o UID confirmado do professor tem um vínculo de colaborador em `suporte_ti`, pode usar o login publicado e tem zero empréstimos. A conta de teste é separada.
