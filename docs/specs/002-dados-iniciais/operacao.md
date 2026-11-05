# Operação da carga inicial

1. O responsável executa o job de migration do Prisma pelo GitHub Actions. O disparo usa a branch `pratica/sdd-subagentes` e um commit deliberado com `[migrate-db]`, após revisão da migration. Aguarde o job antes de promover uma versão que usa `photo_path`.
2. O responsável cria o bucket público `equipamentos` com leitura pública e escrita restrita ao operador. Após revisar as fotos finais, registre `status: "aprovado"` e `reviewedBy` no manifesto local. Mantenha o registro das fotos descartadas.
3. Envie os 12 arquivos para os caminhos exatos do manifesto. Se um caminho existir, compare o hash antes de reaproveitá-lo. Abra cada URL pública sem login e confirme que ela corresponde ao arquivo aprovado.
4. O responsável provisiona e confirma a conta do professor no Supabase Auth com a senha padrão informada na atividade. A senha fica no serviço de autenticação.
5. Gere o SQL de dados pelo comando abaixo. Revise o arquivo e execute no SQL Editor do projeto de produção. O SQL usa o tenant `suporte_ti`, exige a conta confirmada do professor e aborta diante de colisões ou empréstimos preexistentes. O comando local apenas gera o arquivo.

```powershell
node scripts/prepare-practice-data.mjs .equipamentos-fotos/manifesto.json |
  Set-Content -Encoding utf8NoBOM .equipamentos-fotos/carga.sql
```

6. Execute a carga novamente e confirme 12 patrimônios da lista, três em manutenção, URLs válidas e um vínculo de colaborador para o professor, com zero empréstimos. A demonstração de solicitações usa outra conta. Registre o resultado sem publicar identificadores de login ou segredos.
