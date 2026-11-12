# OpenStruct Issue — textos finais da interface

Transcrição da interface implementada, incluindo os dois estados do seletor de agente. Os blocos abaixo preservam o texto integral, inclusive botões. Fonte editável: `src/components/IssueSkill.tsx` e `src/lib/issue-skill.ts`. Não é uma proposta de redação.

## Apresentação e download

```text
FERRAMENTA PARA DESENVOLVEDORES
OpenStruct Issue
v2.0.0

Da demanda à issue, com critérios verificáveis.

Transforme planos, melhorias e bugs em issues técnicas fundamentadas no projeto. A skill orienta seu agente de IA a ler o contexto, revisar premissas e organizar o trabalho para quem vai executar.

Baixar skill
Como instalar

openstruct-issue-v2.0.0.zip · 96 KiB

Testada no Claude Code (Windows) e no Codex.

UMA DEMANDA, UM RESULTADO CLARO

“Quero separar, no quadro de aço, barras de mesmo diâmetro com comprimentos diferentes.”

Agrupar armaduras por diâmetro e comprimento

Resultado esperado
O quadro de aço agrupa somente barras com o mesmo diâmetro e comprimento.

Critério de aceite
Para 4 barras Ø10 mm de 2,00 m e 6 de 3,00 m, exibir duas linhas, com quantidades 4 e 6.

Exemplo ilustrativo de detalhamento de armaduras. A issue completa deve definir escopo, evidências e critérios de aceite.

A skill prepara e revisa issues; não implementa mudanças. Sem pedido de publicação, entrega apenas o texto. Dúvidas que afetam o resultado precisam ser esclarecidas antes da versão pronta.
```

## Instalação e primeiro uso — Claude Code

```text
Instalação e primeiro uso
5 passos

Antes de começar: use Claude Code com acesso aos arquivos e ao terminal. Tenha Git e bash (no Windows, o Git Bash). Para consultar dados do GitHub ou publicar, tenha o GitHub CLI (gh) autenticado e acesso ao repositório.

Baixe a skill

Salve openstruct-issue-v2.0.0.zip no computador em que o agente será executado.

Instale em Claude Code

Informe ao agente o caminho local do ZIP. Se a interface aceitar esse anexo, você também pode enviá-lo na conversa. Substitua o campo entre colchetes no pedido abaixo.

Instale a skill contida em [caminho do arquivo openstruct-issue-v2.0.0.zip] para meu usuário no Claude Code, disponível em todos os meus projetos locais. Verifique a estrutura do ZIP e copie a pasta openstruct-issue completa para ~/.claude/skills/openstruct-issue/, com SKILL.md diretamente nessa pasta. Preserve uma instalação existente antes de substituir. Confira git, Git Bash no Windows (ou bash no Linux/macOS) e gh; informe pendências de autenticação e acesso. Confirme como invocar /openstruct-issue e como verificar que a skill foi carregada. Não publique nenhuma issue.
Copiar prompt

Instalação manual: extraia o ZIP e copie a pasta openstruct-issue inteira para ~/.claude/skills/openstruct-issue/. O arquivo SKILL.md deve ficar diretamente nela, junto de references/ e scripts/. Preserve a versão anterior se já houver uma instalação.

~ é a pasta do seu usuário; no Windows, normalmente C:\Users\SEU-USUARIO. A instalação vale para seus projetos locais nesse ambiente. Reinicie o agente se a skill não aparecer.

Estas instruções são para o Claude Code local. Anexar o ZIP a uma conversa no claude.ai não equivale a instalá-lo nessa pasta. A instalação pessoal não é levada automaticamente para sessões em nuvem.

Skills no Claude Code: documentação oficial
Prepare sua demanda

Escreva o plano, a funcionalidade desejada ou a descrição do bug. Informe repositório, pasta, branch de base, destino da issue e o comportamento que precisa ser preservado.

Execute a skill

Abra o projeto no agente, use /openstruct-issue e acrescente sua demanda. Peça “entregue só o texto” para revisar primeiro. A skill confirma os repositórios e pergunta sobre dúvidas que mudam o resultado.

No Claude Code, o comando é /openstruct-issue. No Codex, a menção é $openstruct-issue; os comandos não são idênticos.

Revise e publique no GitHub

Confira escopo, evidências e critérios de aceite. Quando estiver pronto, peça explicitamente: “Publique esta issue em [dono/repo]”. A publicação exige autenticação e permissões. Em repositório de outro dono, a skill solicita uma confirmação adicional antes de criar a issue.

Limites da v2.0.0: o pacote registra testes no Claude Code com Windows e Git Bash, e o uso no Codex foi confirmado posteriormente. Linux/macOS, upload no claude.ai e publicação real no GitHub seguem sem validação registrada no pacote. Se faltar acesso, esclareça a pendência antes de publicar.
```

