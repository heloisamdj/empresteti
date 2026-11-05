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

## Conferência do Storage publicado

Em 05/11/2026, após o envio da responsável, as 12 URLs abaixo responderam HTTP
200 com `image/webp` sem sessão. O SHA-256 de cada resposta coincidiu com o do
arquivo aprovado, registrado no nome do objeto. As imagens têm 800 × 600 e
seguem a [licença do Pixabay](https://pixabay.com/service/license-summary/).

| Patrimônio | Fonte | Autor | Arquivo publicado |
| --- | --- | --- | --- |
| TI-0001 | [3036166](https://pixabay.com/photos/computer-laptop-blank-empty-screen-3036166/) | kirill_makes_pics | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0001/57bb1fd8b2b427c0e7acdea95cd977b7b5e80f6a8cdbe5064a3e3cd3603f7398.webp) |
| TI-0002 | [791032](https://pixabay.com/photos/technology-laptop-computer-netbook-791032/) | kaboompics | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0002/516808e2a8b8edc5b4207d789d9f5b69d7a31e7e258a748eaa3ac27a645e15db.webp) |
| TI-0003 | [6801339](https://pixabay.com/photos/electronics-technology-devices-6801339/) | Mariakray | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0003/b0633b3292ba3178f119044af27affb490227df028587821f6c2ebed267a5f62.webp) |
| TI-0004 | [5641391](https://pixabay.com/photos/laptop-computer-office-business-5641391/) | RobVanDerMeijden | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0004/8e4b27b83c6a0031b09b88ef2725d8c45b9adc57438ea23d9fa83093c8b699a7.webp) |
| TI-0005 | [17768](https://pixabay.com/photos/blank-business-computer-desktop-17768/) | PublicDomainPictures | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0005/fcd4094cbdcacf0df2cc4f8dc61309299557f8843517803fe87e10ab4159c129.webp) |
| TI-0006 | [17894](https://pixabay.com/photos/blank-business-computer-desktop-17894/) | PublicDomainPictures | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0006/20f2e52fa47497f046119c81d76e21b9917dd2834d49df1fc724c940ebd9f28f.webp) |
| TI-0007 | [1990907](https://pixabay.com/de/photos/rechner-pc-klaviatur-technologie-1990907/) | coyot | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0007/520f79aaafe9089bfc6f2060d57a9c791cbd031e6820e04896d6c10edb32abda.webp) |
| TI-0008 | [643728](https://pixabay.com/photos/hdmi-cable-connection-643728/) | PIX1861 | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0008/d7d2af67f265e91b26f651f44409dc831d723dd635e06541b1137b7ded058981.webp) |
| TI-0009 | [4498745](https://pixabay.com/photos/cable-wire-technology-plug-4498745/) | tomekwalecki | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0009/1892d2b13ecf1d59e70fba388c0a62457d1651e1614ffad4c7b794a593638086.webp) |
| TI-0010 | [494647](https://pixabay.com/photos/network-cable-cable-patch-494647/) | blickpixel | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0010/bdc082855c8c9b82a0f754a3191d647d083604fea07e2020c7ae225e8ff0ee15.webp) |
| TI-0011 | [1163880](https://pixabay.com/photos/video-conference-hd-material-1163880/) | willsong | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0011/0f6089880b082e9ea48812a76c7c41f61024b8bbc31744ee873ae6472f388168.webp) |
| TI-0012 | [4938732](https://pixabay.com/photos/gopro-camera-gopro-session-video-4938732/) | Trevor205 | [WebP público](https://pkncugbogwvxyulbngjr.supabase.co/storage/v1/object/public/equipamentos/TI-0012/4e7fd2b5eeafc5a739fa875294ad83aa5a35097323f048f96d0d603c22bc684f.webp) |
