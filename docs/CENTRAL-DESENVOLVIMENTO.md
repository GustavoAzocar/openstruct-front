# Central de desenvolvimento (OSF-18)

Base revisada em 07/11/2026: openstruct-front `84beddec51d890b6ccd009d6ea20d5f1a17ffeca`.
A OSF-17 está implementada e sua branch pública já serve dados reais. A lacuna para a central era a apresentação por projeto e a evidência de releases estáveis.

## Rotas e navegação

- `/development`: visão geral dos cinco repositórios autorizados, sem ranking por estrelas.
- `?repo=consolo-struct` (ou outro slug da allowlist): visão do repositório. Valores desconhecidos retornam à visão geral; voltar/avançar restaura a seleção.
- `#repositories` e `#releases`: cartões por produto/infraestrutura e suas publicações.
- `#issues` e `#pull-requests`: prévias de atividade aberta, até 12 itens por seção, ordenadas por atualização. Os cartões levam a essas seções já com o repositório selecionado.
- Menu, rodapé e Comunidade dão acesso à central. Ideias e problemas agora passam pela escolha do repositório, sem aplicar labels supostamente existentes.

OSF-19 e OSF-20 ainda estão abertas. Esta entrega oferece os pontos de acesso e a prévia real das listas, sem fingir filtros de labels, histórico fechado, comentários, reviews ou checks. Os links externos levam às listagens oficiais completas; as próximas tarefas podem evoluir as mesmas seções sem bloquear esta central.

## Contagens e cobertura

As contagens são **itens únicos no recorte coletado**, nunca `open_issues_count`, que inclui PRs. A prévia e o número-resumo usam o mesmo conjunto normalizado, antes do limite visual de 12 itens. Fontes distintas podem ter o mesmo número de issue; sua identidade inclui o repositório e a URL. Duplicatas de URL são eliminadas. Um número identificado como PR naquele repositório não volta a entrar como issue.

Cada lista informa sua própria data, estado e limite de paginação. Dados ausentes aparecem como “não confirmado”/“—”, sem zero fictício. Um zero só aparece após coleta confirmada da lista. Fontes parciais não escondem as outras; contagens gerais informam quantas fontes possuem dados. `truncated` nunca vira um total do histórico. A coleta de issues continua limitada a duas páginas do endpoint misto, removendo PRs.

Dados com mais de duas horas, listas marcadas stale ou fallback de cache mantêm identificação de desatualizados. Um relógio local atualiza essa classificação sem consultar a API. O botão de nova consulta respeita cinco minutos e reutiliza o loader compartilhado da OSF-17; nenhum visitante recebe token ou consulta o REST do GitHub.

## Releases e migração do snapshot

O contrato passa a `schemaVersion: 2`, acrescentando `release: { state, checkedAt, item }` por repositório. O leitor aceita e valida estritamente v1, migrando-a em memória para v2 com release **indisponível**, sem inferência. O arquivo original não é alterado. O fallback local foi migrado explicitamente e continua sem dados inventados. A chave do cache Actions foi atualizada para v2.

O coletor consulta `/repos/{allowlist}/releases/latest`, após confirmar a visibilidade pública. A definição exibida é a **última release estável do repositório**, sem rascunhos ou pré-releases. Um 404 nesse endpoint é ausência confirmada, distinta de falha/timeout. Tags, títulos, URL e data são limitados e validados; bodies, assets e credenciais não são exportados. Requisições usam a mesma política de timeout, ETag/304, limite e suspensão por 403/429 da OSF-17. Falha isolada conserva a última release válida como stale somente após nova confirmação pública. Visibilidade não confirmada elimina também a release.

O orçamento passa de 45 para **50 GETs máximos** por execução; o caso de uma página por lista passa de 25 para **30**. A execução continua aproximadamente horária, sem backend. O publicador continua revalidando o JSON e publicando só `snapshot.json` em `github-data`, sem redeploy horário.

A **versão para instalar** é exibida à parte, a partir do catálogo assinado compartilhado, inclusive quando o pacote é publicado no hub. A última release do hub nunca é atribuída aos três aplicativos. A distribuição do Launcher aponta para openstruct-catalog; launcher-struct continua fora da allowlist e de todos os espaços de atividade.

## Verificação

Testes protegem contagem separada de issues/PRs, duplicatas, repositórios distintos com número igual, fonte indisponível versus vazia, recortes limitados, ordenação, expiração, proteção de visibilidade, migração v1/v2 e releases estáveis/404/304/draft/prerelease/origem inválida. Execute `npm test` e `npm run build`.

A revisão visual deve cobrir seleção por URL, voltar/avançar, links das seções, desktop/mobile, ambos os temas e menu móvel. Dados vazios reais não são preenchidos com trabalho inventado. Estados com itens e falhas são protegidos pelas fixtures dos testes.
