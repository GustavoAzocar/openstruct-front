import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, ArrowUpRight, FileCheck2 } from 'lucide-react';
import {
  issueSkill,
  skillAgents,
  skillExamples,
  skillInstallationPrompt,
  skillTips,
  skillUsagePrompt,
} from '../lib/issue-skill';
import type { SkillAgent } from '../lib/issue-skill';
import './issue-skill.css';

function CopyPrompt({ text, label }: { text: string; label: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const textRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (status !== 'copied') return;
    const timeout = window.setTimeout(() => setStatus('idle'), 3000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      const element = textRef.current;
      if (element) {
        element.focus();
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setStatus('manual');
    }
  }

  return (
    <div className="issue-skill-prompt">
      <pre ref={textRef} tabIndex={-1} aria-label={label}>
        <code>{text}</code>
      </pre>
      <div className="issue-skill-copy-row">
        <span role="status">
          {status === 'copied'
            ? 'Copiado. Cole na conversa com o agente.'
            : status === 'manual'
              ? 'Cópia automática indisponível. Texto selecionado: use Ctrl+C, ⌘C ou o menu de copiar.'
              : ''}
        </span>
        <button
          type="button"
          className="button button-outline"
          onClick={() => void copy()}
          aria-label={`Copiar prompt: ${label}`}
        >
          {status === 'copied' ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <Copy size={15} aria-hidden="true" />
          )}
          {status === 'copied' ? 'Copiado' : 'Copiar prompt'}
        </button>
      </div>
    </div>
  );
}

