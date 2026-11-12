export const issueSkill = {
  name: 'OpenStruct Issue',
  version: '2.0.0',
  filename: 'openstruct-issue-v2.0.0.zip',
  download: '/downloads/skills/openstruct-issue-v2.0.0.zip',
  section: '/development#openstruct-issue',
  bytes: 98397,
  sha256: '104d4b7ed6913c05b7d7743f8536fafe73cadb75c339b8039912b5c279d5eaee',
} as const;

export const skillAgents = {
  claude: {
    label: 'Claude Code',
    command: '/openstruct-issue',
    directory: '~/.claude/skills/openstruct-issue/',
    documentation: 'https://code.claude.com/docs/en/skills',
  },
  codex: {
    label: 'Codex',
    command: '$openstruct-issue',
    directory: '~/.agents/skills/openstruct-issue/',
    documentation: 'https://learn.chatgpt.com/docs/build-skills',
  },
} as const;

export type SkillAgent = keyof typeof skillAgents;

export function skillInstallationPrompt(agent: SkillAgent) {
  const { label, directory, command } = skillAgents[agent];
  return `Instale a skill contida em [caminho do arquivo ${issueSkill.filename}] para meu usuário no ${label}, disponível em todos os meus projetos locais. Verifique a estrutura do ZIP e copie a pasta openstruct-issue completa para ${directory}, com SKILL.md diretamente nessa pasta. Preserve uma instalação existente antes de substituir. Confira git, Git Bash no Windows (ou bash no Linux/macOS) e gh; informe pendências de autenticação e acesso. Confirme como invocar ${command} e como verificar que a skill foi carregada. Não publique nenhuma issue.`;
}

export const skillExamples = [
  {
    id: 'revisar',
    title: 'Revisar uma issue existente',
    description: 'Confira as afirmações no código e os critérios de aceite.',
    request:
      'para revisar a issue [URL], conferir as afirmações no código e tornar os critérios de aceite verificáveis. Mostre o texto corrigido e as mudanças propostas.',
  },
  {
    id: 'calculo',
    title: 'Preparar uma mudança de cálculo',
    description: 'Informe a referência técnica, as unidades e um resultado esperado.',
    request:
      'para especificar [mudança]. A referência é [norma, edição e item], com este trecho: [texto]. Para as entradas [valores e unidades], espero [resultado]. Preserve [comportamento existente].',
  },
  {
    id: 'dividir',
    title: 'Dividir uma demanda e publicar no GitHub',
    description:
      'Organize issues menores, com sequência e dependências. Este prompt pede publicação.',
    request:
      'para dividir [demanda] em issues com resultados verificáveis, ordem e dependências. Publique no GitHub em [dono/repo], usando [branch] como base.',
  },
  {
    id: 'bug',
    title: 'Documentar um bug',
    description: 'Registre como reproduzir o problema e o que deveria acontecer.',
    request:
      'para preparar uma issue sobre este bug: [descrição]. Para reproduzir: [passos]. Resultado atual: [atual]. Esperado: [esperado]. Leia o repositório [dono/repo], em [pasta], usando a branch [branch]. Destino: [dono/repo]. Entregue só o texto.',
  },
  {
    id: 'plano',
    title: 'Transformar um plano em issue',
    description: 'Converta um plano técnico em escopo e tarefas que possam ser validados.',
    request:
      'para transformar o plano de implementação [plano] em uma issue técnica estruturada. Analise o repositório [dono/repo], na branch [branch], valide as premissas relacionadas ao código e defina escopo, tarefas, critérios de aceite verificáveis, riscos e compatibilidade. Entregue o texto para revisão antes da publicação.',
  },
] as const;

export function skillUsagePrompt(agent: SkillAgent, request: string) {
  return `Use ${skillAgents[agent].command} ${request}`;
}

export const skillTips = [
  [
    'Descreva o problema e o resultado esperado',
    'Em bugs, inclua passos de reprodução, comportamento atual e resultado esperado.',
  ],
  [
    'Informe o contexto do repositório',
    'Indique repositório, pasta, branch de base e destino da issue. A skill ainda pede confirmação da origem e do destino.',
  ],
  [
    'Defina a entrega',
    'Peça só o texto ou solicite a publicação no GitHub. Sem pedido explícito de publicação, a entrega é o texto da issue.',
  ],
  [
    'Forneça referências para cálculos',
    'Informe norma, edição, item ou página, unidades e um exemplo com resultado esperado. O código atual não é prova de correção.',
  ],
  [
    'Estabeleça limites de escopo',
    'Diga o que deve ser preservado. Por exemplo: “Preservar a leitura dos projetos antigos”.',
  ],
  [
    'Divida demandas complexas',
    'Peça uma issue principal e issues menores, com resultados verificáveis, ordem de execução e dependências.',
  ],
] as const;