## Instalação e primeiro uso — Codex

```text
Instalação e primeiro uso
5 passos

Antes de começar: use Codex com acesso aos arquivos e ao terminal. Tenha Git e bash (no Windows, o Git Bash). Para consultar dados do GitHub ou publicar, tenha o GitHub CLI (gh) autenticado e acesso ao repositório.

Baixe a skill

Salve openstruct-issue-v2.0.0.zip no computador em que o agente será executado.

Instale em Codex

Informe ao agente o caminho local do ZIP. Se a interface aceitar esse anexo, você também pode enviá-lo na conversa. Substitua o campo entre colchetes no pedido abaixo.

Instale a skill contida em [caminho do arquivo openstruct-issue-v2.0.0.zip] para meu usuário no Codex, disponível em todos os meus projetos locais. Verifique a estrutura do ZIP e copie a pasta openstruct-issue completa para ~/.agents/skills/openstruct-issue/, com SKILL.md diretamente nessa pasta. Preserve uma instalação existente antes de substituir. Confira git, Git Bash no Windows (ou bash no Linux/macOS) e gh; informe pendências de autenticação e acesso. Confirme como invocar $openstruct-issue e como verificar que a skill foi carregada. Não publique nenhuma issue.
Copiar prompt

Instalação manual: extraia o ZIP e copie a pasta openstruct-issue inteira para ~/.agents/skills/openstruct-issue/. O arquivo SKILL.md deve ficar diretamente nela, junto de references/ e scripts/. Preserve a versão anterior se já houver uma instalação.

~ é a pasta do seu usuário; no Windows, normalmente C:\Users\SEU-USUARIO. A instalação vale para seus projetos locais nesse ambiente. Reinicie o agente se a skill não aparecer.

O uso da skill também foi confirmado no Codex. No CLI e na extensão, use /skills ou digite $ para localizar a skill. No aplicativo, confira o seletor de skills. A instalação local não configura um ambiente em nuvem.

Skills no Codex: documentação oficial
Prepare sua demanda

Escreva o plano, a funcionalidade desejada ou a descrição do bug. Informe repositório, pasta, branch de base, destino da issue e o comportamento que precisa ser preservado.

Execute a skill

Abra o projeto no agente, use $openstruct-issue e acrescente sua demanda. Peça “entregue só o texto” para revisar primeiro. A skill confirma os repositórios e pergunta sobre dúvidas que mudam o resultado.

No Claude Code, o comando é /openstruct-issue. No Codex, a menção é $openstruct-issue; os comandos não são idênticos.

Revise e publique no GitHub

Confira escopo, evidências e critérios de aceite. Quando estiver pronto, peça explicitamente: “Publique esta issue em [dono/repo]”. A publicação exige autenticação e permissões. Em repositório de outro dono, a skill solicita uma confirmação adicional antes de criar a issue.

Limites da v2.0.0: o pacote registra testes no Claude Code com Windows e Git Bash, e o uso no Codex foi confirmado posteriormente. Linux/macOS, upload no claude.ai e publicação real no GitHub seguem sem validação registrada no pacote. Se faltar acesso, esclareça a pendência antes de publicar.
```

## Exemplos — Claude Code

```text
Exemplos de uso
5 prompts para copiar

Prompts para Claude Code. Substitua os campos entre colchetes pelo contexto do seu projeto antes de enviar.

Revisar uma issue existente

Confira as afirmações no código e os critérios de aceite.

Use /openstruct-issue para revisar a issue [URL], conferir as afirmações no código e tornar os critérios de aceite verificáveis. Mostre o texto corrigido e as mudanças propostas.
Copiar prompt
Preparar uma mudança de cálculo

Informe a referência técnica, as unidades e um resultado esperado.

Use /openstruct-issue para especificar [mudança]. A referência é [norma, edição e item], com este trecho: [texto]. Para as entradas [valores e unidades], espero [resultado]. Preserve [comportamento existente].
Copiar prompt
Dividir uma demanda e publicar no GitHub

Organize issues menores, com sequência e dependências. Este prompt pede publicação.

Use /openstruct-issue para dividir [demanda] em issues com resultados verificáveis, ordem e dependências. Publique no GitHub em [dono/repo], usando [branch] como base.
Copiar prompt
Documentar um bug

Registre como reproduzir o problema e o que deveria acontecer.

Use /openstruct-issue para preparar uma issue sobre este bug: [descrição]. Para reproduzir: [passos]. Resultado atual: [atual]. Esperado: [esperado]. Leia o repositório [dono/repo], em [pasta], usando a branch [branch]. Destino: [dono/repo]. Entregue só o texto.
Copiar prompt
Transformar um plano em issue

Converta um plano técnico em escopo e tarefas que possam ser validados.

Use /openstruct-issue para transformar o plano de implementação [plano] em uma issue técnica estruturada. Analise o repositório [dono/repo], na branch [branch], valide as premissas relacionadas ao código e defina escopo, tarefas, critérios de aceite verificáveis, riscos e compatibilidade. Entregue o texto para revisão antes da publicação.
Copiar prompt
```

