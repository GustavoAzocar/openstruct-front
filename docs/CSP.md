# Validação da Content Security Policy — issue #4

Base: `88ffb2e06b2e87d7270ff9e4bc40f48937b97e29`, em 11/11/2026.
A branch parte da master sincronizada com o original e é independente da contribuição
da issue #2. Não há dependências novas nem alterações na verificação das assinaturas.

## Configuração

`vercel.json` aplica o cabeçalho HTTP `Content-Security-Policy` com `source: "/(.*)"`,
incluindo HTML, rotas internas e arquivos estáticos. `netlify.toml` mantém a mesma
política na hospedagem alternativa, em `[[headers]]` com `for = "/*"`.

```text
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://github.com https://avatars.githubusercontent.com; font-src 'self'; connect-src 'self' https://raw.githubusercontent.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'
```

O script do tema está em `public/theme-init.js`, referenciado de forma síncrona no
head antes do CSS gerado pelo build; não usa async/defer/type=module. Conserva o
fallback claro se a preferência estiver ausente, inválida ou inacessível.
O único style inline encontrado foi substituído pela classe `.issue-branch-note`,
conservando `overflow-wrap: anywhere`. Não há scripts inline no HTML ou atributos
style em src. A política não libera unsafe-inline nem unsafe-eval.

A lista de origens permite recursos locais, o redirecionamento dos avatares de
`github.com` para `avatars.githubusercontent.com` e os três feeds de dados em
`raw.githubusercontent.com`. Links normais para releases e downloads não são
requisições fetch e não requerem ampliar connect-src. O catálogo, o snapshot e o
feed do Launcher conservam seus hosts e sua validação existente.

Os cabeçalhos simples da issue #3 permanecem fora desta contribuição. Aqui,
`frame-ancestors 'self'` protege a incorporação em navegadores com suporte a CSP;
a implementação não adiciona X-Frame-Options nem afirma que esse cabeçalho existe.
Não há CSP em meta, alteração de rewrites ou mudança na exclusão de github-data.

## Etapas e evidências locais

O ponto de partida passou em `npm ci`, `npm test` (**176 testes**) e `npm run build`.
A configuração começou como **Content-Security-Policy-Report-Only** nas duas
hospedagens. Um servidor HTTP local serviu dist com os cabeçalhos lidos do
vercel.json e fallback de SPA; `vite preview` sozinho não aplica esses cabeçalhos.

No Chromium 151 via Playwright, as verificações em Report-Only terminaram em
**11/11/2026 13:01:27 UTC**. Somente depois de todas passarem, a configuração foi
promovida para **Content-Security-Policy** bloqueante e a navegação foi repetida,
concluindo em **13:02:36 UTC**.
Foram capturados eventos `securitypolicyviolation` desde o início de cada documento
e erros JavaScript. Cada linha abaixo representa acesso direto pela URL nos dois
temas, tanto em Report-Only quanto na política bloqueante.

| Rota                             | Report-Only claro/escuro | Bloqueante claro/escuro |
| -------------------------------- | ------------------------ | ----------------------- |
| `/`                              | OK / OK                  | OK / OK                 |
| `/apps`                          | OK / OK                  | OK / OK                 |
| `/apps/consolostruct`            | OK / OK                  | OK / OK                 |
| `/apps/molastruct`               | OK / OK                  | OK / OK                 |
| `/apps/armadurastruct`           | OK / OK                  | OK / OK                 |
| `/launcher`                      | OK / OK                  | OK / OK                 |
| `/docs`                          | OK / OK                  | OK / OK                 |
| `/community`                     | OK / OK                  | OK / OK                 |
| `/community/como-colaborar`      | OK / OK                  | OK / OK                 |
| `/releases`                      | OK / OK                  | OK / OK                 |
| `/development`                   | OK / OK                  | OK / OK                 |
| `/apps/geosptstruct`             | OK / OK                  | OK / OK                 |
| `/development/contribuir-com-ia` | OK / OK                  | OK / OK                 |

Resultado: **zero violações do aplicativo e zero erros JavaScript** nas 26
combinações por etapa. Os testes também verificaram:

- Os três feeds reais responderam 200; os dois links de download do Launcher
  foram apresentados, sem iniciar downloads. O catálogo assinado carregou sem
  alterar sua lógica de verificação.
- Todas as imagens consultadas carregaram, incluindo avatares após redirecionamento,
  e as fontes locais terminaram de carregar. Imagens lazy foram ativadas no teste
  para também conferir os recursos abaixo da dobra.
- Não havia atributos style nem scripts inline no DOM das rotas. A aplicação do
  tema foi observada antes do first-contentful-paint nas visitas medidas.
- Recarga direta de Desenvolvimento preservou o tema e não gerou violações.
  Preferência ausente/inválida e bloqueio de localStorage mantiveram o fallback
  claro e o botão de troca de tema utilizável.
- Um documento de teste separado tentou executar script inline: houve evento CSP
  em ambas as etapas; executou em Report-Only e foi bloqueado em modo bloqueante.
  Essas violações intencionais não fazem parte das rotas do aplicativo.
- A política bloqueante permitiu iframe de mesma origem e bloqueou um ancestral
  de origem diferente em teste separado. Não foi necessário liberar framing externo.

Os quatro testes de regressão em `tests/csp.test.mjs` protegem a política HTTP,
a equivalência entre as hospedagens, o bootstrap síncrono do tema, as falhas de
armazenamento e a ausência de estilos inline. Resultado final: `npm test`
(**180 testes**), `npm run typecheck`, `npm run build` e `npm run audit:content`
aprovados. A auditoria teve zero erros locais e duas revisões editoriais
preexistentes sobre versões de documentação. O aviso de chunk acima de 500 kB
no build já existia no ponto de partida. JSON/TOML foram analisados e a igualdade
das políticas foi conferida; GETs locais de `/`, `/apps` e `/favicon.svg`
retornaram 200 com o cabeçalho bloqueante.

## Preview da Vercel e produção: verificações pendentes

**A validação acima é local, com o build de produção e cabeçalhos HTTP equivalentes;
não é uma implantação na Vercel.** O PR será aberto manualmente pelo autor.
Não foi disponibilizado um preview hospedado desta branch durante a implementação.
A configuração alternativa da Netlify foi conferida por leitura/teste, sem deploy.

Em 11/11/2026 13:01:37 UTC, o HEAD de `https://www.openstruct.com.br/` retornou
200 e não continha CSP. Isso descreve a produção **antes** desta contribuição.
Não se afirma que o Mozilla HTTP Observatory já aprovou o site.

Após abrir o PR, conferir no preview real e repetir na produção depois do merge:

```sh
# Defina csp_preview_url com a URL real fornecida pela Vercel.
curl -sSI "$csp_preview_url/"
curl -sSI "$csp_preview_url/apps"
curl -sSI "$csp_preview_url/favicon.svg"
```

As três respostas devem conter o cabeçalho bloqueante acima. Confira também
`/theme-init.js` como JavaScript, os assets do build e o reload de rota interna.
Repita a matriz de rotas com o console aberto ou capture securitypolicyviolation;
confira os avatares e os três feeds. Serviços de preview podem acrescentar scripts
que não existem no build local: investigar qualquer violação antes de ampliar a CSP.
Não é necessário liberar domínios do provedor sem evidência de recurso utilizado.

Depois do deploy, executar o Mozilla HTTP Observatory para
`https://www.openstruct.com.br/` e anexar o resultado atualizado. Confirmar que a
CSP e frame-ancestors foram reconhecidos; acompanhar separadamente os cabeçalhos
da issue #3. A aceitação remota permanece pendente até essas verificações.
