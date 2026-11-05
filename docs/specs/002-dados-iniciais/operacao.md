# Operação da carga inicial

Antes de abrir o PR de `pratica/sdd-subagentes` para `main`, combine com o
responsável o fluxo abaixo. O PR pode ficar em rascunho enquanto os pareceres
aguardam a prova de produção. Use a proteção de `main` para exigir PR e os
checks `validate` e `Parecer obrigatório da prática` do GitHub Actions, assim que
os checks estiverem disponíveis para seleção. Confira o bloqueio no próprio PR
antes de integrar. Preserve as proteções já existentes.

Na configuração atual do repositório privado, a API do GitHub informa que a
`main` está desprotegida e que o plano não permite ativar proteção de branch.
Enquanto essa limitação existir, mantenha o PR em rascunho até os dois checks
passarem no commit a integrar. O responsável confere os checks antes do merge.
O CI aponta reprovação, mas o GitHub não impede o merge automaticamente.

1. O responsável executa o job de migration do Prisma pelo GitHub Actions. O disparo usa a branch `pratica/sdd-subagentes` e um commit deliberado com `[migrate-db]`, após revisão da migration. Aguarde o job antes de promover uma versão que usa `photo_path`.
   Com o commit local de disparo já preparado, o responsável confere se o
   último commit da branch contém `[migrate-db]` e publica a branch da prática:

   ```powershell
   git log -1 --oneline
   git push -u origin pratica/sdd-subagentes
   ```

2. O responsável cria o bucket público `equipamentos` com leitura pública e escrita restrita ao operador. A aprovação de 05/11/2026 já está registrada em `.equipamentos-fotos/manifesto.json`.
3. Envie os 12 arquivos de `.equipamentos-fotos/lote-passo-2` para os caminhos exatos do manifesto. Preserve as pastas TI-0001 a TI-0012 no bucket. Se um caminho existir, compare o hash antes de reaproveitá-lo. Abra cada URL pública sem login e confirme que ela corresponde ao arquivo aprovado.
4. O responsável provisiona e confirma a conta do professor no Supabase Auth com a senha padrão informada na atividade. A senha fica no serviço de autenticação.
5. Revise o arquivo local `.equipamentos-fotos/carga.sql` e execute no SQL Editor do projeto de produção após a migration, o upload e a confirmação da conta do professor. O SQL usa o tenant `suporte_ti`, exige a conta confirmada e aborta diante de colisões ou empréstimos preexistentes do professor. Use o comando abaixo se precisar regenerar o arquivo.

```powershell
node scripts/prepare-practice-data.mjs .equipamentos-fotos/manifesto.json |
  Set-Content -Encoding utf8NoBOM .equipamentos-fotos/carga.sql
```

6. Rode `.equipamentos-fotos/conferir-carga.sql`, que consulta os dados sem gravar. Repita a carga e a conferência. As duas consultas devem retornar 12 equipamentos conformes, 12 fotos nos caminhos esperados, 12 objetos no bucket público, um vínculo de colaborador para o professor e zero empréstimos para ele. A conferência dos caminhos inclui as três situações de manutenção. A demonstração de solicitações usa outra conta. Registre o resultado sem publicar identificadores de login ou segredos.

Em 05/11/2026, a carga com o manifesto aprovado foi executada duas vezes
em PostgreSQL descartável. As duas conferências deram o mesmo resultado
esperado. O Auth e o Storage foram simulados nesse teste. A execução e a
conferência no Supabase de produção ficam com a responsável.

## Validação publicada e fechamento do PR

1. Com a migration e a carga verificadas, o responsável usa uma cópia limpa do
   commit candidato e cria uma implantação no projeto Vercel correto com
   `vercel deploy --prod --skip-domain`. Registre o SHA e o ID da implantação.
   Confira na candidata a conexão, os 12 cards com foto e crédito e o acesso da
   conta do professor. Em seguida, o responsável promove a candidata com
   `vercel promote <id-da-implantação>`. Isso permite colher evidência no
   domínio público antes de integrar o PR.
2. Confirme primeiro os dados no domínio público. Depois, com conta separada,
   valide o empréstimo imediato, o filtro de disponibilidade, o prazo em
   Meus empréstimos e a recusa do sexto pedido. Confirme novamente zero
   empréstimos na conta do professor.
3. Registre evidências sem credenciais nas pastas das specs. Com o código e
   essas evidências versionados, rode o verificador de cada spec com o mesmo
   SHA, a base da prática e os resultados dos checks locais. Registre os dois
   pareceres em `verificacao.md`. Mudança de código após o parecer exige
   nova revisão e nova conferência da versão publicada.
4. Depois que os dois pareceres estiverem prontos e o CI passar, integre com
   merge commit para preservar o histórico da prova e os SHAs revisados.
   Confira a versão servida pela Vercel após a integração. Rode
   `node scripts/check-spec-review.mjs delivery` com a árvore limpa no commit
   final antes de criar e enviar a tag `entrega-pratica`.
