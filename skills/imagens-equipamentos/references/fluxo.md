# Preparação e créditos

Na raiz do repositório, coloque a chave em `.env.pixabay.local` com o nome `PIXABAY_API_KEY`. Use a [documentação da API](https://pixabay.com/api/docs/) para conferir a busca e a [licença Pixabay](https://pixabay.com/service/license-summary/) para registrar o uso.

```powershell
node --env-file=.env.pixabay.local skills/imagens-equipamentos/scripts/fotos.mjs buscar
node skills/imagens-equipamentos/scripts/fotos.mjs preparar
```

O primeiro comando salva candidatos em `.equipamentos-fotos/candidatos-pixabay.json` e reaproveita cada busca por 24 horas. Abra as páginas dos candidatos e registre os IDs aprovados em `.equipamentos-fotos/selecao-pixabay.json`. O arquivo é um objeto em que cada chave é um patrimônio e cada valor é o ID numérico da foto escolhida. Registre os candidatos reprovados e o motivo em uma nota de revisão para o ENTREGA.md. O catálogo serve os arquivos do Storage, conforme a regra de uso dos links da API.

O segundo comando usa o Chromium do Playwright para fazer o recorte sem distorção, codificar WebP e decodificar o arquivo final para verificar as dimensões. A seleção também pode indicar `{"id": 123, "crop": [0.1, 0.1, 0.8, 0.8]}`, com esquerda, topo, largura e altura entre zero e um, para enquadrar o equipamento. O manifesto guarda o recorte, patrimônio, caminho de Storage, autor, página original, licença e hash. A preparação falha se a origem, as dimensões ou a unicidade por ID e conteúdo não forem válidas. Compare o recorte final à fonte antes de aprovar.

O responsável envia os arquivos ao bucket público `equipamentos` após a aprovação visual. Os caminhos têm o formato `<patrimonio>/<hash>.webp`. Na repetição, pule um objeto existente com o mesmo hash. Se houver conteúdo diferente no mesmo caminho, pare e confira o manifesto. A equipe registra a URL pública e verifica que abre sem sessão. O crédito **Fotos: Pixabay** aponta para https://pixabay.com/ e o manifesto guarda os créditos individuais.
