import type { DevelopmentSource } from './development.ts';

export const AI_CONTRIBUTION_PATH = '/development/contribuir-com-ia';
export const AI_GUIDE_REVIEW_DATE = '11/11/2026';
export const DEFAULT_AI_REPOSITORY = 'armadura-struct';

export const aiGuideSources = {
  plugins: 'https://learn.chatgpt.com/docs/plugins',
  cloud: 'https://learn.chatgpt.com/docs/cloud',
  environments: 'https://learn.chatgpt.com/docs/environments/cloud-environments',
  sync: 'https://docs.github.com/pt/pull-requests/how-tos/work-with-forks/syncing-a-fork',
  pullRequest:
    'https://docs.github.com/pt/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork',
};

export const aiGuideSteps = [
  { id: 'conectar', title: 'Conecte o GitHub' },
  { id: 'fork', title: 'Crie e atualize seu fork' },
  { id: 'issue', title: 'Escolha uma issue' },
  { id: 'prompt', title: 'Copie o prompt' },
  { id: 'conferir', title: 'Confira a entrega' },
  { id: 'pull-request', title: 'Abra o PR no GitHub' },
] as const;

function githubUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol === 'https:' &&
      url.hostname === 'github.com' &&
      !url.port &&
      !url.username &&
      !url.password
    )
      return url;
  } catch {
    // A pasted address is validated locally; no GitHub request is made here.
  }
  return undefined;
}

/** Validate destinations without assuming repository access, fork ancestry or issue state. */
export function contributionPrompt(
  source: Pick<DevelopmentSource, 'url' | 'repository'>,
  forkValue: string,
  issueValue: string,
) {
  const fork = githubUrl(forkValue);
  const forkPath = fork?.pathname.match(/^\/([a-z\d-]+)\/([a-z\d_.-]+)\/?$/i);
  const forkName = forkPath?.[2].replace(/\.git$/i, '');
  const forkRepository =
    forkPath && forkName && !/^\.+$/.test(forkName) ? forkPath[1] + '/' + forkName : '';
  const forkUrl =
    forkRepository && forkRepository.toLowerCase() !== source.repository.toLowerCase()
      ? 'https://github.com/' + forkRepository
      : '';
  const issue = githubUrl(issueValue);
  const issuePath = issue?.pathname.match(/^\/([^/]+)\/([^/]+)\/issues\/([1-9]\d*)\/?$/);
  const issueUrl =
    issuePath &&
    (issuePath[1] + '/' + issuePath[2]).toLowerCase() === source.repository.toLowerCase()
      ? source.url + '/issues/' + issuePath[3]
      : '';
  const forkError =
    forkValue.trim() && !forkUrl
      ? 'Cole a URL HTTPS do seu fork no GitHub, diferente do repositório original.'
      : '';
  const issueError =
    issueValue.trim() && !issueUrl
      ? 'Cole o link de uma issue do projeto selecionado: ' + source.url + '/issues/NUMERO.'
      : '';
  const prompt = `Vou fazer uma contribuição no OpenStruct com sua ajuda.

Repositório original: ${source.url}
Meu fork: ${forkUrl || '[URL_DO_SEU_FORK]'}
Issue com a tarefa: ${issueUrl || '[URL_DA_ISSUE_ABERTA]'}

Quero implementar a tarefa, enviar os commits para uma nova branch no MEU FORK e abrir o pull request manualmente no GitHub.

1. Confirme que consegue ler o original, meu fork e a issue completa, incluindo comentários e critérios de aceite. Verifique se meu repositório é um fork do original, se a issue continua aberta e se já existe implementação ou PR equivalente. Se a tarefa já estiver resolvida ou em andamento, avise antes de duplicar o trabalho.

2. Leia as instruções atuais do projeto (README, CONTRIBUTING e AGENTS.md, quando existirem). Identifique a branch padrão real do original, sem presumir main ou master. Antes de implementar, sincronize a branch base do meu fork com o original e atualize a cópia de trabalho. Preserve minhas alterações e commits; se houver conflito, explique como resolvê-lo sem descartar trabalho. Crie uma branch nova para esta issue a partir dessa base atualizada.

3. Execute a especificação da issue no código atual. Reaproveite o que já existe, implemente somente a lacuna e confira cada critério de aceite. Prepare o ambiente conforme o guia do projeto e execute os testes e verificações pertinentes, inclusive os pedidos na issue. Diferencie testes executados, falhas e verificações que não conseguiu realizar.

4. Revise o diff e inclua apenas arquivos da tarefa. Use a identidade Git configurada para minha contribuição. Faça commit e push somente na branch do meu fork. Não envie para o original, não force o histórico e não publique versão ou release.

5. Entregue um resumo do que mudou, critérios atendidos e pendências, verificações com resultados reais, branch e link dos commits enviados. Prepare um título e uma descrição de PR com referência à issue, mas deixe a abertura e a mesclagem do PR para mim.

Execute as etapas que suas ferramentas e permissões permitirem. Se faltar acesso para editar, testar ou enviar, diga exatamente qual etapa depende de mim e me dê instruções simples. Não afirme ter executado uma ação que não realizou.`;

  return {
    forkUrl,
    issueUrl,
    forkError,
    issueError,
    prompt,
    personalized: Boolean(forkUrl && issueUrl),
  };
}
