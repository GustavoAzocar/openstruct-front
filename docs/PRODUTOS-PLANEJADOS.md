# AnchorStruct e SlopeStruct — propostas futuras

A [issue #15](https://github.com/ricardocorsini/openstruct-front/issues/15) registra
duas direções para o ecossistema. Os nomes sugeridos foram mantidos para esta
apresentação inicial.

| Proposta | Área | Estado |
| --- | --- | --- |
| AnchorStruct | Cálculo de chumbadores | A iniciar — desenvolvimento não iniciado |
| SlopeStruct | Estabilidade de taludes e contenções | A iniciar — desenvolvimento não iniciado |

O mantenedor complementou o escopo durante a implementação: criar desde já uma
página própria para cada proposta, com informações breves e uma arte “Em breve”,
enquanto os ícones e ilustrações definitivos são preparados. Essa orientação
substitui a restrição original da issue que excluía páginas e rotas.

## Apresentação

- `/apps/anchorstruct` e `/apps/slopestruct` são páginas informativas do site.
- O conteúdo se limita à área proposta e ao estado do desenvolvimento.
- Não há data de início ou lançamento, método, norma ou recurso técnico definido.
- Não há repositório, versão, plataforma, instalador ou download dos futuros apps.
- Ambos permanecem `stage: 'planned'`, com `planningStatus: 'not-started'`.
- No catálogo, aparecem somente ao incluir o horizonte futuro ou selecionar
  disponibilidade “Em planejamento”. Os demais filtros mantêm seus contratos.
- Os quatro produtos atuais são preservados. O horizonte futuro contém somente
  AnchorStruct e SlopeStruct. VigasStruct, PilarStruct, SapataStruct e 3DStruct
  foram retirados do registro por solicitação do mantenedor após a entrega inicial.

## Artes e manutenção

`public/assets/app-em-breve.svg` é uma composição tipográfica local compartilhada
pelos dois cards e páginas. Não representa um ícone definitivo nem uma interface
do software. A arte tem cores neutras; textos, estado e links dos cards mantêm o
contraste normal dos temas claro e escuro.

Para substituir as artes, adicione os arquivos em `public/assets/` e atualize
`page.image` e `page.imageAlt` de cada proposta em `src/lib/apps.ts`. As páginas e
cards usam o mesmo registro. Não promova o produto para `current` apenas por haver
uma página ou uma ilustração; a publicação de um software exige as evidências e
metadados definidos no [registro editorial](CATALOGO-EDITORIAL.md).

## Validação

Execute `npm test`, `npm run build` e `npm run audit:content`. Confira o catálogo
com/sem horizonte, busca e filtros por categoria, disponibilidade e plataforma;
abra as duas páginas pelos cards e por acesso direto, em desktop/mobile e nos dois
temas. Estado e páginas informativas não podem oferecer instalação.

Conferência da implementação: 233 testes aprovados, build TypeScript/Vite aprovado,
Prettier e `git diff --check` sem pendências. A auditoria renderizou as rotas e
encontrou zero erros locais; os dois avisos de revisão referem-se às versões
documentadas do ConsoloStruct e ArmaduraStruct, fora desta entrega.

O build de produção foi navegado no Chromium em 320, 390, 768 e 1440 px nos dois
temas (24 combinações de rota/tema/largura), sem erros de execução ou rolagem
horizontal. Foram conferidos os links dos cards, títulos, acesso direto, busca,
filtro de planejamento, plataforma e limpeza. Para reproduzir a disponibilidade
dos produtos atuais, a consulta remota usou o catálogo assinado incluído no site.
Não houve validação em produção nem em aparelho físico.
