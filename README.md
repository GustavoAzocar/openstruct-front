# OpenStruct

Frontend do ecossistema OpenStruct: ferramentas abertas para engenharia estrutural. Esta primeira versão apresenta o projeto, o catálogo e a página do ConsoloStruct.

## Desenvolvimento

Requisitos: Node.js 24 LTS e npm.

```sh
npm ci
npm run dev
```

```sh
npm run build     # TypeScript + build de produção
npm run preview   # Servir o build localmente
```

O projeto usa React, TypeScript, Vite e React Router. O CSS é próprio. As fontes são hospedadas localmente; não há serviços externos obrigatórios, autenticação ou backend.

## Páginas

| Endereço              | Conteúdo                                                                          |
| --------------------- | --------------------------------------------------------------------------------- |
| `/`                   | Apresentação, aplicativos, ConsoloStruct em destaque, princípios e FAQ            |
| `/apps`               | Catálogo com busca e filtros; futuros aplicativos identificados como planejamento |
| `/apps/consolostruct` | Página do aplicativo, prévia interativa, recursos em desenvolvimento e acesso     |
| `/docs`               | Guia inicial com busca, unidades, limitações da prévia e participação             |
| `/community`          | Formas de contribuir e acompanhar o projeto                                       |
| Outros endereços      | Página 404 com navegação de retorno                                               |

Apenas o ConsoloStruct possui página de produto nesta versão. Os demais nomes no catálogo representam o planejamento do ecossistema.

## Links e integrações futuras

Copie `.env.example` para `.env.local` e preencha os endereços que estiverem disponíveis:

```dotenv
VITE_CONSOLOSTRUCT_URL=https://seu-aplicativo.example
VITE_CONSOLOSTRUCT_REPOSITORY=https://github.com/seu-usuario/seu-repositorio
VITE_CONSOLOSTRUCT_DOWNLOAD_URL=https://seu-download.example
VITE_DISCORD_URL=https://discord.gg/seu-convite
```

Os valores são incorporados durante o build. Sem esses endereços, o botão “Abrir aplicativos” abre uma central com acesso à prévia. O Discord exibe um aviso de preparação e oferece o GitHub como alternativa. Nenhum convite ou endereço de aplicativo é inventado.

Os outros links e os dados do catálogo ficam em `src/lib/config.ts`.

## Prévia do ConsoloStruct

A demonstração é uma representação esquemática em SVG. Permite alternar entre modelo, armadura e detalhe, ajustar a projeção de 25 a 60 cm, separar camadas e restaurar o exemplo. **Não executa cálculo, dimensionamento, verificação normativa ou geração de desenho para obra.** Os recursos de cálculo descritos na página são identificados como objetivos de um aplicativo em desenvolvimento.

## Identidade visual

| Cor           | Código    | Uso                      |
| ------------- | --------- | ------------------------ |
| Cobalto       | `#3448D1` | Marca e ações principais |
| Laranja solar | `#FF8A3D` | ConsoloStruct            |
| Âmbar         | `#F4C95D` | Destaques                |
| Aço           | `#B8C5D6` | Apoio                    |
| Grafite       | `#18212F` | Texto e tema escuro      |
| Marfim        | `#F4F1E9` | Fundo principal          |

Tipografia: Sora para marca e títulos, Inter para interface e leitura, IBM Plex Mono para informações técnicas. O monograma O tem uma versão vetorial em `public/assets/openstruct-mark.svg`. A ilustração original de Atlas foi criada para este projeto com geração de imagem.

As fontes WOFF2 são subconjuntos para idiomas latinos. Seus avisos SIL Open Font License estão em `public/fonts/`. A geometria do monograma está em `src/components/Brand.tsx`; o desenho esquemático em `src/components/CorbelModel.tsx`.

## Publicação

O build estático é gerado em `dist/`. Há configurações para Vercel, Netlify e serviços que aceitam `_redirects`. Em outro servidor, configure o fallback das rotas do React Router para `index.html`:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

A publicação e a configuração do domínio `openstruct.com.br` são independentes do envio do código ao GitHub.

## Estrutura

```text
src/
  components/  # Marca, layout, cartões, central de aplicativos e demonstração
  lib/         # Configuração central e catálogo
  pages/       # Páginas e navegação
  styles.css   # Identidade, temas e layouts responsivos
public/
  assets/      # Ilustração do ConsoloStruct e monograma
  fonts/       # Fontes locais e licenças
```

O tema é persistido no navegador, com preferência clara na primeira visita. A interface inclui links de salto, foco visível, menu móvel, controles com rótulos e respeito a movimento reduzido. A central de aplicativos usa um diálogo nativo com navegação por teclado.

## Contribuição

Abra uma issue descrevendo o contexto, o comportamento esperado e, quando possível, passos para reproduzir. Para mudanças de código, execute `npm run build` antes de abrir uma pull request. O workflow de CI repete o build em pushes e pull requests.

Licença MIT. As fontes mantêm suas próprias licenças OFL.
