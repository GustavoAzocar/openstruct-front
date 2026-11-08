# Manual público de colaboração — OSF-51

Revisão em 07/11/2026, frontend base `83ad34fb4681c0817efc3d6a84f81bf0ad0150d5`.
Rota estável: `/community/como-colaborar`. O conteúdo está em
`src/pages/ContributionManual.tsx`; metadados, caminhos, comandos e seleção de
repositório estão em `src/lib/contribution-manual.ts`. Este documento registra
manutenção e verificação; não duplica o tutorial.

## Dependências examinadas

- OSF-22 existe: a vitrine permanece intacta e aponta ao percurso, inclusive com
  seleção do repositório. Os guias são reaproveitados de `contributions.ts` e os
  nomes/associações vêm de `developmentSources`.
- OSF-27 ainda não existe na base: não há CONTRIBUTING nem templates do frontend.
  O manual referencia o README, identifica a lacuna com data e não cria políticas
  ou modelos. Não deve ser confundido com conclusão da OSF-27.
- OSF-26 está pendente: não existe rascunho/formulário local. O manual usa links
  públicos de relatos, com aviso e destino antes do encaminhamento.
- OSF-29 está pendente: ainda não há motor de artigos navegáveis. A página própria
  usa React/CSS existentes e carregamento separado, sem implantar CMS ou Markdown.

## Fontes e canais conferidos

Metadados dos cinco repositórios confirmam `private=false`, `visibility=public`,
branch e issues habilitadas. Árvores públicas foram examinadas sem truncamento.
Refs e data ficam no registro `manualReview.sources`.

- Frontend: README recomenda Node.js 24 LTS/npm e branch master; package.json e
  package-lock.json conferidos. Scripts npm ci, dev, test e build executados.
  Nesta sessão gerenciada, `npm run dev` padrão encontrou restrição de enumeração
  de interfaces (`uv_interface_addresses`); o mesmo script com `-- --host 127.0.0.1`
  iniciou o Vite normalmente em 5173. Não foi alterado o script do projeto.
- ConsoloStruct: CONTRIBUTING, templates de bug, divergência e proposta existentes;
  chooser público, comandos e requisitos ficam no guia próprio.
- MolaStruct: CONTRIBUTING e issue forms existentes; chooser público e guia próprio.
- ArmaduraStruct: README#contribuir; sem CONTRIBUTING ou templates na árvore revisada.
- Hub: README de distribuição, releases e issues públicas habilitadas; sem template.
  Nenhum código privado do Launcher é consultado ou ligado como guia público.

O seletor aceita apenas slugs da allowlist existente. Slug desconhecido/privado não
ganha destino padrão. Issue chooser é usado apenas em Consolo/Mola, onde há templates;
os demais levam ao novo relato em branco. Não se presumem labels, convites ou prazo.
Relatos são pesquisados também entre fechados; a central é identificada como recorte.

## Conteúdo e comportamento

Há seis caminhos com pré-requisitos, próximo passo, exemplo e resultado esperado,
dois percursos completos numerados, glossário, exemplo fictício de relato, checklist,
FAQ e fontes. O fluxo de código é exclusivamente do frontend e usa fork do visitante,
origin para seu fork, upstream para o projeto original e PR para master. Comandos
de commit/push aparecem como instruções; não são executados contra contas de teste.

O aviso de publicidade antecede links de envio e é repetido perto das ações.
Exemplos não descrevem defeitos confirmados. Não há upload, criação de conta, envio
automático, promessa de aceite ou aprovação de engenharia. Os conteúdos são locais
e seguros, sem HTML remoto. O seletor conserva `repo` na URL e restaura voltar/avançar.
Sumário/âncoras e blocos de terminal podem ser usados com teclado.

## Atualização e validação

Ao concluir OSF-27/26/29, conferir suas implementações e integrar os pontos úteis;
substituir o aviso datado de ausência, sem duplicar guias. Ao mudar ambiente, scripts,
branch ou links oficiais, revisar os comandos, canais, refs e data juntos. README
e documentação resumida apontam ao manual como percurso completo.

Testes protegem seleção por repo, rejeição de destino inválido/privado, chooser versus
relato em branco, base do PR e scripts reais. Verificação renderizada/visual cobre
sumário, links, rota direta, seleção, ambos os percursos, teclado, desktop e largura
móvel simulada nos temas claro e escuro. Não se abre fork, issue ou PR de teste, nem
se promete compatibilidade nativa dos outros aplicativos por executar o frontend.
