import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Sparkles } from 'lucide-react';
import {
  AI_GUIDE_REVIEW_DATE,
  DEFAULT_AI_REPOSITORY,
  aiGuideSources,
  aiGuideSteps,
  contributionPrompt,
} from '../lib/ai-contribution';
import { developmentSources } from '../lib/development';
import { CONTRIBUTION_MANUAL_PATH } from '../lib/contribution-manual';
import { site } from '../lib/config';
import '../ai-contribution.css';

export function AiContribution() {
  const [tool, setTool] = useState('chatgpt');
  const [repository, setRepository] = useState(DEFAULT_AI_REPOSITORY);
  const [fork, setFork] = useState('');
  const [issue, setIssue] = useState('');
  const [copyResult, setCopyResult] = useState<{ prompt: string; success: boolean } | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const source = developmentSources.find((entry) => entry.slug === repository)!;
  const recipe = contributionPrompt(source, fork, issue);
  const invalid = Boolean(recipe.forkError || recipe.issueError);
  const copied = copyResult?.prompt === recipe.prompt && copyResult.success;

  useEffect(() => {
    // This route is lazy: its anchors become available after Layout has rendered.
    if (!location.hash) return;
    try {
      document
        .getElementById(decodeURIComponent(location.hash.slice(1)))
        ?.scrollIntoView({ behavior: 'instant' });
    } catch {
      // An invalid fragment does not prevent reading the guide.
    }
  }, [location.hash]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(recipe.prompt);
      setCopyResult({ prompt: recipe.prompt, success: true });
    } catch {
      promptRef.current?.focus();
      promptRef.current?.select();
      setCopyResult({ prompt: recipe.prompt, success: false });
    }
  }

  return (
    <div className="container ai-guide">
      <header className="page-hero ai-guide-hero">
        <Link className="text-link" to={site.developmentPath}>
          <ArrowLeft size={15} /> Desenvolvimento
        </Link>
        <span className="eyebrow">SUA PRIMEIRA CONTRIBUIÇÃO COM IA</span>
        <h1>
          Da issue ao PR, <span className="blue-text">com a ajuda da IA.</span>
        </h1>
        <p>
          Conecte o GitHub, escolha uma tarefa e use o ChatGPT ou Codex para ajudar a implementar.
          Você confere a entrega e envia sua contribuição para revisão.
        </p>
        <div className="button-row">
          <a className="button button-primary" href="#conectar">
            Começar pelo passo 1 <ArrowRight size={17} />
          </a>
          <a className="button button-outline" href="#prompt">
            Já configurei: copiar o prompt <Copy size={16} />
          </a>
        </div>
        <p className="ai-guide-meta">Guia para iniciantes · Revisado em {AI_GUIDE_REVIEW_DATE}</p>
      </header>

      <nav className="ai-guide-index" aria-label="Passos para contribuir com IA">
        {aiGuideSteps.map((step, index) => (
          <a key={step.id} href={'#' + step.id}>
            <span aria-hidden="true">0{index + 1}</span> {step.title}
          </a>
        ))}
      </nav>

      <div className="ai-guide-body">
        <section className="ai-guide-step" id="conectar" aria-labelledby="ai-connect-title">
          <span className="ai-step-number" aria-hidden="true">
            01
          </span>
          <div>
            <h2 id="ai-connect-title">Conecte sua conta do GitHub</h2>
            <p>
              Você precisa de uma conta no GitHub e acesso ao ChatGPT ou Codex. Escolha por onde
              começar:
            </p>
            <fieldset className="ai-tool-choice">
              <legend>Onde você vai usar a IA?</legend>
              {[
                { value: 'chatgpt', label: 'ChatGPT' },
                { value: 'codex', label: 'Codex' },
              ].map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name="ai-tool"
                    value={option.value}
                    checked={tool === option.value}
                    onChange={() => setTool(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
            <div className="ai-setup-panel">
              {tool === 'chatgpt' ? (
                <ol>
                  <li>
                    Abra <strong>Plugins</strong> no ChatGPT, procure <strong>GitHub</strong> e
                    instale.
                  </li>
                  <li>
                    Selecione <strong>Conectar</strong>, entre no GitHub e autorize os repositórios
                    que vai usar, incluindo seu fork depois de criá-lo.
                  </li>
                  <li>
                    Abra uma nova conversa e selecione <strong>@GitHub</strong> ao escrever a
                    mensagem.
                  </li>
                </ol>
              ) : (
                <ol>
                  <li>
                    No ChatGPT, abra uma tarefa do Codex em <strong>Work in → Cloud</strong>{' '}
                    (trabalhar na nuvem).
                  </li>
                  <li>
                    Use um ambiente disponível e informe a URL do seu fork. Se a tela pedir conexão
                    com o GitHub, entre na sua conta e autorize esse repositório.
                  </li>
                  <li>
                    Se usar a seleção de repositórios de um ambiente, escolha{' '}
                    <strong>seu fork</strong>. Cole o prompt do passo 4 para começar.
                  </li>
                </ol>
              )}
            </div>
            <p className="ai-guide-note">
              Os menus e recursos podem variar conforme sua conta. Conectar o GitHub dá acesso aos
              repositórios autorizados; para implementar e testar, a sessão também precisa permitir
              edição de arquivos e execução de comandos. Peça à IA para conferir esses acessos antes
              de começar.{' '}
              <a
                href={tool === 'chatgpt' ? aiGuideSources.plugins : aiGuideSources.cloud}
                target="_blank"
                rel="noreferrer"
              >
                Ver configuração oficial <ArrowUpRight size={13} />
              </a>
            </p>
          </div>
        </section>

        <section className="ai-guide-step" id="fork" aria-labelledby="ai-fork-title">
          <span className="ai-step-number" aria-hidden="true">
            02
          </span>
          <div>
            <h2 id="ai-fork-title">Crie e atualize seu fork</h2>
            <p>
              <strong>Fork é uma cópia do projeto na sua conta.</strong> É nela que você vai
              trabalhar.
            </p>
            <ol>
              <li>
                Abra o repositório original no GitHub e clique em{' '}
                <strong>Fork → Create fork</strong>. Se já tem um fork, abra o seu.
              </li>
              <li>
                No seu fork, selecione a branch padrão e clique em{' '}
                <strong>Sync fork → Update branch</strong>, se houver atualizações. Se já estiver
                atualizado, pode seguir.
              </li>
              <li>
                Copie a URL do seu fork. Ela terá seu usuário como dono, por exemplo:{' '}
                <code>github.com/SEU-USUARIO/armadura-struct</code>.
              </li>
            </ol>
            <p className="ai-guide-note">
              Repita a sincronização antes de cada nova tarefa. Se aparecer conflito, peça ajuda à
              IA preservando seus commits. O prompt também pede a atualização da cópia usada na
              implementação.
            </p>
          </div>
        </section>

        <section className="ai-guide-step" id="issue" aria-labelledby="ai-issue-title">
          <span className="ai-step-number" aria-hidden="true">
            03
          </span>
          <div>
            <h2 id="ai-issue-title">Escolha uma issue aberta</h2>
            <p>
              <strong>Issue é a página da tarefa.</strong> Nela estão o pedido, o prompt e os
              critérios que a entrega deve atender.
            </p>
            <ol>
              <li>
                Escolha uma tarefa pequena na Central de Desenvolvimento ou na aba{' '}
                <strong>Issues</strong> do projeto.
              </li>
              <li>
                Leia a descrição e os comentários. Confira se ela está aberta e se ninguém já está
                trabalhando em um PR para a mesma tarefa.
              </li>
              <li>
                Comente que pretende contribuir e copie o link da issue. Você não precisa copiar
                toda a especificação para a conversa.
              </li>
            </ol>
            <Link className="text-link" to={site.developmentPath + '#issues'}>
              Encontrar uma tarefa <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="ai-guide-step" id="prompt" aria-labelledby="ai-prompt-title">
          <span className="ai-step-number" aria-hidden="true">
            04
          </span>
          <div>
            <h2 id="ai-prompt-title">Copie o prompt e comece</h2>
            <p>
              Escolha o projeto e cole os dois links. Ou copie o modelo e substitua os trechos entre
              colchetes antes de enviar à IA.
            </p>
            <div className="ai-prompt-fields">
              <label htmlFor="ai-repository">
                Projeto original
                <select
                  id="ai-repository"
                  value={repository}
                  onChange={(event) => setRepository(event.target.value)}
                >
                  {developmentSources.map((entry) => (
                    <option key={entry.slug} value={entry.slug}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </label>
              <a className="ai-repository-link" href={source.url} target="_blank" rel="noreferrer">
                {source.repository} <ArrowUpRight size={14} />
              </a>
              <label htmlFor="ai-fork-url">
                Link do seu fork
                <input
                  id="ai-fork-url"
                  type="url"
                  value={fork}
                  onChange={(event) => setFork(event.target.value)}
                  placeholder={'https://github.com/SEU-USUARIO/' + source.slug}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(recipe.forkError)}
                  aria-describedby={recipe.forkError ? 'ai-fork-error' : undefined}
                />
              </label>
              {recipe.forkError && (
                <p className="ai-field-error" id="ai-fork-error">
                  {recipe.forkError}
                </p>
              )}
              <label htmlFor="ai-issue-url">
                Link da issue no projeto original
                <input
                  id="ai-issue-url"
                  type="url"
                  value={issue}
                  onChange={(event) => setIssue(event.target.value)}
                  placeholder={source.url + '/issues/NUMERO'}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(recipe.issueError)}
                  aria-describedby={recipe.issueError ? 'ai-issue-error' : undefined}
                />
              </label>
              {recipe.issueError && (
                <p className="ai-field-error" id="ai-issue-error">
                  {recipe.issueError}
                </p>
              )}
              {repository === DEFAULT_AI_REPOSITORY && (
                <p className="ai-guide-note">
                  Exemplo de endereço:{' '}
                  <a
                    href="https://github.com/ricardocorsini/armadura-struct/issues/135"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ArmaduraStruct #135 <ArrowUpRight size={12} />
                  </a>
                  . Confira o estado atual antes de escolher essa tarefa.
                </p>
              )}
            </div>
            <div className="ai-prompt-box">
              <div className="ai-prompt-heading">
                <span>
                  <Sparkles size={17} /> SEU PONTO DE PARTIDA
                </span>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={invalid}
                  onClick={() => void copyPrompt()}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied
                    ? 'Prompt copiado'
                    : recipe.personalized
                      ? 'Copiar meu prompt'
                      : 'Copiar modelo'}
                </button>
              </div>
              <label className="ai-prompt-label" htmlFor="ai-prompt-text">
                Prompt para colar no ChatGPT ou Codex
              </label>
              <textarea
                id="ai-prompt-text"
                ref={promptRef}
                readOnly
                value={recipe.prompt}
                rows={16}
                spellCheck={false}
              />
              <p className="ai-copy-status" role="status">
                {copyResult?.prompt === recipe.prompt
                  ? copyResult.success
                    ? 'Copiado. Cole na conversa com a IA; substitua os trechos entre colchetes, se houver.'
                    : 'Selecionei o texto para você. Use Ctrl+C ou ⌘C para copiar.'
                  : invalid
                    ? 'Confira os links indicados acima para copiar o prompt.'
                    : recipe.personalized
                      ? 'Pronto para copiar. A IA ainda precisa confirmar o fork, o acesso e o estado da issue.'
                      : 'Modelo disponível. Preencha os links ou substitua os campos entre colchetes após copiar.'}
              </p>
            </div>
            <p className="ai-guide-note">
              Os campos apenas montam o texto neste navegador. Este formulário não acessa sua conta
              nem envia contribuições. Autorize o GitHub pela tela oficial; nunca cole senhas ou
              tokens no prompt.
            </p>
          </div>
        </section>

        <section className="ai-guide-step" id="conferir" aria-labelledby="ai-review-title">
          <span className="ai-step-number" aria-hidden="true">
            05
          </span>
          <div>
            <h2 id="ai-review-title">Confira o que a IA entregou</h2>
            <ul className="ai-review-list">
              <li>Compare a mudança com os critérios da issue e revise os arquivos alterados.</li>
              <li>
                Confira os testes executados e suas falhas ou limitações. Quando houver interface,
                abra o aplicativo e experimente o fluxo alterado.
              </li>
              <li>
                Confirme no GitHub que os commits estão na branch do seu fork e incluem somente essa
                tarefa.
              </li>
            </ul>
            <p className="ai-guide-note">
              Se faltar algo, peça o ajuste na mesma conversa. A IA ajuda a desenvolver; sua revisão
              faz parte da contribuição.
            </p>
          </div>
        </section>

        <section className="ai-guide-step" id="pull-request" aria-labelledby="ai-pr-title">
          <span className="ai-step-number" aria-hidden="true">
            06
          </span>
          <div>
            <h2 id="ai-pr-title">Abra o PR manualmente no GitHub</h2>
            <p>
              <strong>Pull request (PR) é o pedido de revisão da sua mudança.</strong> Você ainda
              não está alterando o projeto original.
            </p>
            <ol>
              <li>
                No repositório original, abra{' '}
                <strong>Pull requests → New pull request → compare across forks</strong>. O aviso{' '}
                <strong>Compare &amp; pull request</strong> no seu fork também pode iniciar esse
                caminho.
              </li>
              <li>Confira os destinos abaixo e revise a aba de arquivos alterados.</li>
            </ol>
            <dl className="ai-pr-destinations">
              <div>
                <dt>base repository / base</dt>
                <dd>
                  Projeto original + branch de destino indicada pelo projeto (em geral, a padrão).
                </dd>
              </div>
              <div>
                <dt>head repository / compare</dt>
                <dd>Seu fork + a branch da tarefa que a IA enviou.</dd>
              </div>
            </dl>
            <ol start={3}>
              <li>
                Use o título e a descrição preparados pela IA. Informe a issue, o que mudou e os
                testes feitos. Se a entrega resolver a tarefa, inclua{' '}
                <code>Closes URL_DA_ISSUE</code>.
              </li>
              <li>
                Clique em <strong>Create pull request</strong> quando estiver pronto e acompanhe os
                comentários e as verificações automáticas.
              </li>
            </ol>
            <p>
              Se pedirem ajustes, continue na mesma branch e envie novos commits: eles entram no
              mesmo PR. A integração da contribuição depende da revisão dos mantenedores.
            </p>
            <a
              className="text-link"
              href={source.url + '/compare'}
              target="_blank"
              rel="noreferrer"
            >
              Abrir comparação de {source.name} <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
      </div>

      <section className="ai-guide-help" aria-labelledby="ai-help-title">
        <h2 id="ai-help-title">Travou em alguma etapa?</h2>
        <details>
          <summary>Meu fork não aparece para a IA.</summary>
          <p>
            Confira a conta conectada e quais repositórios ela autorizou. Se criou o fork depois da
            conexão, inclua-o nas permissões do GitHub e inicie uma nova conversa. No Codex, confira
            também o repositório do ambiente.
          </p>
        </details>
        <details>
          <summary>A IA leu a issue, mas não consegue editar ou enviar.</summary>
          <p>
            Peça que identifique a limitação. Para editar e rodar testes, use uma tarefa do Codex
            com acesso ao código e execução de comandos. Para enviar, ela também precisa de
            permissão de escrita no seu fork. Se a etapa continuar indisponível, peça instruções
            para executá-la na sua conta; não compartilhe tokens na conversa.
          </p>
        </details>
        <details>
          <summary>O fork tem conflitos ou o PR mostra arquivos de outras tarefas.</summary>
          <p>
            Peça à IA que confira a base e a branch escolhidas, preservando seu trabalho. Resolva os
            conflitos e confira o diff antes de enviar. Não use uma opção de descartar commits para
            tentar sincronizar.
          </p>
        </details>
        <Link className="text-link" to={CONTRIBUTION_MANUAL_PATH}>
          Consultar o manual geral de colaboração <ArrowRight size={16} />
        </Link>
      </section>
      <aside className="ai-guide-sources" aria-label="Documentação oficial deste guia">
        <p>Configuração conferida na documentação oficial. Se algum menu mudar, consulte:</p>
        <div>
          <a href={aiGuideSources.plugins} target="_blank" rel="noreferrer">
            Plugins do ChatGPT ↗
          </a>
          <a href={aiGuideSources.environments} target="_blank" rel="noreferrer">
            Ambientes do Codex ↗
          </a>
          <a href={aiGuideSources.sync} target="_blank" rel="noreferrer">
            Sincronizar fork ↗
          </a>
          <a href={aiGuideSources.pullRequest} target="_blank" rel="noreferrer">
            Criar PR a partir de fork ↗
          </a>
        </div>
      </aside>
    </div>
  );
}
