# Créditos públicos — OSF-24

Revisão em 09/11/2026, base `76cdc5a762c5cc37e7d13e0896e3a3b2e3a66e66`.
OSF-17 já coleta até 60 contribuidores por repositório autorizado. A Comunidade
reaproveita esse snapshot, sem nova consulta REST por visitante ou coleta de perfis.

`contributorsView` deduplica logins sem distinguir maiúsculas e mantém associações
por repositório, com data e indicação de dado antigo. A ordem é alfabética; não
expõe quantidade de commits, pontuação ou ranking. Site e hub são identificados
como fontes de infraestrutura, distintos dos aplicativos. O Launcher privado não
é consultado. Perfis sem URL GitHub correspondente não entram.

O coletor aceita somente `type=User`, sem anônimos; a vitrine também recusa sufixos
de bot e nomes de automações explicitamente conhecidos. O GitHub associa parte das
contribuições por commits e pode retornar dados em cache. Esta lista não comprova
ausência de colaboração fora dos commits ou contas não associadas. Recortes, falhas
e datas são visíveis. Não se coletam nome civil, e-mail, localização ou atividade
privada.

## Fotos e associação por aplicativo

ConsoloStruct, MolaStruct e ArmaduraStruct incluem a seção `#contribuidores`,
restrita ao repositório público do próprio aplicativo. A Comunidade permite escolher
qualquer uma das cinco fontes autorizadas; `contributorsRepo` na URL preserva a
seleção e o histórico Voltar/Avançar. Créditos editoriais obedecem ao mesmo filtro.

A foto pública usa o endereço canônico `https://github.com/LOGIN.png?size=96`,
somente depois da validação do login. Não é necessária uma consulta REST de perfil
por visitante, mudança de esquema ou credencial no frontend. As imagens são
carregadas diretamente do GitHub, sem referer, com dimensões definidas e lazy
loading. Quando falham, iniciais substituem a foto; login e link continuam legíveis.
A imagem é decorativa para tecnologias assistivas porque o perfil já tem rótulo.
Fotos seguem o cache/disponibilidade do GitHub, separadamente da coleta
aproximadamente horária dos contribuidores. Não se promete atualização instantânea.

## Créditos editoriais

`editorialCredits` começa vazio. Para incluir documentação, testes ou design:

1. Conferir uma atribuição pública ou autorização documentada no repositório correto.
2. Registrar login, repositório público autorizado, descrição curta, URL da evidência,
   fundamento (`public-credit` ou `recorded-permission`) e data da revisão.
3. Revisar a evidência manualmente: validação de formato não comprova autorização.
4. Manter o crédito na categoria editorial; não transformá-lo em commit ou associá-lo
   a aplicativos sem evidência. Dados pessoais e provas privadas não entram no site.

O validador rejeita fonte externa, repo privado, bot, duplicata e descrição com e-mail.
Não foram criados créditos para demonstrar a interface. Na coleta revisada existe
um login, reconhecido nos cinco repositórios; a deduplicação de pessoas e créditos
adicionais também é protegida por fixtures de testes.

Validação: testes de associação/deduplicação, bots, origem, estado antigo e créditos;
build e conferência desktop/largura móvel simulada em ambos os temas.
