# Preparação e créditos

Na raiz do repositório, coloque a chave em `.env.pexels.local` com o nome `PEXELS_API_KEY`. Use a [documentação da API](https://www.pexels.com/api/documentation/) para conferir a busca e a [licença Pexels](https://www.pexels.com/license/) para registrar o uso.

```powershell
node --env-file=.env.pexels.local skills/imagens-equipamentos/scripts/fotos.mjs buscar
node skills/imagens-equipamentos/scripts/fotos.mjs preparar
```

O primeiro comando salva candidatos em `.equipamentos-fotos/candidatos.json`. Abra as páginas dos candidatos e registre os IDs aprovados em `.equipamentos-fotos/selecao.json`. O arquivo é um objeto em que cada chave é um patrimônio e cada valor é o ID numérico da foto escolhida. Registre os candidatos reprovados e o motivo em uma nota de revisão para o ENTREGA.md.

O segundo comando usa o Chromium do Playwright para fazer o recorte central sem distorção, codificar WebP e decodificar o arquivo final para verificar as dimensões. A preparação falha se a origem, as dimensões ou a unicidade por ID e conteúdo não forem válidas. O manifesto contém patrimônio, caminho de Storage, autor, página original, licença e hash. Compare o recorte final à fonte antes de aprovar.

O responsável envia os arquivos ao bucket público `equipamentos` após a aprovação visual. Os caminhos têm o formato `<patrimonio>/<hash>.webp`. Na repetição, pule um objeto existente com o mesmo hash. Se houver conteúdo diferente no mesmo caminho, pare e confira o manifesto. A equipe registra a URL pública e verifica que abre sem sessão. O crédito **Fotos: Pexels** aponta para https://www.pexels.com/ e o manifesto guarda os créditos individuais.
