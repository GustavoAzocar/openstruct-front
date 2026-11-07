# Apresentação pública do ConsoloStruct — OSF-02

Revisão de 07/11/2026. A apresentação descreve o **aplicativo 0.6.0**,
tag `v0.6.0`, commit `1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c`.
O motor documentado nessa entrega é **0.3.0**, política **LC-ELU-2026.1**.
A branch mais recente do aplicativo não foi usada como prova de funcionalidades
disponíveis no instalador.

## Distribuição e precedência das fontes

O [catálogo público](https://github.com/ricardocorsini/openstruct-catalog/blob/bbddcf9a37a1f63658a34dae24dd5afb1d56cf31/catalog.signed.json)
e a [release 0.6.0](https://github.com/ricardocorsini/consolo-struct/releases/tag/v0.6.0)
confirmam pacotes Windows/Linux x86_64. O README da tag ainda contém instruções de
compilação e ressalvas de validação dos sistemas; isso não elimina os pacotes que
foram efetivamente publicados, nem permite alegar validação executiva integral.

O registro editorial `src/lib/apps.ts` conserva essa evidência. A descrição curta
do catálogo agora identifica cálculo, memória de ELU e detalhamento. O campo
`engine` guarda a versão do motor e sua fonte técnica; o validador exige que ela
pertença à ref da distribuição.

## Mapa das afirmações

Todos os documentos abaixo são da mesma revisão imutável da tag publicada:

| Conteúdo apresentado                                                                                           | Evidência e seção                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Geometria, materiais, ações, combinações e edição/navegação 2D/3D                                              | [Guia de uso](https://github.com/ricardocorsini/consolo-struct/blob/1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c/docs/GUIA-DE-USO.md), §§2 e 4                                     |
| ELU estático local, consolos simples curtos/muito curtos, bielas e tirantes/atrito-cisalhamento                | [Critérios](https://github.com/ricardocorsini/consolo-struct/blob/1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c/docs/CRITERIOS-DE-CALCULO.md), Alcance e Modelos resistentes        |
| Motor 0.3.0, política e estados de resultado                                                                   | Mesmo documento, título e Alcance; Guia, §3                                                                                                                                    |
| Sugestão de armaduras e revisão de pendências                                                                  | Guia, §3                                                                                                                                                                       |
| Tirante duplo como duas camadas na mesma face                                                                  | [Detalhamento](https://github.com/ricardocorsini/consolo-struct/blob/1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c/docs/DETALHAMENTO.md), Tirante simples e duplo; Guia, §5         |
| Elevação, planta, cortes, dobramentos, quantidade por tipo e quadro de aço                                     | Detalhamento, introdução, Usar e Quadro de aço                                                                                                                                 |
| Memória rastreável por combinação e registro .calc.json                                                        | Guia, §§3 e 5; Critérios, Arquivos e auditoria                                                                                                                                 |
| Projeto .consolo.json e leitura .lume.json                                                                     | Guia, §1                                                                                                                                                                       |
| DXF de detalhamento em cm, SVG, PDF vetorial e CSV do quadro                                                   | [README](https://github.com/ricardocorsini/consolo-struct/blob/1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c/README.md), Recursos; Guia, §5; Detalhamento, Unidades e representação |
| Limites: a/d > 1, dentes Gerber, consolos duplos/contínuos, ELS, fadiga, estrutura global e ligações completas | Guia, Limites essenciais; Critérios, Domínio interrompido e verificações externas                                                                                              |
| Atender/exportar não equivale a aprovação executiva                                                            | Critérios, Alcance; Detalhamento, Situação de emissão e limites                                                                                                                |
| Casos de validação e extensão da conferência                                                                   | [Validação do motor](https://github.com/ricardocorsini/consolo-struct/blob/1ca7d3f057ac43de432d07ca474eb1f95bbb4e6c/docs/VALIDACAO-MOTOR.md)                                   |
| Processamento local e projetos no computador                                                                   | README, apresentação                                                                                                                                                           |

Há comandos de exportação diferentes: o antigo **Geometria DXF** entrega contornos
em mm; o módulo **Detalhamento** entrega desenhos em cm e seu quadro de aço.
O documento de critérios do motor descreve as saídas do cálculo; a descrição das
saídas do módulo de detalhamento foi reconciliada com o Guia §5 e o documento
específico de detalhamento presentes na tag. Não se atribui o gerador de desenhos
à prévia SVG do site, nem se confunde .calc.json com projeto editável.

## Alcance da alteração no frontend

- Página de produto: resumo, recursos com links de fonte, fluxo, escopo, arquivos,
  instalação pelo Launcher, documentação e FAQ.
- Home: destaque da versão disponível; ilustração identificada como SVG sem cálculo.
- Docs: introdução ao aplicativo e link externo para o guia fixado na versão.
- Launcher: orientação de instalação e link para o guia; disponibilidade da OSF-01
  foi reutilizada.
- A prévia continua interativa e esquemática. Não é captura da interface desktop,
  não executa o motor e não gera desenhos para obra.

Nenhum motor de engenharia ou instalador foi alterado nesta tarefa. Novas capturas
reais e a substituição da ilustração principal permanecem trabalhos próprios.