export function IssueSkill() {
  const [agent, setAgent] = useState<SkillAgent>('claude');
  const installationRef = useRef<HTMLDetailsElement>(null);
  const selectedAgent = skillAgents[agent];

  function showInstallation() {
    if (!installationRef.current) return;
    installationRef.current.open = true;
    installationRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    installationRef.current.querySelector('summary')?.focus({ preventScroll: true });
  }

  return (
    <section className="issue-skill" id="openstruct-issue" aria-labelledby="issue-skill-title">
      <div className="issue-skill-overview">
        <div>
          <span className="eyebrow">FERRAMENTA PARA DESENVOLVEDORES</span>
          <div className="issue-skill-title-row">
            <h2 id="issue-skill-title">{issueSkill.name}</h2>
            <span className="issue-skill-version">v{issueSkill.version}</span>
          </div>
          <p className="issue-skill-lead">Da demanda à issue, com critérios verificáveis.</p>
          <p>
            Transforme planos, melhorias e bugs em issues técnicas fundamentadas no projeto. A skill
            orienta seu agente de IA a ler o contexto, revisar premissas e organizar o trabalho para
            quem vai executar.
          </p>
          <div className="button-row">
            <a
              className="button button-primary"
              href={issueSkill.download}
              download={issueSkill.filename}
            >
              <Download size={17} aria-hidden="true" /> Baixar skill
            </a>
            <button type="button" className="button button-outline" onClick={showInstallation}>
              Como instalar
            </button>
          </div>
          <p className="issue-skill-file">
            {issueSkill.filename} · {Math.round(issueSkill.bytes / 1024)} KiB
          </p>
          <p className="issue-skill-compatibility">Testada no Claude Code (Windows) e no Codex.</p>
        </div>
        <aside className="issue-skill-preview" aria-label="Exemplo de detalhamento de armaduras">
          <span className="issue-skill-kicker">
            <FileCheck2 size={17} aria-hidden="true" /> UMA DEMANDA, UM RESULTADO CLARO
          </span>
          <p className="issue-skill-quote">
            “Quero separar, no quadro de aço, barras de mesmo diâmetro com comprimentos diferentes.”
          </p>
          <div className="issue-skill-output">
            <h3>Agrupar armaduras por diâmetro e comprimento</h3>
            <p>
              <strong>Resultado esperado</strong>
              <br />O quadro de aço agrupa somente barras com o mesmo diâmetro e comprimento.
            </p>
            <p>
              <strong>Critério de aceite</strong>
              <br />
              Para 4 barras Ø10 mm de 2,00 m e 6 de 3,00 m, exibir duas linhas, com quantidades 4 e
              6.
            </p>
          </div>
          <small>
            Exemplo ilustrativo de detalhamento de armaduras. A issue completa deve definir escopo,
            evidências e critérios de aceite.
          </small>
        </aside>
      </div>

      <p className="issue-skill-boundary">
        A skill prepara e revisa issues; não implementa mudanças. Sem pedido de publicação, entrega
        apenas o texto. Dúvidas que afetam o resultado precisam ser esclarecidas antes da versão
        pronta.
      </p>

      <div className="issue-skill-agent">
        <label htmlFor="issue-skill-agent">Preparar instruções e prompts para</label>
        <select
          id="issue-skill-agent"
          value={agent}
          onChange={(event) => setAgent(event.target.value as SkillAgent)}
        >
          {Object.entries(skillAgents).map(([value, entry]) => (
            <option key={value} value={value}>
              {entry.label}
            </option>
          ))}
        </select>
        <span>
          Invocação: <code>{selectedAgent.command}</code>
        </span>
      </div>

      <details className="issue-skill-details" ref={installationRef}>
        <summary>
          <span>Instalação e primeiro uso</span>
          <small>5 passos</small>
        </summary>
        <div className="issue-skill-detail-body">
          <p className="issue-skill-note">
            <strong>Antes de começar:</strong> use {selectedAgent.label} com acesso aos arquivos e
            ao terminal. Tenha Git e bash (no Windows, o Git Bash). Para consultar dados do GitHub
            ou publicar, tenha o GitHub CLI (<code>gh</code>) autenticado e acesso ao repositório.
          </p>
          <ol className="issue-skill-steps">
            <li>
              <h3>Baixe a skill</h3>
              <p>
                Salve{' '}
                <a href={issueSkill.download} download={issueSkill.filename}>
                  {issueSkill.filename}
                </a>{' '}
                no computador em que o agente será executado.
              </p>
            </li>
            <li>
              <h3>Instale em {selectedAgent.label}</h3>
              <p>
                Informe ao agente o caminho local do ZIP. Se a interface aceitar esse anexo, você
                também pode enviá-lo na conversa. Substitua o campo entre colchetes no pedido
                abaixo.
              </p>
              <CopyPrompt
                key={agent + '-install'}
                label={`Instalar no ${selectedAgent.label}`}
                text={skillInstallationPrompt(agent)}
              />
              <p>
                <strong>Instalação manual:</strong> extraia o ZIP e copie a pasta{' '}
                <code>openstruct-issue</code> inteira para <code>{selectedAgent.directory}</code>. O
                arquivo <code>SKILL.md</code> deve ficar diretamente nela, junto de{' '}
                <code>references/</code> e <code>scripts/</code>. Preserve a versão anterior se já
                houver uma instalação.
              </p>
              <p>
                <code>~</code> é a pasta do seu usuário; no Windows, normalmente{' '}
                <code>C:\Users\SEU-USUARIO</code>. A instalação vale para seus projetos locais nesse
                ambiente. Reinicie o agente se a skill não aparecer.
              </p>
              {agent === 'claude' ? (
                <p>
                  Estas instruções são para o <strong>Claude Code local</strong>. Anexar o ZIP a uma
                  conversa no claude.ai não equivale a instalá-lo nessa pasta. A instalação pessoal
                  não é levada automaticamente para sessões em nuvem.
                </p>
              ) : (
                <p>
                  O uso da skill também foi confirmado no Codex. No CLI e na extensão, use{' '}
                  <code>/skills</code> ou digite <code>$</code> para localizar a skill. No
                  aplicativo, confira o seletor de skills. A instalação local não configura um
                  ambiente em nuvem.
                </p>
              )}
              <a
                className="text-link"
                href={selectedAgent.documentation}
                target="_blank"
                rel="noreferrer"
              >
                Skills no {selectedAgent.label}: documentação oficial{' '}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </li>
            <li>
              <h3>Prepare sua demanda</h3>
              <p>
                Escreva o plano, a funcionalidade desejada ou a descrição do bug. Informe
                repositório, pasta, branch de base, destino da issue e o comportamento que precisa
                ser preservado.
              </p>
            </li>
            <li>
              <h3>Execute a skill</h3>
              <p>
                Abra o projeto no agente, use <code>{selectedAgent.command}</code> e acrescente sua
                demanda. Peça “entregue só o texto” para revisar primeiro. A skill confirma os
                repositórios e pergunta sobre dúvidas que mudam o resultado.
              </p>
              <p>
                No Claude Code, o comando é <code>/openstruct-issue</code>. No Codex, a menção é{' '}
                <code>$openstruct-issue</code>; os comandos não são idênticos.
              </p>
            </li>
            <li>
              <h3>Revise e publique no GitHub</h3>
              <p>
                Confira escopo, evidências e critérios de aceite. Quando estiver pronto, peça
                explicitamente: “Publique esta issue em [dono/repo]”. A publicação exige
                autenticação e permissões. Em repositório de outro dono, a skill solicita uma
                confirmação adicional antes de criar a issue.
              </p>
            </li>
          </ol>
          <p className="issue-skill-note">
            Limites da v{issueSkill.version}: o pacote registra testes no Claude Code com Windows e
            Git Bash, e o uso no Codex foi confirmado posteriormente. Linux/macOS, upload no
            claude.ai e publicação real no GitHub seguem sem validação registrada no pacote. Se
            faltar acesso, esclareça a pendência antes de publicar.
          </p>
        </div>
      </details>

      <details className="issue-skill-details">
        <summary>
          <span>Exemplos de uso</span>
          <small>5 prompts para copiar</small>
        </summary>
        <div className="issue-skill-detail-body">
          <p>
            Prompts para <strong>{selectedAgent.label}</strong>. Substitua os campos entre colchetes
            pelo contexto do seu projeto antes de enviar.
          </p>
          <div className="issue-skill-examples">
            {skillExamples.map((example) => (
              <article key={example.id} aria-labelledby={`skill-example-${example.id}`}>
                <h3 id={`skill-example-${example.id}`}>{example.title}</h3>
                <p>{example.description}</p>
                <CopyPrompt
                  key={agent + example.id}
                  label={example.title}
                  text={skillUsagePrompt(agent, example.request)}
                />
              </article>
            ))}
          </div>
        </div>
      </details>

      <details className="issue-skill-details">
        <summary>
          <span>Dicas para criar boas issues</span>
          <small>Contexto que faz diferença</small>
        </summary>
        <div className="issue-skill-detail-body">
          <ul className="issue-skill-tips">
            {skillTips.map(([title, description]) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ul>
          <p className="issue-skill-note">
            Em issues públicas, use apenas informações que podem ser compartilhadas. Não inclua
            segredos, dados privados ou trechos de normas pagas.
          </p>
        </div>
      </details>
    </section>
  );
}
