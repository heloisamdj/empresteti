# Revisão das fotos do Pixabay

A triagem inicial conferiu as prévias da API do Pixabay e os recortes em 800 × 600. Nove arquivos passaram nessa rodada.

| Patrimônio | ID | Resultado |
| --- | ---: | --- |
| TI-0001 | 3036166 | Seleção local |
| TI-0002 | 791032 | Seleção local |
| TI-0003 | 6801339 | Seleção local |
| TI-0004 | 5641391 | Seleção local |
| TI-0005 | 17768 | Seleção local |
| TI-0006 | 17894 | Seleção local |
| TI-0007 | 1140699 | Reprovado. Logotipo no monitor e no mouse. |
| TI-0008 | 643728 | Seleção local |
| TI-0009 | 4498745 | Seleção local |
| TI-0010 | 494647 | Seleção local |
| TI-0011 | 796227 | Reprovado. Texto legível no anel da lente. |
| TI-0012 | 4357489 | Reprovado. Marca e texto no recorte da câmera. |

Sete candidatos foram reprovados depois de abrir os arquivos finais em 800 × 600. Além dos três da tabela, foram recusados os IDs 2982270 (marca Nikon em objeto ao lado), 593327 (texto na caneta), 5050543 (marca ECCO) e 1219748 (texto na lente). A triagem por prévia também descartou candidatos com pessoas, telas com conteúdo, conector incorreto e equipamento diferente, sem contagem consolidada.

## Substituições do passo 2

| Patrimônio | Foto selecionada | Autor | Enquadramento |
| --- | --- | --- | --- |
| TI-0007 | [1990907](https://pixabay.com/de/photos/rechner-pc-klaviatur-technologie-1990907/) | coyot | Detalhe do monitor e da base, com tela sem conteúdo. O recorte exclui o teclado. |
| TI-0011 | [1163880](https://pixabay.com/photos/video-conference-hd-material-1163880/) | willsong | Câmera de videoconferência vista de frente, com o equipamento inteiro no quadro. |
| TI-0012 | [4938732](https://pixabay.com/photos/gopro-camera-gopro-session-video-4938732/) | Trevor205 | Câmera de ação compacta sobre a mesa. O recorte isola o aparelho da esquerda e exclui a marca que aparece no outro aparelho. |

A segunda triagem também descartou a webcam 5095868 pela inscrição “720p”.
Foram descartadas as opções de monitor 1834327 e 2831949 por marca visível e,
no primeiro caso, texto no fundo. Entre as compactas, as fotos 1989582,
5416890, 5416893, 1502599, 7478104, 600645, 1589688, 3247925, 3247923 e
3866776 tinham marca ou texto visível. A 6960165 ainda mostrava inscrições no
recorte final. A 6960166 mostrava a mão de uma pessoa.

O comando `preparar` gerou os 12 WebP. A verificação decodificou todos em
800 × 600, conferiu os créditos, os IDs e os hashes e confirmou que as nove
fotos da primeira seleção conservaram seus hashes. A pasta local
`.equipamentos-fotos/lote-passo-2` contém somente os 12 arquivos selecionados.
A responsável aprovou a prancha `.equipamentos-fotos/prancha-passo-2.png`
em 05/11/2026. A aprovação foi registrada no manifesto local
`.equipamentos-fotos/manifesto.json`. Os 12 arquivos da pasta de upload
foram conferidos de novo pelos hashes antes da geração da carga.