## Exemplos — Codex

```text
Exemplos de uso
5 prompts para copiar

Prompts para Codex. Substitua os campos entre colchetes pelo contexto do seu projeto antes de enviar.

Revisar uma issue existente

Confira as afirmações no código e os critérios de aceite.

Use $openstruct-issue para revisar a issue [URL], conferir as afirmações no código e tornar os critérios de aceite verificáveis. Mostre o texto corrigido e as mudanças propostas.
Copiar prompt
Preparar uma mudança de cálculo

Informe a referência técnica, as unidades e um resultado esperado.

Use $openstruct-issue para especificar [mudança]. A referência é [norma, edição e item], com este trecho: [texto]. Para as entradas [valores e unidades], espero [resultado]. Preserve [comportamento existente].
Copiar prompt
Dividir uma demanda e publicar no GitHub

Organize issues menores, com sequência e dependências. Este prompt pede publicação.

Use $openstruct-issue para dividir [demanda] em issues com resultados verificáveis, ordem e dependências. Publique no GitHub em [dono/repo], usando [branch] como base.
Copiar prompt
Documentar um bug

Registre como reproduzir o problema e o que deveria acontecer.

Use $openstruct-issue para preparar uma issue sobre este bug: [descrição]. Para reproduzir: [passos]. Resultado atual: [atual]. Esperado: [esperado]. Leia o repositório [dono/repo], em [pasta], usando a branch [branch]. Destino: [dono/repo]. Entregue só o texto.
Copiar prompt
Transformar um plano em issue

Converta um plano técnico em escopo e tarefas que possam ser validados.

Use $openstruct-issue para transformar o plano de implementação [plano] em uma issue técnica estruturada. Analise o repositório [dono/repo], na branch [branch], valide as premissas relacionadas ao código e defina escopo, tarefas, critérios de aceite verificáveis, riscos e compatibilidade. Entregue o texto para revisão antes da publicação.
Copiar prompt
```

## Dicas

```text
Dicas para criar boas issues
Contexto que faz diferença
Descreva o problema e o resultado esperado

Em bugs, inclua passos de reprodução, comportamento atual e resultado esperado.

Informe o contexto do repositório

Indique repositório, pasta, branch de base e destino da issue. A skill ainda pede confirmação da origem e do destino.

Defina a entrega

Peça só o texto ou solicite a publicação no GitHub. Sem pedido explícito de publicação, a entrega é o texto da issue.

Forneça referências para cálculos

Informe norma, edição, item ou página, unidades e um exemplo com resultado esperado. O código atual não é prova de correção.

Estabeleça limites de escopo

Diga o que deve ser preservado. Por exemplo: “Preservar a leitura dos projetos antigos”.

Divida demandas complexas

Peça uma issue principal e issues menores, com resultados verificáveis, ordem de execução e dependências.

Em issues públicas, use apenas informações que podem ser compartilhadas. Não inclua segredos, dados privados ou trechos de normas pagas.
```

## Feedback das interações

- Sucesso: “Copiado. Cole na conversa com o agente.” Botão: “Copiado”, retornando a “Copiar prompt” após três segundos.
- Falha: “Cópia automática indisponível. Texto selecionado: use Ctrl+C, ⌘C ou o menu de copiar.”
- Seletor: “Preparar instruções e prompts para”, com Claude Code e Codex. A invocação exibida e os prompts acompanham a escolha.
- Link no topo da central: “Preparar issues com IA”.
- Documentação: “OpenStruct Issue: prepare issues com IA”; ação “Baixar a skill e aprender a usar”.
- Guia de contribuição: “Sua demanda ainda não tem uma issue? Prepare o texto com a skill OpenStruct Issue”.
