# Vitrine de primeiras contribuições — OSF-22

Revisão em 07/11/2026, base `237472ac58239e2be539c0621aab1ed83e9df6ba`.
A OSF-19 fornece issues abertas com labels originais e datas por fonte. Esta
entrega usa esse contrato sem alterar o coletor, criar tickets ou acrescentar
requisições à API do GitHub por visitante.

## Seleção

`src/lib/contributions.ts` configura os critérios **por repositório**. As regras
iniciais são os nomes exatos `good first issue` e `help wanted`. São critérios de
elegibilidade, não uma afirmação de que essas labels existam em cada repositório.
O card só é criado quando a própria issue coletada contém uma delas. Equivalentes
exigem configuração explícita, sem inferir tradução, dificuldade ou prioridade.

Somente issues abertas, em fonte pública e com lista `fresh` consultada há no
máximo duas horas podem entrar. Fallback/cache, fontes antigas ou indisponíveis,
labels ausentes/não confirmadas, PRs, duplicatas e URLs estrangeiras não produzem
oportunidades. O corte usa a data de coleta, não a última atualização da issue:
uma issue antiga ainda aberta pode ser válida quando a consulta é recente.

A vitrine mostra no máximo seis cards, em ordem de atualização com desempate
estável. Cada card leva diretamente ao contexto original e às orientações do
próprio repositório. A issue e o guia ficam a um clique cada. Não há pontuação
por título, tamanho, comentários ou referência a IA. `help wanted` não significa
automaticamente tarefa fácil; o visitante deve combinar o escopo na issue.

As listas têm o limite já existente de 60 entradas recentes por repositório,
removendo PRs. Contagens referem-se ao recorte carregado, nunca a todas as
oportunidades do GitHub. Estado, data e truncamento são informados por fonte.
Uma issue pode mudar depois da coleta; a interface pede confirmação no original.

## Caminhos alternativos e fontes

Quando nenhuma oportunidade é encontrada, a página oferece revisão de documentação,
reprodução de exemplos públicos onde existem e revisão visual pelos canais do
repositório. Essas sugestões não são apresentadas como tickets abertos.

| Repositório | Orientações verificadas | Ref da revisão |
| --- | --- | --- |
| openstruct-front | README, desenvolvimento e validação | `237472ac58239e2be539c0621aab1ed83e9df6ba` |
| consolo-struct | CONTRIBUTING.md; docs/INSTALACAO.md e examples/ | `54abc400ae43a5a3bdf025df85c327dde1ad5086` |
| mola-struct | CONTRIBUTING.md e examples/README.md | `aeda58309ddadcd53cac16aa1625473391d8efad` |
| armadura-struct | README#contribuir, docs/GUIA.md e docs/examples/initial/README.md | `86db6dd9c286e28a44a70afa10efede70f7127b3` |
| openstruct-catalog | README de distribuição e manutenção | `a527a902cb35299c334e01564e83e798cd64c048` |

Não foram encontrados guias CONTRIBUTING dedicados no frontend, ArmaduraStruct
ou hub durante a revisão; os links são identificados honestamente como README.
As URLs seguem a branch pública atual (`master`, ou `main` no hub); refs e data
ficam registradas para rastrear a revisão. Os exemplos se referem ao código e à
documentação do repositório, sem promover recursos para instaladores antigos.
O Launcher privado não é uma fonte.

Na coleta pública examinada, os cinco repositórios não tinham issues abertas.
Assim, não foram fabricados cards nem criadas labels para demonstrar a interface.
Também não se deduz ausência de labels no repositório a partir de uma lista vazia.

## Manutenção e verificação

- Antes de adicionar uma label equivalente, confirme seu nome e significado na
  fonte e configure somente o repositório correspondente.
- Ao mudar guias ou exemplos, confirme o arquivo público, atualize ref/data e
  preserve links diretos para o próprio projeto. README não vira guia dedicado.
- O loader público existente compartilha a consulta e mantém o intervalo mínimo
  de cinco minutos; a vitrine não cria uma segunda coleta REST.
- Testes cobrem seleção, labels originais/equivalentes por repo, exclusão de
  fechadas/PRs, fontes antigas/privadas, limites, ordenação e destinos corretos.
- A conferência visual cobre o estado real sem resultados, alternativas, links,
  desktop e largura móvel simulada nos dois temas. Issues elegíveis só existem
  em fixtures de teste nesta entrega; não houve teste em aparelho físico.
