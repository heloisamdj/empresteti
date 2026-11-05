---
name: imagens-equipamentos
description: Prepare e confira fotos de equipamentos do EmpresTI obtidas pela API do Pixabay para o catálogo. Use para buscar, selecionar, padronizar e registrar créditos das fotos. Exclui landing, logos, ilustrações e upload em produção.
---

Prepare a saída local descrita em [fluxo e créditos](references/fluxo.md). Use a lista da prática em [equipamentos.json](assets/equipamentos.json).

1. Rode o modo `buscar` com a chave Pixabay no ambiente local. Entregue as páginas dos candidatos ao responsável.
2. Revise visualmente e registre o motivo de cada reprovação. Rejeite pessoas, marcas, logos legíveis, texto e telas com conteúdo. Verifique se a imagem representa o equipamento.
3. Rode `preparar` com o ID escolhido por patrimônio. Revise de novo os arquivos finais de 800 × 600, pois o recorte pode afetar a identificação do equipamento.
4. Entregue os arquivos e o manifesto de origem ao responsável pela publicação. Na tela que exibe as imagens, exija o link **Fotos: Pixabay**.

O script só aceita origem Pixabay e grava na pasta local de saída. Ele não possui comando de upload, acesso ao Supabase ou credenciais de produção. A aprovação visual precisa ser registrada pela pessoa responsável.
