# Galeria de capturas — OSF-10

Revisão: 07/11/2026. Base: 209cbb955c59f1b847148d7ff76fdb298bb36b63.

`CaptureGallery` recebe capturas com id, src, alt, dimensões, título, legenda,
versão e origem. ConsoloCaptures adapta o manifesto da OSF-08; Armadura adapta
product-media.ts. As figuras, legendas e fontes permanecem no documento, além
das miniaturas. Não há reprodução automática ou rolagem comandada pelo componente.

A ampliação usa dialog.showModal(), foco inicial no botão Fechar, Escape nativo
e onClose para devolver foco ao botão acionador sem rolar a página. Anterior,
Próxima e setas do teclado navegam sem circular. O original continua acessível
em nova aba. Imagem indisponível produz mensagem de fallback, mantendo legenda,
versão e fonte. Imagens têm width/height, proporções originais e loading lazy.

Armadura: preservada a captura 1600×1000 da v0.2.0, conforme evidência da OSF-04 e
origem fixa c25baa3b6b914670eccc58e40c87e06732d9019b/docs/preview.png. Não se
promovem recursos da master. Consolo: quatro capturas reais 0.7.1 da OSF-08.

Mola: OSF-09 ainda não está implementada e não existem capturas revisadas nessa
página. A integração exibe estado vazio honesto; fornecer os futuros registros
no mesmo contrato ativa a galeria sem mudar o componente. A prévia SVG existente
não foi convertida em uma falsa captura.

Validação: npm test (42 testes, incluindo limites de navegação), npm run build, conferência de abertura,
navegação, Escape e retorno de foco no Chromium. Os instaladores dos aplicativos
não foram executados nesta tarefa. Consulte os manifestos de mídia para as
versões capturadas e licenças de cada produto.

Desktop e largura móvel simulada de 337 px, temas claro/escuro conferidos sem
rolagem horizontal no diálogo. Ampliação e retorno de foco verificados nos dois
produtos com capturas. Mola permanece aguardando OSF-09.
