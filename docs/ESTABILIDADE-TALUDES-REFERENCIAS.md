# Relatório da issue #29 — referências primárias para estabilidade de taludes

Relatório de Gustavo Azocar, entregue na [issue #29](https://github.com/ricardocorsini/openstruct-front/issues/29#issuecomment-6840010781) e aprovado no [aceite técnico registrado na própria issue](https://github.com/ricardocorsini/openstruct-front/issues/29#issuecomment-6840163130), para orientar a especificação da #30. O aceite é da seleção bibliográfica; não representa aprovação de fórmulas, critérios de segurança ou de um solver.

## 1. Recorte pesquisado

Análise determinística 2D por equilíbrio-limite, superfícies circulares, resistência de Mohr–Coulomb, estratos, nível d'água, sobrecarga distribuída, Fellenius como referência, Bishop Simplificado como método principal, busca da superfície crítica, convergência e exemplos numéricos.

Não foram pesquisados como requisitos do MVP: contenções, reforços, superfícies não circulares, métodos rigorosos adicionais, FEM, 3D, probabilidade ou fluxo hidráulico numérico.

## 2. Fontes candidatas e condição de acesso

As menções a exemplares locais consultados referem-se aos materiais informados pelo autor na entrega original. Livros e norma são citados por metadados e localização: este relatório não concede licença para redistribuir seus textos, figuras, tabelas ou arquivos digitalizados. Nenhum desses exemplares é anexado ao repositório. A publicação de conteúdo protegido exige a autorização aplicável; o acesso público a um catálogo ou sumário não libera o texto integral.

| ID  | Referência                                                                                                                                                     | Localização relevante                                                                                                                      | Acesso e reprodução                                                                                                                                                                                      | Classificação proposta                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| F1  | Duncan, J. Michael, Stephen G. Wright e Thomas L. Brandon. _Soil Strength and Slope Stability_. 2ª ed. Wiley, 2014. ISBN 978-1-118-65165-0.                    | Caps. 3, 5 e 6. §6.5, pp. 87–93. §6.13, pp. 116–123. Cap. 7, §§7.5–7.7, pp. 130–158.                                                       | Exemplar local consultado. A citação pública identifica a edição e as páginas. [Wiley](https://www.wiley.com/en-gb/soil-strength-and-slope-stability-2nd-edition-p-9781118651650)                        | **Referência técnica principal** para cálculo, água, busca e verificação.                         |
| F2  | U.S. Army Corps of Engineers. _Slope Stability_. Engineer Manual EM 1110-2-1902, 31 out. 2003.                                                                 | Apêndice C. §C-1, pp. C-1–C-12. §C-2, pp. C-12–C-16. §C-3, pp. C-16–C-18. §C-10, pp. C-33–C-38.                                            | Documento oficial de acesso público, conferido em exemplar local. [USACE](https://www.publications.usace.army.mil/Portals/76/Publications/EngineerManuals/EM_1110-2-1902.pdf)                            | **Referência técnica pública** para auditoria de hipóteses, busca, limitações e falhas numéricas. |
| F3  | Alan W. Bishop. “The Use of the Slip Circle in the Stability Analysis of Slopes.” _Géotechnique_, v. 5, n. 1, 1955, pp. 7–17. DOI 10.1680/geot.1955.5.1.7.     | Artigo, pp. 7–17.                                                                                                                          | Metadados conferidos. A consulta ao texto integral fica para a #30. [DOI](https://doi.org/10.1680/geot.1955.5.1.7)                                                                                       | **Fonte original** de Bishop, com conferência durante a #30.                                      |
| F4  | Faiçal Massad. _Obras de Terra: curso básico de geotecnia — com exercícios resolvidos_. 2ª ed. Oficina de Textos, 2010. ISBN 978-85-86238-97-0.                | Cap. 3, especialmente pp. 63–77. §3.2, Fellenius, p. 68 em diante. §3.3, Bishop Simplificado, p. 69 em diante.                             | Exemplar local consultado. Citação bibliográfica e localização. [Oficina de Textos](https://www.ofitexto.com.br/obras-de-terra-2-edicao/p)                                                               | **Apoio técnico em português** e comparação de convenções.                                        |
| F5  | Braja M. Das e Khaled Sobhan. _Fundamentos de Engenharia Geotécnica_. Tradução brasileira da 8ª ed. Cengage Learning, 2014. ISBN 978-85-221-1824-3.            | Cap. 15. §15.11, método comum de fatias, pp. 508–514. §15.12, Bishop Simplificado, p. 515. §15.13, percolação constante, p. 516 em diante. | Exemplar local escaneado. Metadados e localizações conferidos na ficha catalográfica e no sumário. Citação bibliográfica e localização.                                                                  | **Apoio alinhado ao módulo EG010**, que cita a 6ª e a 8ª edições.                                 |
| F6  | R. F. Craig. _Craig’s Soil Mechanics_. 7ª ed. Spon Press/Taylor & Francis, 2004. ISBN 0-415-32702-4 (capa dura), 0-415-32703-2 (brochura).                     | Cap. 9, §9.3, pp. 351–357. Fellenius, pp. 353–354. Bishop, pp. 354–356. Exemplo 9.2, pp. 355–357.                                          | Exemplar local consultado. Citação bibliográfica e localização.                                                                                                                                          | **Apoio independente** e candidato a exemplo manual de Fellenius.                                 |
| F7  | Wolmar Fellenius. “Calculation of the Stability of Earth Dams.” _Transactions, Second Congress on Large Dams_, v. 4, 1936.                                     | Apêndice A do USACE EM 1110-2-1902, que indica pp. 445–459. A paginação do trabalho original ainda precisa ser conferida.                  | Consulta indireta pelo manual público. Acesso ao original pendente.                                                                                                                                      | **Proveniência histórica**.                                                                       |
| F8  | Associação Brasileira de Normas Técnicas. _ABNT NBR 11682:2009 — Estabilidade de encostas_. 2ª ed. Rio de Janeiro: ABNT, 21 ago. 2009. ISBN 978-85-07-01702-8. | §1, p. 1. §7.3.6, p. 16. §7.3.7, p. 17 em diante.                                                                                          | Metadados e itens conferidos no exemplar indicado pelo solicitante. A citação pública inclui a referência e os itens. [Catálogo DIN Media](https://www.dinmedia.de/en/standard/abnt-nbr-11682/180813697) | **Referência normativa brasileira** para estudo posterior dos critérios de projeto e segurança.   |

## 3. Referências efetivamente usadas no módulo EG010

O plano de aula cita Anderson & Richards (1987), Cruden & Varnes (1996), Griffiths & Lane (1999), Guidicini & Nieble (1983), Lacerda (1997), Lambe & Whitman (1979), ABNT NBR 11682:1991, Joppert Júnior (2007), Moliterno (1980) e publicação da Tecnosolo (1992).

A aula “A3 — Métodos de cálculo” cita expressamente Braja M. Das, 6ª e 8ª edições, e P. T. da Cruz, _100 Barragens Brasileiras_. Entre essas referências, Das é a fonte do módulo com aderência direta ao recorte Fellenius/Bishop. Slides, planilhas e exercícios do curso permanecem evidência didática secundária.

## 4. Matriz tema × fonte

| Tema                                                            | Referência principal                                                             | Apoio                                                 | Situação e decisão necessária                                                                                                    |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Mohr–Coulomb, tensões totais/efetivas e propriedades por camada | F1, caps. 3, 5 e 6; F2, §C-1                                                     | F4, cap. 3; F5, cap. 15                               | Cobertura suficiente. A especificação deve fixar símbolos, unidades e regra de atribuição em interfaces.                         |
| Fellenius / Ordinary Method of Slices                           | F2, §C-2; F1, §6.5.1                                                             | F4, §3.2; F5, §15.11; F6, §9.3; F7 como proveniência  | Cobertura suficiente. Manter como método de referência, não método principal.                                                    |
| Bishop Simplificado                                             | F3, após acesso legal; F1, §6.5; F2, §C-3                                        | F4, §3.3; F5, §15.12; F6, §9.3                        | Cobertura suficiente para iniciar a formalização com F1/F2; conferir F3 antes de declarar rastreabilidade à publicação original. |
| Pressão neutra e nível d'água                                   | F1, §6.13; F2, §§C-1 a C-3                                                       | F5, §15.13; F6, §9.3                                  | Há várias representações possíveis. Para o MVP, a equipe deve confirmar nível/freática e pressão por fatia, sem fluxo numérico.  |
| Sobrecarga distribuída                                          | F2, §C-1a. F1, §6.5.3, pp. 91–93, fig. 6.12.                                     | F4, caps. 3 e 4                                       | A #30 deve explicitar a conversão em força por fatia e o ponto de aplicação.                                                     |
| Busca de círculos críticos                                      | F2, §C-1g, pp. C-8–C-12. F1, §7.5, pp. 130–132.                                  | F5, §§15.7–15.10                                      | As fontes descrevem várias estratégias. A escolha fica para revisão técnica na #30.                                              |
| Convergência e falhas numéricas                                 | F2, §C-10d/e, pp. C-37–C-38. F1, §§6.5 e 7.5.                                    | F6, §9.3                                              | A #30 deve justificar a tolerância e o limite de iterações adotados.                                                             |
| Exemplos independentes                                          | F2, §F-5a–d, pp. F-19–F-21. F1, §7.7, pp. 134–158. F6, exemplo 9.2, pp. 355–357. | Exercícios de F4/F5 e planilhas EG010 para comparação | A #31 pode usar dados autorizados ou preparar casos próprios rastreados às fontes.                                               |
| Contexto normativo brasileiro                                   | F8, §§7.3.6–7.3.7                                                                | —                                                     | A aplicação dos critérios normativos de segurança foi reservada para análise específica.                                         |

## 5. Exemplos numéricos candidatos

1. **Fellenius.** Craig, exemplo 9.2, pp. 355–357. Traz geometria, divisão em fatias, pressão neutra, tabela de parcelas e fator de segurança. É candidato a conferência manual independente.
2. **Bishop Simplificado.** USACE, §F-5a–d, pp. F-19–F-21, figs. F-10 e F-11. Exemplo público de fim de construção, com dois materiais em condição não drenada e parâmetros em tensões totais. Traz dados por fatia, etapas da iteração e fator de segurança publicado de **1,33** (§F-5d), sem recálculo nesta entrega.
3. **Fellenius e Bishop no mesmo problema.** Duncan–Wright–Brandon, exemplo 4, pp. 142–144, figs. 7.18–7.20 e tabela 7.5. Traz geometria e propriedades, cálculo manual pelo método ordinário e resultados comparativos para Bishop.
4. **Conjunto ampliado de verificação.** Duncan–Wright–Brandon, §7.7, exemplos 1–8, pp. 134–158. O conjunto permite selecionar casos de estratificação, água e busca crítica.
5. **Material secundário do curso.** As planilhas de Fellenius e Bishop e o PDF do exemplo 6 de Fellenius servem para comparação didática.

## 6. Divergências, lacunas e riscos

- O plano do módulo usa “Bishop Modificado” em um ponto, enquanto as aulas, a bibliografia técnica e o escopo da issue usam “Bishop Simplificado”. A #30 deve padronizar o nome e evitar confusão com outros métodos modificados.
- F1, F2 e F6 registram limitações do método ordinário; ele deve permanecer como referência e verificação aproximada, não como método principal.
- A formulação de Fellenius em tensões efetivas tem variantes para a pressão neutra. Comparar F1, §6.5.1, eqs. 6.48 e 6.59, F2, §C-2, eqs. C-12 e C-13, e F6, §9.3. A #30 deve declarar qual variante adota e registrar a utilizada em cada exemplo.
- As fontes oferecem diferentes representações de pressão neutra. O MVP precisa escolher uma convenção compatível com nível d'água/freática e documentar o que ocorre acima e abaixo dela.
- As estratégias de busca circular variam: centros/raios em malha, círculos por ponto comum, tangência e refinamento. A bibliografia não determina uma única estratégia para o produto.
- Não foi encontrada tolerância universal de convergência nem máximo universal de iterações. Esses parâmetros não podem ser inventados nem herdados de concorrente.
- O artigo original de Bishop e o trabalho original de Fellenius não foram fornecidos integralmente. F1 e F2 permitem avançar, mas a rastreabilidade histórica direta permanece pendente.
- A referência de 1991 no plano de aula é histórica. O prefácio da ABNT NBR 11682:2009 registra a substituição da edição anterior. A análise dos critérios normativos fica em etapa própria.

## 7. Seleção registrada no aceite técnico

1. Adotar **F1 (Duncan–Wright–Brandon, 2014)** como fonte técnica abrangente governante.
2. Adotar **F2 (USACE EM 1110-2-1902, 2003)** como fonte pública governante para auditoria, hipóteses, busca e tratamento de falhas.
3. Conferir **F3 (Bishop, 1955)** durante a #30, antes de encerrar a especificação.
4. Usar **F4 (Massad, 2010)** como apoio técnico em português e **F5/F6** como apoio e verificação independente.
5. Manter **F7** apenas como proveniência até acesso direto.
6. Citar **F8 (ABNT NBR 11682:2009)** como referência normativa. Tratar a adoção de fatores mínimos ou critérios de aceitação em análise específica.

## 8. Estado dos critérios de aceite

- CA1: atendido — todos os temas têm fonte primária candidata e localização.
- CA2: atendido — acesso e limite de reprodução classificados.
- CA3: atendido — matriz tema × fonte e classificação propostas.
- CA4: atendido — divergências e lacunas registradas sem resolução implícita.
- CA5: atendido — exemplos candidatos para Fellenius e Bishop identificados.
- CA6: atendido. O Eng. Gustavo Azocar, engenheiro civil, estrutural e geotécnico, aprovou a seleção e o encaminhamento acima. [Registro de aceite na issue #29](https://github.com/ricardocorsini/openstruct-front/issues/29#issuecomment-6840163130).

## 9. Conferência da integração

- O relatório e o aceite técnico acima foram conferidos na discussão pública da #29. As referências F1–F8 e seus papéis na seleção aprovada foram preservados.
- Os metadados e o sumário público de F1 foram conferidos na página da Wiley, incluindo §§6.5, 6.13 e 7.5–7.7. Em F4, a página da editora confirma autoria, edição, ano e ISBN; o [sumário disponibilizado pela editora](https://s3.sa-east-1.amazonaws.com/ofitexto.arquivos/sumarios/obras-terra-2-ed_sum.pdf) confirma §§3.2–3.4.
- Em F2, foram conferidos §§C-1 a C-3, C-10 e F-5a–d no manual de 31/10/2003, também disponível nesta [cópia pública do documento primário, hospedada pela ASDSO](https://damtoolbox.org/images/8/83/Slope_Stability_Document.pdf). O título, a data e o número foram confrontados com o [registro oficial do USACE](https://www.publications.usace.army.mil/USACE-Publications/Engineer-Manuals/u43544q/73746162696C697479/).
- A integração não repetiu a consulta aos exemplares privados de livros e norma: as localizações detalhadas não disponíveis nos sumários públicos permanecem atribuídas ao relatório e ao aceite do autor. Não houve nova validação de fórmulas ou reprodução de conteúdo protegido.
- A consulta ao artigo original de Bishop continua pendente na #30; F7 permanece uma referência histórica indireta. A integração deste relatório não encerra a especificação matemática (#30), os casos de referência e tolerâncias (#31) ou o roadmap (#28).
