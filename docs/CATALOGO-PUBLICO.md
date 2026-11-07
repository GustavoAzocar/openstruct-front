# Catálogo público de aplicativos — OSF-05

Revisão em **07/11/2026**, sobre o contrato público do hub no commit
[`bbddcf9a37a1f63658a34dae24dd5afb1d56cf31`](https://github.com/ricardocorsini/openstruct-catalog/tree/bbddcf9a37a1f63658a34dae24dd5afb1d56cf31).
A OSF-01 está implementada em `apps.ts`/`app-registry.ts` e continua fornecendo
identidade, rotas, imagens, licença, maturidade e evidência técnica revisada.

## Contrato e confiança

O único endpoint dos aplicativos é:

```text
https://raw.githubusercontent.com/ricardocorsini/openstruct-catalog/main/catalog.signed.json
```

O envelope tem `payload` (string JSON), `signature` (Base64) e `keyId`. O leitor
verifica a assinatura Ed25519 sobre os bytes UTF-8 **exatos** de `payload`, antes de
interpretar o conteúdo. Em seguida valida o esquema v1, versões SemVer, datas,
IDs únicos, repositórios, canais, plataformas, tamanhos, hashes e assinaturas dos
metadados de cada pacote. O texto `OPENSTRUCT-PACKAGE-V1`, sem quebra final, segue
o [verificador público do hub](https://github.com/ricardocorsini/openstruct-catalog/blob/bbddcf9a37a1f63658a34dae24dd5afb1d56cf31/scripts/security.mjs).
O teste com a publicação real protege a compatibilidade entre os verificadores.

As raízes públicas vêm de
[`catalog/trust.json`](https://github.com/ricardocorsini/openstruct-catalog/blob/bbddcf9a37a1f63658a34dae24dd5afb1d56cf31/catalog/trust.json)
e a autorização por produto vem de
[`distribution.json`](https://github.com/ricardocorsini/openstruct-catalog/blob/bbddcf9a37a1f63658a34dae24dd5afb1d56cf31/distribution.json).
Elas estão fixadas em `catalog-trust.ts`, separadas do envelope remoto. Nenhum
segredo, token GitHub, permissão de escrita ou chave privada é necessário no site.

| ID             | Repositório de código          | Publicação dos pacotes            | Prefixo da tag   | Chave de pacote           |
| -------------- | ------------------------------ | --------------------------------- | ---------------- | ------------------------- |
| consolostruct  | ricardocorsini/consolo-struct  | mesmo repositório                 | v                | consolostruct-packages-v1 |
| molastruct     | ricardocorsini/mola-struct     | mesmo repositório                 | v                | molastruct-packages-v1    |
| armadurastruct | ricardocorsini/armadura-struct | ricardocorsini/openstruct-catalog | armadurastruct-v | launcher-packages-v1      |

Os assets aceitos são Windows/NSIS e Linux/AppImage, x86_64 ou aarch64 conforme o
contrato v1. Uma arquitetura só aparece se houver asset realmente presente e
verificado. A publicação atual contém somente x86_64. A URL recebida precisa
corresponder ao produto, repositório autorizado, tag, versão, alvo e nome canônico;
não se cria um botão por adivinhação do endereço. A arquitetura não é inferida do
código do aplicativo. IDs desconhecidos não criam novos produtos no site; os quatro
itens planejados permanecem sem downloads.

O site escolhe a maior SemVer do canal `stable` **por ID**, independentemente da
ordem do JSON ou da data de publicação. O leitor também conhece o canal `beta`, mas
a interface atual pede apenas `stable`. Nenhuma consulta usa `/releases/latest`.
O feed Tauri `launcher/latest.json` e seu leitor existente continuam separados.

## Falhas, cache e consulta

`CatalogProvider` mantém uma única instância de `catalog-store.ts` por sessão da
aplicação. Home, catálogo, diálogo, biblioteca ilustrativa e páginas compartilham
estado e orçamento de chamadas, inclusive em React StrictMode.

- A primeira consulta é automática. Há até três chamadas por sessão, com intervalo
  mínimo de um minuto, timeout de dez segundos e respeito a `Retry-After`.
- Não há polling automático nem chamadas autenticadas à API REST. O `fetch` usa
  revalidação HTTP (`no-cache`), sem credenciais, e recusa redirecionamento do feed.
- Dados consultados há 15 minutos ficam marcados como desatualizados. O botão
  de nova tentativa usa o mesmo limite em todas as telas.
- Envelope/assinatura inválidos ou erro de rede conservam os últimos dados válidos,
  marcados como desatualizados. Um produto inválido, ausente ou duplicado não apaga
  os outros. Seus novos links não entram na interface.
- Uma lista de releases vazia, em catálogo válido, indica ausência real no canal;
  nesse caso a oferta anterior é retirada, sem reutilizar o download antigo.
- `localStorage` guarda o envelope assinado e a data por produto, nunca um objeto
  normalizado tratado como confiável. Cada envelope é reverificado ao carregar.
  Cache adulterado, data futura ou bloqueio de armazenamento não libera pacotes.
- O snapshot `src/data/catalog.signed.json` é a cópia pública real da ref acima,
  verificada localmente em 07/11/2026 às 10:48:13 UTC. Ele sempre aparece como dado
  desatualizado até uma consulta bem-sucedida. Também passa pelo verificador antes
  de servir como alternativa à rede/cache. A suíte de testes valida suas assinaturas.
- Um catálogo anterior ao `publishedAt` já conhecido para o produto é recusado e
  identificado. A assinatura v1 não contém expiração: sem rede, não há como afirmar
  que o snapshot é a publicação mais recente; por isso o aviso de desatualização.

Sem WebCrypto/Ed25519 em contexto seguro, a interface editorial continua disponível,
com acesso às releases oficiais, mas sem liberar os botões dependentes da verificação.
A página não baixa instaladores para calcular seus hashes: verifica as assinaturas
do catálogo e dos metadados. O Launcher verifica os bytes do pacote ao instalar.

## Versão para instalar e descrição técnica

O catálogo remoto atualiza disponibilidade, versão, data e assets. Nomes, textos,
capturas e guias continuam vindos do registro editorial. As páginas mostram a versão
para instalar e a versão do conteúdo revisado. Se forem diferentes, há aviso de
que os recursos descritos continuam ligados à documentação revisada. Um README
mais novo não promove automaticamente uma capacidade para um instalador anterior.

As integrações `VITE_*_DOWNLOAD_URL` foram removidas do frontend: não podem
contornar a validação dos instaladores. As integrações opcionais web continuam.

## Manutenção

1. Para uma nova release de produto conhecido, publique e sincronize o hub usando
   o fluxo existente. O site recebe a nova versão na próxima consulta, sem deploy.
2. Para atualizar a descrição técnica, confira a tag e seu guia, depois siga
   [o procedimento editorial](CATALOGO-EDITORIAL.md).
3. Para trocar chave, repositório, prefixo, contrato ou produto autorizado, confira
   as fontes públicas e atualize explicitamente `catalog-trust.ts` e o validador.
   Uma chave dentro do JSON remoto não autoriza a própria substituição.
4. Para renovar o snapshot de contingência, copie o envelope público completo sem
   reformatar `payload`, registre ref/data e rode `npm test` e `npm run build`.
   Nenhuma rede é necessária durante os testes/build.

Os testes de contrato usam a publicação real e chaves fictícias geradas apenas no
processo de teste. Exercitam assinaturas, versões/canais, origens, dados incompletos,
ausência de plataforma, isolamento de falhas, cache, expiração e limites de consulta.
A inspeção de interface cobre desktop e largura móvel simulada, nos dois temas;
ela não instala nem executa os aplicativos de engenharia.
