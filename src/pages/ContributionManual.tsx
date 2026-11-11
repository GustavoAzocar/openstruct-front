import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { developmentSources } from '../lib/development';
import { AI_CONTRIBUTION_PATH } from '../lib/ai-contribution';
import {
  contributionPaths,
  exampleReport,
  frontendCommands,
  frontendManualSource,
  manualRepository,
  manualReview,
  manualSections,
} from '../lib/contribution-manual';
import '../contribution-manual.css';

function Commands({ title, children }: { title: string; children: string }) {
  return (
    <div className="manual-code">
      <p>{title}</p>
      <pre tabIndex={0} aria-label={title}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
export function ContributionManual() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selected = manualRepository(params.get('repo'));
  const front = frontendManualSource.source;
  useEffect(() => {
    // Restore direct anchors when this lazy route has finished loading.
    if (!location.hash) return;
    try {
      document
        .getElementById(decodeURIComponent(location.hash.slice(1)))
        ?.scrollIntoView({ behavior: 'instant' });
    } catch {
      /* An invalid fragment does not prevent reading. */
    }
  }, [location.hash]);
  function choose(slug: string) {
    const next = new URLSearchParams(params);
    next.delete('repo');
    if (manualRepository(slug)) next.set('repo', slug);
    navigate({ search: next.toString(), hash: location.hash }, { preventScrollReset: true });
  }
  return (
    <div className="container contribution-manual">
      <header className="page-hero">
        <span className="eyebrow">MANUAL DE COLABORAÇÃO</span>
        <h1>
          Uma primeira contribuição, <span className="blue-text">passo a passo.</span>
        </h1>
        <p>
          Você pode ajudar sem programar. Escolha um projeto, encontre uma contribuição que faça
          sentido e acompanhe o caminho até a revisão.
        </p>
        <p className="manual-meta">Leitura pública, sem login. Revisão: 07/11/2026.</p>
        <div className="button-row">
          <a className="button button-primary" href="#sem-codigo">
            Começar sem programar
          </a>
          <a className="button button-outline" href="#codigo">
            Alterar o frontend
          </a>
          <Link className="button button-outline" to={AI_CONTRIBUTION_PATH}>
            Contribuir com IA
          </Link>
        </div>
      </header>
      <aside className="manual-public-notice" aria-label="Antes de compartilhar">
        <strong>Antes de compartilhar: issues e pull requests são públicos.</strong>
        <p>
          Não publique dados pessoais, senhas, tokens, projetos de clientes ou material normativo
          protegido. Use exemplos fictícios ou públicos com autorização. Ler este manual não exige
          conta; para publicar no GitHub, você precisará entrar na sua própria conta. Este site não
          recebe arquivos nem envia contribuições por você.
        </p>
      </aside>
      <div className="manual-layout">
        <nav className="manual-toc" aria-label="Sumário do manual">
          <span className="eyebrow">NESTE MANUAL</span>
          {manualSections.map((s) => (
            <a href={'#' + s.id} key={s.id}>
              {s.title}
            </a>
          ))}
          <Link to="/community">Voltar à Comunidade</Link>
        </nav>
        <article className="manual-body">
          <section id="escolher" aria-labelledby="choose-title">
            <h2 id="choose-title">1. Escolha o projeto e sua forma de ajudar</h2>
            <p>
              Uma dúvida sobre cálculo, arquivos ou desenho de um aplicativo pertence ao repositório
              dele. Textos, links e navegação deste site pertencem ao frontend. O hub público trata
              do catálogo e da distribuição; ele não expõe o código privado do Launcher.
            </p>
            <label className="manual-select" htmlFor="manual-repository">
              Em qual projeto você quer colaborar?
              <select
                id="manual-repository"
                value={selected?.source.slug ?? ''}
                onChange={(e) => choose(e.target.value)}
              >
                <option value="">Escolha um projeto</option>
                {developmentSources.map((s) => (
                  <option key={s.repository} value={s.slug}>
                    {s.name} · {s.kind}
                  </option>
                ))}
              </select>
            </label>
            {selected ? (
              <div className="manual-destination" aria-live="polite">
                <h3>Seu destino: {selected.source.name}</h3>
                <p>
                  <code>{selected.source.repository}</code>
                </p>
                <p>
                  Comece pelas orientações do próprio projeto. Os comandos de código da seção 3 são
                  exclusivamente do frontend.
                </p>
                <div className="manual-links">
                  <a href={selected.guide.url} target="_blank" rel="noreferrer">
                    {selected.guide.label} ↗
                  </a>
                  <a href={selected.documentation} target="_blank" rel="noreferrer">
                    Documentação do projeto ↗
                  </a>
                  {selected.examples && (
                    <a href={selected.examples} target="_blank" rel="noreferrer">
                      Exemplos públicos ↗
                    </a>
                  )}
                  <Link to={'/development?repo=' + selected.source.slug + '#issues'}>
                    Relatos na central
                  </Link>
                </div>
                {selected.source.slug === 'openstruct-catalog' && (
                  <p>
                    Para instalação, consulte primeiro o <Link to="/launcher">Struct Launcher</Link>{' '}
                    e as <Link to="/releases?product=launcher">publicações do hub</Link>. Descreva
                    somente o comportamento público observado; não envie credenciais ou logs com
                    segredos.
                  </p>
                )}
              </div>
            ) : (
              <p className="manual-note" role="status">
                Escolha um projeto para mostrar seus guias e o destino correto do relato. Se o valor
                da URL não for reconhecido, escolha novamente.
              </p>
            )}
            <h3 id="termos">As palavras que vão aparecer</h3>
            <dl className="manual-glossary">
              <div>
                <dt>Repositório</dt>
                <dd>A pasta pública do projeto no GitHub, com código, documentação e histórico.</dd>
              </div>
              <div>
                <dt>Issue</dt>
                <dd>
                  Um registro público de problema, ideia ou dúvida. Permite reunir contexto e
                  conversar sobre o assunto.
                </dd>
              </div>
              <div>
                <dt>Fork e clone</dt>
                <dd>
                  Fork é uma cópia do repositório na sua conta GitHub; clone é a cópia que você traz
                  para o computador.
                </dd>
              </div>
              <div>
                <dt>Branch</dt>
                <dd>Uma linha de trabalho separada, onde você prepara sua alteração.</dd>
              </div>
              <div>
                <dt>Commit e diff</dt>
                <dd>
                  Commit registra uma alteração no histórico; diff mostra exatamente o que mudou.
                </dd>
              </div>
              <div>
                <dt>Pull request (PR)</dt>
                <dd>
                  Um pedido público para revisar e incorporar sua branch ao projeto original. Abrir
                  o pedido não significa que ele foi aceito.
                </dd>
              </div>
            </dl>
            <div className="manual-paths">
              {contributionPaths.map((path) => (
                <div key={path.id}>
                  <h3>{path.title}</h3>
                  <dl>
                    <dt>Você precisa de</dt>
                    <dd>{path.prerequisites}</dd>
                    <dt>Próximo passo</dt>
                    <dd>{path.next}</dd>
                    <dt>Exemplo</dt>
                    <dd>{path.example}</dd>
                    <dt>Resultado esperado</dt>
                    <dd>{path.result}</dd>
                  </dl>
                  {path.id === 'programacao' &&
                  selected &&
                  selected.source.slug !== 'openstruct-front' ? (
                    <a
                      className="text-link"
                      href={selected.guide.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Seguir o guia de {selected.source.name} ↗
                    </a>
                  ) : (
                    <a className="text-link" href={'#' + path.target}>
                      Seguir este percurso →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section id="sem-codigo" aria-labelledby="no-code-title">
            <h2 id="no-code-title">2. Sua primeira colaboração sem código</h2>
            <p>
              Você não precisa de Git, Node.js ou ambiente de desenvolvimento para relatar um
              problema, propor uma melhoria ou sugerir uma correção de texto. Uma{' '}
              <a href="#termos">issue</a> é o registro público usado para essa conversa.
            </p>
            <ol className="manual-steps">
              <li>
                <h3>Confirme o projeto</h3>
                <p>
                  <a href="#escolher">Escolha o projeto acima</a>. Se o problema está no
                  ArmaduraStruct, o destino é o ArmaduraStruct; se está nesta página, é o Site
                  OpenStruct. Leia as orientações desse repositório.
                </p>
                <p className="manual-result">
                  Resultado: você conhece o nome e o endereço público do destino.
                </p>
              </li>
              <li>
                <h3>Pesquise antes de abrir um relato</h3>
                <p>
                  Busque uma palavra do problema ou da proposta nos relatos, incluindo os fechados.
                  A{' '}
                  <Link
                    to={
                      '/development' + (selected ? '?repo=' + selected.source.slug : '') + '#issues'
                    }
                  >
                    central de issues
                  </Link>{' '}
                  mostra um recorte; o GitHub tem a lista original. Se já existir uma discussão
                  equivalente, acrescente sua reprodução nela, sem duplicar o ticket.
                </p>
                {selected && (
                  <a className="text-link" href={selected.issues} target="_blank" rel="noreferrer">
                    Pesquisar relatos de {selected.source.name} no GitHub ↗
                  </a>
                )}
                <p className="manual-result">
                  Resultado: você encontrou uma conversa relevante ou confirmou que precisa de um
                  novo relato.
                </p>
              </li>
              <li>
                <h3>Prepare uma reprodução pequena</h3>
                <p>
                  Anote página ou tela, versão do aplicativo, sistema, navegador se aplicável, tema
                  e passos em ordem. Para o site, registre URL e data; commit é opcional se você o
                  conhecer. Para testar um app, use a versão e o exemplo indicados em seu guia; um
                  exemplo de desenvolvimento pode não abrir em um instalador antigo.
                </p>
                <p>
                  Retire arquivos de clientes, nomes e identificadores. Descreva as entradas e
                  unidades de um exemplo fictício autorizado. Uma sugestão de documentação pode
                  mostrar a frase atual e sua alternativa, sem instalar nada.
                </p>
                <p className="manual-result">
                  Resultado: outra pessoa consegue repetir ou compreender o caso com o contexto
                  fornecido.
                </p>
              </li>
              <li>
                <h3>Separe esperado e obtido</h3>
                <p>
                  Conte o que você fez, o que esperava e o que observou. Um erro de instalação pode
                  incluir a mensagem revisada e a versão do pacote; nunca copie um log inteiro sem
                  conferir seu conteúdo.
                </p>
                <p>
                  O exemplo abaixo é fictício e trata do site. Para um aplicativo, substitua
                  produto, tela, versão e passos pelos fatos observados; não envie o exemplo como se
                  fosse um defeito real.
                </p>
                <Commands title="Exemplo de relato fictício — adapte aos fatos observados">
                  {exampleReport}
                </Commands>
                <p>
                  Em divergência técnica, acrescente entradas, unidades, hipóteses, referência e
                  resultado independente esperado. Cite edição e item da fonte; não reproduza
                  material normativo protegido. Participar da revisão não constitui aprovação de
                  projeto estrutural.
                </p>
                <p className="manual-result">
                  Resultado: um relato objetivo, verificável e sem alegação técnica que os dados não
                  sustentem.
                </p>
              </li>
              <li>
                <h3>Revise e envie pelo GitHub</h3>
                <p>
                  <a href="#antes-de-enviar">Confira a lista antes de enviar</a>. Issues são
                  públicas; revise texto e evidências antes de abrir o destino. O botão abaixo
                  apenas abre o GitHub. Você escolhe o template disponível, revisa e envia por lá.
                </p>
                {selected ? (
                  <>
                    <p className="manual-note">
                      Destino público: <strong>{selected.source.repository}</strong>. Não há criação
                      automática de issue.
                    </p>
                    <a
                      className="button button-outline"
                      href={selected.newIssue}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir novo relato em {selected.source.name} ↗
                    </a>
                  </>
                ) : (
                  <a className="text-link" href="#escolher">
                    Escolha um projeto para mostrar o destino →
                  </a>
                )}
                <p>
                  Se não houver template, use um relato em branco com as informações do exemplo.
                  Volte à conversa para responder a perguntas e corrigir detalhes; não existe
                  promessa de prazo de resposta ou de implementação.
                </p>
                <p className="manual-result">
                  Resultado: uma issue ou comentário com URL própria no repositório escolhido,
                  disponível para acompanhamento.
                </p>
              </li>
            </ol>
          </section>
          <section id="codigo" aria-labelledby="code-title">
            <h2 id="code-title">3. Sua primeira alteração no frontend</h2>
            <p>
              <strong>
                Este percurso é do Site OpenStruct: {front.repository}, base{' '}
                {manualReview.frontendBranch}.
              </strong>{' '}
              Para código dos aplicativos, use o guia do projeto selecionado na seção 1; não presuma
              os mesmos comandos ou requisitos.
            </p>
            <p>
              Você vai preparar uma pequena correção de texto no README.md como exemplo. Não é
              necessário alterar motores de engenharia. Ao encontrar{' '}
              <a href="#termos">fork, branch, commit ou PR</a>, consulte as definições acima.
            </p>
            <ol className="manual-steps">
              <li>
                <h3>Leia e combine o escopo</h3>
                <p>
                  Leia o{' '}
                  <a href={frontendManualSource.guide.url} target="_blank" rel="noreferrer">
                    README de desenvolvimento do frontend ↗
                  </a>{' '}
                  e pesquise as{' '}
                  <a href={frontendManualSource.issues} target="_blank" rel="noreferrer">
                    issues do site ↗
                  </a>
                  . Se estiver ligada a uma issue, converse nela antes de trabalhar. Para uma
                  proposta maior, descreva o escopo primeiro. Não presuma que uma issue está
                  reservada ou que toda sugestão será aceita.
                </p>
                <p className="manual-result">
                  Resultado: um objetivo pequeno e explicado. Exemplo: tornar uma instrução do
                  README mais clara sem mudar seu sentido.
                </p>
              </li>
              <li>
                <h3>Confira as ferramentas e faça seu fork</h3>
                <p>
                  Instale Git, Node.js 24 LTS e npm, como recomenda o README. Em Windows, os
                  comandos Git podem ser executados no Git Bash; use o terminal no Linux/macOS. No{' '}
                  <a href={front.url} target="_blank" rel="noreferrer">
                    repositório original ↗
                  </a>
                  , use Fork para criar sua cópia na sua própria conta. Se já tiver um fork, use-o e
                  confira sua atualização.
                </p>
                <Commands title="Conferir versões das ferramentas">
                  {frontendCommands.versions}
                </Commands>
                <p className="manual-result">
                  Resultado: os três comandos exibem versões; Node mostra v24.x. Seu fork tem
                  endereço na sua conta.
                </p>
              </li>
              <li>
                <h3>Clone e crie uma branch</h3>
                <p>
                  Substitua SEU-USUARIO pelo seu login GitHub. origin será seu fork; upstream será o
                  projeto original. fetch consulta a base atual; switch cria sua linha de trabalho a
                  partir de upstream/master. O nome de branch abaixo é apenas um exemplo; escolha
                  outro se já o utilizou.
                </p>
                <Commands title="Preparar a cópia local do frontend">
                  {frontendCommands.clone}
                </Commands>
                <p className="manual-result">
                  Resultado: a pasta openstruct-front está no computador e a branch
                  docs/primeira-contribuicao está ativa. Nenhuma alteração foi enviada ao original.
                </p>
              </li>
              <li>
                <h3>Instale e abra o site local</h3>
                <Commands title="Executar o frontend localmente">
                  {frontendCommands.install}
                </Commands>
                <p>
                  npm ci usa o arquivo de dependências travado do projeto. npm run dev inicia o
                  Vite; abra o endereço Local exibido no terminal, normalmente
                  http://localhost:5173. Se a porta estiver ocupada, o Vite pode escolher outra.
                  Mantenha esse terminal aberto e use outro terminal para comandos posteriores. Para
                  encerrar o servidor, use Ctrl+C.
                </p>
                <p>
                  Para limitar o servidor ao próprio computador, use{' '}
                  <code>{frontendCommands.localDev}</code>. Essa opção também permite executar o
                  Vite em ambientes que restringem a descoberta das interfaces de rede.
                </p>
                <p className="manual-result">
                  Resultado: o site abre localmente. A interface e o manual podem ser lidos mesmo se
                  uma integração pública estiver temporariamente indisponível.
                </p>
              </li>
              <li>
                <h3>Faça uma mudança pequena e confira</h3>
                <p>
                  Abra README.md em um editor, melhore uma frase previamente identificada e salve.
                  Compare antes e depois para preservar o sentido. Para alterar a interface,
                  mantenha cobalto, marfim, fontes e temas; confira desktop, celular e teclado.
                  Execute os testes e o build; o diff é a comparação do conteúdo, não uma prévia de
                  deploy.
                </p>
                <Commands title="Verificar alteração, testes e build">
                  {frontendCommands.check}
                </Commands>
                <p>
                  Se alguma verificação falhar, investigue antes de enviar. Para mudanças de
                  comportamento, acrescente um teste de regressão pertinente. Não há necessidade de
                  criar um teste que apenas repita uma correção de redação.
                </p>
                <p className="manual-result">
                  Resultado: testes e build passam e o diff mostra somente a alteração pretendida,
                  sem arquivos gerados ou dados privados.
                </p>
              </li>
              <li>
                <h3>Registre e envie para seu fork</h3>
                <p>
                  Antes do commit, confira que nome/e-mail de autoria do Git estão configurados
                  localmente; o GitHub oferece endereço noreply para quem prefere manter o e-mail
                  privado. Não coloque credenciais no código nem neste manual. Neste exemplo, apenas
                  README.md é preparado para o commit; adapte o caminho quando a alteração real for
                  outra.
                </p>
                <Commands title="Criar commit e enviar a branch para o fork">
                  {frontendCommands.send}
                </Commands>
                <p className="manual-result">
                  Resultado: a branch do seu fork contém o commit. O projeto original ainda não foi
                  alterado.
                </p>
              </li>
              <li>
                <h3>Abra e revise seu pull request</h3>
                <p>
                  Issues e PRs são públicos. Revise novamente a{' '}
                  <a href="#antes-de-enviar">lista de envio</a>. No seu fork, use Contribute → Open
                  pull request; ou abra a{' '}
                  <a href={front.url + '/compare'} target="_blank" rel="noreferrer">
                    comparação no repositório original ↗
                  </a>{' '}
                  e escolha compare across forks.
                </p>
                <dl className="manual-pr-base">
                  <div>
                    <dt>Base repository</dt>
                    <dd>{front.repository}</dd>
                  </div>
                  <div>
                    <dt>Base branch</dt>
                    <dd>{manualReview.frontendBranch}</dd>
                  </div>
                  <div>
                    <dt>Head repository</dt>
                    <dd>SEU-USUARIO/openstruct-front</dd>
                  </div>
                  <div>
                    <dt>Compare branch</dt>
                    <dd>docs/primeira-contribuicao</dd>
                  </div>
                </dl>
                <p>
                  Confira o diff antes de Create pull request. Descreva problema e resultado, linke
                  a issue se houver e informe npm test, npm run build e verificações visuais que
                  realmente executou. Indique limites da validação. Na revisão atual não há template
                  de PR do frontend; escreva esse contexto no campo de descrição.
                </p>
                <p className="manual-result">
                  Resultado: um PR com URL no frontend, pronto para revisão; abrir o PR não publica
                  automaticamente sua alteração no site.
                </p>
              </li>
              <li>
                <h3>Responda à revisão no mesmo PR</h3>
                <p>
                  Leia os comentários, esclareça dúvidas e faça os ajustes na mesma branch. Repita
                  npm test, npm run build e a verificação visual pertinente. Revise os arquivos e
                  envie um novo commit; o PR existente acompanha a branch, sem precisar abrir outro
                  pedido para os mesmos ajustes.
                </p>
                <Commands title="Atualizar o mesmo PR após uma revisão">
                  {frontendCommands.update}
                </Commands>
                <p>
                  Informe o que mudou e verificações executadas. Se não concordar com uma sugestão,
                  explique com um exemplo. Aguarde a decisão de quem mantém o repositório; checks
                  aprovados não garantem aceite. Se ficar bloqueado por conflitos, peça orientação
                  no PR antes de tentar uma operação destrutiva.
                </p>
                <p className="manual-result">
                  Resultado: a conversa, os ajustes e a decisão permanecem rastreáveis no mesmo PR.
                </p>
              </li>
            </ol>
          </section>
          <section id="antes-de-enviar" aria-labelledby="check-title">
            <h2 id="check-title">4. Confira antes de enviar</h2>
            <ul className="manual-checklist">
              <li>
                Produto, repositório e versão/data corretos; busque relatos abertos e fechados antes
                de duplicar.
              </li>
              <li>
                Contexto, passos, esperado e obtido separados; uma proposta explica necessidade e
                escopo.
              </li>
              <li>
                Somente exemplos públicos ou fictícios autorizados, sem dados pessoais, segredos,
                clientes ou cópia de normas protegidas.
              </li>
              <li>
                Evidência técnica com unidades, hipóteses, referência e resultado independente,
                quando aplicável.
              </li>
              <li>
                Para PR de código: branch e base corretas, diff pequeno, testes e build executados,
                limitações informadas.
              </li>
              <li>
                Para interface: leia em ambos os temas e larguras, navegue por teclado e descreva a
                conferência.
              </li>
              <li>
                Guarde a URL do relato/PR e acompanhe eventuais perguntas. Não há promessa de aceite
                ou prazo.
              </li>
            </ul>
          </section>
          <section id="duvidas" aria-labelledby="faq-title">
            <h2 id="faq-title">5. Dúvidas e próximos passos</h2>
            <details>
              <summary>Como escolher uma primeira tarefa?</summary>
              <p>
                Comece por algo que consiga reproduzir e explicar. A{' '}
                <Link to="/community#para-comecar">vitrine de primeiras contribuições</Link> usa
                apenas labels presentes nas issues; help wanted não significa automaticamente uma
                tarefa fácil. Leia a conversa e combine um escopo.
              </p>
            </details>
            <details>
              <summary>E se não houver issue indicada?</summary>
              <p>
                Você pode apontar uma instrução confusa, testar um exemplo público ou registrar uma
                observação de acessibilidade. Pesquise primeiro, descreva o contexto no projeto
                correto e evite criar um ticket só para reservar trabalho sem explicar a
                necessidade.
              </p>
            </details>
            <details>
              <summary>Preciso programar ou instalar o ambiente para ajudar?</summary>
              <p>
                Não. Relatos do site, sugestões de texto e revisão visual podem ser feitos com
                navegador e teclado. Testar um aplicativo exige o ambiente indicado no guia dele;
                contribuir com código no frontend segue a seção 3. Ler o site não exige login;
                enviar pelo GitHub exige sua própria conta.
              </p>
            </details>
            <details>
              <summary>Onde tirar dúvidas e o que acontece depois do envio?</summary>
              <p>
                Leia o guia do projeto e pesquise relatos existentes. Se não encontrar resposta,
                descreva sua dúvida nas issues públicas do repositório escolhido. A conversa pode
                pedir mais dados, agrupar um relato duplicado, sugerir ajustes ou encerrar a
                proposta com uma explicação. Não há prazo de resposta ou promessa de implementação.
              </p>
            </details>
            <details>
              <summary>Meu fork, branch ou PR já existe. Preciso criar outro?</summary>
              <p>
                Use seu fork existente, confira a base e trabalhe em uma branch adequada ao escopo.
                Para responder à revisão, use a mesma branch do PR. Se já há mudanças locais ou o
                nome de branch do exemplo existe, confira git status e os guias antes de continuar;
                não apague trabalho para repetir o tutorial.
              </p>
            </details>
            <details>
              <summary>Posso contribuir com cálculo ou enviar um projeto real?</summary>
              <p>
                Contribuições técnicas exigem fontes e casos reproduzíveis, com revisão e limites de
                aplicação. Não publique projetos de clientes. Use um exemplo fictício mínimo e uma
                referência que possa ser citada legalmente. Uma issue, um teste ou um PR aprovado
                não equivalem à aprovação de um projeto estrutural.
              </p>
            </details>
            <details>
              <summary>Onde estão os templates e os outros guias do site?</summary>
              <p>
                Na revisão deste manual, OSF-27 ainda não disponibiliza CONTRIBUTING nem templates
                no frontend. OSF-26 e a estrutura de artigos OSF-29 também não estão implementadas.
                O percurso usa o README e canais públicos existentes. Não presume um formulário
                próprio, fórum ou convite de comunidade. Consulte os guias dos aplicativos para suas
                regras e templates.
              </p>
            </details>
          </section>
          <section id="fontes" aria-labelledby="sources-title">
            <h2 id="sources-title">6. Fontes e revisão deste manual</h2>
            <p>
              Revisão em 07/11/2026. Base do frontend:{' '}
              <a
                href={front.url + '/commit/' + manualReview.frontendRef}
                target="_blank"
                rel="noreferrer"
              >
                {manualReview.frontendRef.slice(0, 7)} ↗
              </a>
              . Conteúdo mantido em{' '}
              <a
                href={front.url + '/blob/master/src/pages/ContributionManual.tsx'}
                target="_blank"
                rel="noreferrer"
              >
                ContributionManual.tsx ↗
              </a>
              , com caminhos e comandos em{' '}
              <a
                href={front.url + '/blob/master/src/lib/contribution-manual.ts'}
                target="_blank"
                rel="noreferrer"
              >
                contribution-manual.ts ↗
              </a>
              .
            </p>
            <p>
              README e este manual se complementam: o README registra o ambiente e aponta ao
              percurso completo aqui. Ao mudar scripts, branch ou canais, revise os comandos e a
              data; não duplique este texto em outro guia. Para cada app, prevalecem suas
              orientações atuais.
            </p>
            <ul>
              {developmentSources.map((source) => {
                const repo = manualRepository(source.slug)!;
                return (
                  <li key={source.repository}>
                    <a href={repo.guide.url} target="_blank" rel="noreferrer">
                      {source.name}: {repo.guide.label} ↗
                    </a>{' '}
                    ·{' '}
                    <a
                      href={source.url + '/tree/' + repo.reviewedRef}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ref {repo.reviewedRef.slice(0, 7)} da revisão ↗
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="manual-links">
              <a href={front.url + '/blob/master/package.json'} target="_blank" rel="noreferrer">
                Comandos atuais do frontend ↗
              </a>
              <a
                href="https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project"
                target="_blank"
                rel="noreferrer"
              >
                Guia oficial de colaboração no GitHub ↗
              </a>
            </div>
            <Link className="text-link" to="/community#para-comecar">
              Explorar formas de participar →
            </Link>
          </section>
          <a className="text-link" href="#escolher">
            Voltar à escolha do projeto ↑
          </a>
        </article>
      </div>
    </div>
  );
}
