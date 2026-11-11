# Guia de contribuição com IA

Rota: `/development/contribuir-com-ia`. Revisão de conteúdo em 11/11/2026.

O percurso público está em `src/pages/AiContribution.tsx`, com conteúdo de prompt,
validação de URLs e fontes em `src/lib/ai-contribution.ts`. A identidade visual usa
os tokens e componentes existentes, com CSS próprio e carregamento separado da página.
Os projetos vêm de `developmentSources`; não há outra lista de repositórios.

São seis passos: conectar o GitHub no ChatGPT ou usar uma tarefa do Codex, criar e
sincronizar o fork, escolher uma issue aberta, copiar o prompt, revisar a entrega e
abrir o PR manualmente. Os pontos de entrada são a home, Desenvolvimento, manual
geral e rodapé. O título da aba e as âncoras diretas funcionam na rota independente.

## Prompt e formulário

O modelo deriva do fluxo original/fork/issue. A IA deve ler a especificação completa
e as instruções atuais do projeto, conferir trabalhos equivalentes, identificar a
branch padrão real e sincronizar a base antes de editar. Mudanças existentes devem
ser preservadas. Implementação e testes seguem a issue, com resultados reais e
pendências explícitas. Commit e push são limitados a uma nova branch do fork; PR,
merge e release não são executados pelo prompt.

O formulário apenas monta texto no navegador, sem chamada ao GitHub, gravação em
storage ou envio de contribuição. Links HTTPS são normalizados; um fork não pode
ter a mesma URL do original e a issue deve pertencer ao projeto selecionado.
Isso **não** confirma a existência, ancestralidade do fork, acesso ou estado da
issue: essas verificações são pedidas à IA. Campos vazios produzem marcadores
explícitos no modelo; campos preenchidos inválidos bloqueiam a cópia. Ao trocar
de projeto, links incompatíveis continuam visíveis para correção, sem serem
redirecionados silenciosamente.

A cópia usa Clipboard API e relata sucesso somente após a operação terminar.
Se o navegador negar a operação, o texto é selecionado para cópia manual.
A interface usa controles nativos com rótulos, erro associado ao campo e status
de cópia anunciado; todos os passos podem ser lidos sem conectar conta alguma.

## Fontes oficiais

- [Plugins do ChatGPT e Codex](https://learn.chatgpt.com/docs/plugins)
- [Codex Cloud](https://learn.chatgpt.com/docs/cloud)
- [Ambientes de nuvem](https://learn.chatgpt.com/docs/environments/cloud-environments)
- [Sincronizar um fork](https://docs.github.com/pt/pull-requests/how-tos/work-with-forks/syncing-a-fork)
- [Criar um PR a partir de um fork](https://docs.github.com/pt/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork)

Os nomes de menus e o acesso dependem da superfície, conta e permissões. O guia
oferece caminhos separados para ChatGPT e Codex e links para atualização. A issue
ArmaduraStruct #135 é apenas exemplo de endereço, sem garantia de disponibilidade
futura. Não há comandos de build universais: cada aplicativo mantém seu guia.

## Verificação

Rodar `npm test`, `npm run build` e `npm run audit:content`. Os testes de domínio
cobrem seleção de destinos, rejeição de original como fork, issue de outro
projeto, normalização e modelo com campos vazios. Conferir no navegador a rota
direta, os atalhos, troca de ferramenta e projeto, cópia com sucesso/negada,
âncoras, teclado e ausência de rolagem horizontal no celular, nos dois temas.
