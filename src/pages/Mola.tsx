import { Contributors } from '../components/Contributors';
import molaMedia from '../lib/mola-media.json';
import { CaptureGallery } from '../components/CaptureGallery';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Layers3,
  MoveHorizontal,
  Ruler,
  FileText,
  Table2,
  GitFork,
  Download,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
import { FoundationPreview } from '../components/FoundationPreview';
import { appIntegrations } from '../lib/config';
import { getCurrentApp } from '../lib/apps';
import { getMaturityLabel } from '../lib/app-registry';
import { AppStatus } from '../components/AppStatus';
import { ProductAvailability } from '../components/CatalogAvailability';
import { ProductInstallation } from '../components/ProductInstallation';
import { LAUNCHER_INSTALL_LABEL } from '../lib/installation';

const app = getCurrentApp('molastruct');
const release = app.distribution;
const integration = appIntegrations[app.id];
const sourceRoot = app.repository.url + '/blob/' + app.documentation.ref;
const documents = {
  readme: app.documentation.url,
  engine: sourceRoot + '/docs/MOTOR.md',
  methods: sourceRoot + '/docs/METODOLOGIAS.md',
  normative: sourceRoot + '/docs/NBR6122-2022.md',
  validation: sourceRoot + '/docs/VALIDACAO.md',
};
const developmentHistory = app.repository.url + '/blob/' + app.code.ref + '/CHANGELOG.md';
const platforms = new Intl.ListFormat('pt-BR').format(
  release?.platforms.map((asset) => (asset.os === 'windows' ? 'Windows' : 'Linux')) || [],
);

const features = [
  {
    Icon: Table2,
    title: 'Preserve a matriz completa.',
    text: 'Leia os seis coeficientes e a matriz 6×6, com acoplamentos entre translações e rotações. Cada Kii pressupõe os demais graus de liberdade impedidos; seis molas isoladas não representam todos os acoplamentos.',
    source: documents.engine,
    sourceLabel: 'Matriz, unidades e convenções',
  },
  {
    Icon: MoveHorizontal,
    title: 'Interprete a rigidez.',
    text: 'A matriz relaciona ações e deslocamentos no apoio. O bloco é rígido, com estacas verticais e ligação à flexão rígida ou rotulada. Graus de liberdade livres são identificados; ações incompatíveis bloqueiam a solução.',
    source: documents.engine,
    sourceLabel: 'Modelos e condições de contorno',
  },
  {
    Icon: Ruler,
    title: 'Leia o recalque no modelo.',
    text: 'A resposta às ações fornece deslocamentos e rotações. Nas sapatas Mindlin, o recalque é o do centro sob pressão uniforme, não a solução de contato de uma base perfeitamente rígida.',
    source: documents.engine,
    sourceLabel: 'Ponto de avaliação e hipóteses',
  },
  {
    Icon: Layers3,
    title: 'Compare as hipóteses.',
    text: 'Selecione métodos por fundação e examine comparação, sensibilidade e parâmetros intermediários. Confira a cobertura das camadas e do SPT e estude o refinamento da discretização antes de adotar resultados.',
    source: documents.methods,
    sourceLabel: 'Metodologias e calibração',
  },
  {
    Icon: FileText,
    title: 'Leve a memória com você.',
    text: 'Consulte a memória na interface e em PDF. Exporte matriz e SPT em CSV, geometria em DXF e desenhos SVG. Salve o projeto JSON versionado para reabrir e transportar seus dados.',
    source: documents.readme,
    sourceLabel: 'Recursos e exportações',
  },
  {
    Icon: ClipboardCheck,
    title: 'Confira serviço e resistência.',
    text: 'A conferência parcial NBR 6122:2022 separa ações ELS e ELU, limites justificados, critérios calculados, declarações e pendências. Ela não altera silenciosamente a matriz nem aprova o projeto inteiro.',
    source: documents.normative,
    sourceLabel: 'Alcance da conferência parcial',
  },
];

const methods = [
  {
    scope: 'ESTACAS / RIGIDEZ',
    title: 'Winkler.',
    text: 'Viga de Euler–Bernoulli na lateral e barras axial e torsional, com reação distribuída e condensação no topo. kh, kt e kp são entradas independentes. O grupo soma as estacas com seus braços; o redutor η é informado.',
    limit:
      'Sem interação lateral entre estacas nem contato bloco–solo. η não é fator de segurança de resistência.',
  },
  {
    scope: 'RIGIDEZ VERTICAL E RECALQUE',
    title: 'Mindlin · Aoki–Lopes · Steinbrenner.',
    text: 'Superposição vertical em camadas até a base indeslocável. Nas estacas, inclui encurtamento EA e flexibilidade mútua do grupo. A parcela de carga de fuste/ponta é proporcional fixa, informada ou baseada em RL/RP.',
    limit:
      'Steinbrenner é uma aproximação para camadas. Lateral e torção das estacas continuam em Winkler; não há transferência não linear t-z/q-z.',
  },
  {
    scope: 'ESTACAS / PERFIL SIMPLIFICADO',
    title: 'Randolph–Wroth conforme a documentação TQS.',
    text: 'Expressão simplificada de fuste, com camada equivalente explícita e grupo rígido sem interação. A rigidez horizontal é proporcional a Kz; as aproximações de rotação estão registradas no motor.',
    limit:
      'Não inclui o termo de base da solução completa de Randolph–Wroth nem comprova equivalência integral com o TQS.',
  },
  {
    scope: 'SAPATAS / OPÇÃO LEGADA',
    title: 'Disco equivalente.',
    text: 'Translações por disco de mesma área em semiespaço elástico, com E e ν homogeneizados na faixa 2B. Rotações aproximadas por molas distribuídas sobre o retângulo.',
    limit:
      'Kx e Ky iguais perdem a anisotropia da base retangular. Sem correção de embutimento ou solução unilateral de contato.',
  },
  {
    scope: 'SAPATAS / REAÇÃO VERTICAL',
    title: 'kv informado · SAFE/Morrison.',
    text: 'Use kv informado ou a correlação publicada para σadm, com conversões de unidades e faixa controlada. A tensão admissível é uma entrada independente, não inferida automaticamente de qult/FS.',
    limit:
      'Sem extrapolar a faixa da correlação. kv depende do modelo e da dimensão de referência; não é uma propriedade universal do solo.',
  },
  {
    scope: 'PARÂMETROS / CORRELAÇÕES OPCIONAIS',
    title: 'SPT → E.',
    text: 'Schmertmann com K_E editável por camada ou E0 inicial de Aoki para estacas, com fatores 6/4/3 por execução. As opções usam médias ponderadas e preservam os valores E manuais salvos.',
    limit:
      'ν permanece informado. Trocar E não recalibra kh/kt/kp; E0 Aoki não implementa a atualização posterior do módulo por tensões.',
  },
];

export function Mola() {
  return (
    <>
      <section className="product-hero container mola-product-hero">
        <Link className="back-link" to="/apps">
          <ArrowLeft size={15} /> Todos os aplicativos
        </Link>
        <div className="product-identity">
          <img src={app.image} alt={app.imageAlt} width="90" height="90" />
          <div>
            <span className="eyebrow">
              {app.number} / {app.category.toUpperCase()}
            </span>
            <h1>{app.name}</h1>
          </div>
          <AppStatus app={app} />
        </div>
        <div className="product-intro">
          <h2>
            Da sondagem
            <br />
            ao apoio elástico.
          </h2>
          <div>
            <p>
              Organize fundações, SPT e camadas de solo para estimar rigidez à translação e à
              rotação. Compare métodos, examine a matriz completa e acompanhe hipóteses e resultados
              na memória. O cálculo é local no aplicativo.
            </p>
            <div className="button-row">
              <Link className="button button-primary" to="/launcher">
                <Download size={17} /> {LAUNCHER_INSTALL_LABEL}
              </Link>
              <a
                className="button button-outline"
                href={documents.readme}
                target="_blank"
                rel="noreferrer"
              >
                <BookOpen size={17} /> Documentação da versão
              </a>
            </div>
            <span className="product-meta">
              {release && (
                <>
                  Conteúdo revisado: {release.version} · {platforms} x86_64 ·{' '}
                </>
              )}
              {getMaturityLabel(app)}
            </span>
          </div>
        </div>
      </section>
      <div className="container">
        <ProductAvailability app={app} />
      </div>
      <section className="section container" id="capturas" aria-labelledby="mola-capturas-title">
        <div className="section-kicker">
          <span>MOLASTRUCT / INTERFACE REAL</span>
          <span>FONTES DA TAG {molaMedia.documentationTag}</span>
        </div>
        <div className="section-heading">
          <h2 id="mola-capturas-title">
            Do modelo
            <br />
            aos resultados.
          </h2>
          <p>
            Capturas oficiais preservadas na documentação da 0.5.1. Os rótulos antigos das telas são
            identificados individualmente: não representam uma nova captura do instalador. Amplie
            para ler os parâmetros e as unidades.
          </p>
        </div>
        <CaptureGallery label="Capturas do MolaStruct" captures={molaMedia.captures} />
        <p className="mola-reference-note">
          Resultados de exemplos para estudo e conferência. Não constituem validação geotécnica,
          aprovação normativa integral ou equivalência com outro software. A versão disponível para
          instalar é consultada separadamente no catálogo.
        </p>
        <a className="text-link" href={molaMedia.license.notice} target="_blank" rel="noreferrer">
          Origem das imagens: docs oficiais · licença MIT
        </a>
      </section>
      <section className="container mola-overview" id="visao-geral">
        <FoundationPreview />
        <div className="demo-caption">
          <span>Prévia SVG do site; não é uma captura do aplicativo.</span>
          <span>Altera apenas o desenho. Sem cálculo de rigidez, recalque ou capacidade.</span>
        </div>
      </section>
      <section className="section container" id="entradas">
        <div className="section-kicker">
          <span>01 / ENTRADAS DO APLICATIVO</span>
          <span>{release && <>VERSÃO {release.version}</>}</span>
        </div>
        <div className="section-heading">
          <h2>
            A fundação e o solo.
            <br />
            Com parâmetros explícitos.
          </h2>
          <p>
            Esta página descreve a versão distribuída{release && <> {release.version}</>}. Defina o
            modelo e justifique seus parâmetros; o SPT não fornece sozinho todos os coeficientes
            necessários às estimativas.
          </p>
        </div>
        <div className="mola-inputs">
          {[
            {
              n: '01',
              title: 'Geometria e ações.',
              text: 'Sapatas retangulares ou blocos sobre 1 a 4 estacas. Informe dimensões, espaçamentos, cotas, concreto, ligação estaca–bloco e ações no centro da base.',
            },
            {
              n: '02',
              title: 'SPT e camadas.',
              text: 'Edite a sondagem, importe CSV/TSV ou cole dados de planilha. Defina camadas, nível d’água e a base rígida quando o método exigir. Recusa no SPT não comprova uma base indeslocável.',
            },
            {
              n: '03',
              title: 'Método e parâmetros.',
              text: 'Informe E, ν, reações Winkler ou selecione uma correlação disponível. Confira unidades, cobertura do perfil e parâmetros de capacidade, como α, K e F1/F2 de Aoki–Velloso.',
            },
          ].map((item) => (
            <article key={item.n}>
              <span>{item.n}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <a
          className="text-link mola-source-link"
          href={documents.engine}
          target="_blank"
          rel="noreferrer"
        >
          Entradas, unidades e condições de contorno <ArrowUpRight size={16} />
        </a>
      </section>
      <section className="mola-foundations" id="capacidade">
        <div className="container">
          <div className="section-kicker">
            <span>02 / CAPACIDADE, EM SEPARADO</span>
            <span>RESISTÊNCIA NÃO É RIGIDEZ</span>
          </div>
          <div className="mola-foundation-grid">
            <article>
              <span className="pill">SAPATAS RETANGULARES</span>
              <h2>Vésic e referência SPT.</h2>
              <p>
                A tensão última usa fatores de Vésic e de forma para carga vertical centrada. Os
                demais fatores são unitários. qSPT = C × N é uma referência exploratória, com C
                informado; não é tensão de ruptura nem critério normativo universal.
              </p>
              <ul>
                <li>
                  Parâmetros da camada de apoio e influência do nível d’água, com simplificações
                  explícitas.
                </li>
                <li>
                  qref = qult/FS é separado da rigidez. Pressões negativas sinalizam perda de
                  contato, sem redistribuição unilateral.
                </li>
                <li>
                  <strong>Terzaghi permanece pendente e não gera resultados.</strong>
                </li>
              </ul>
              <a
                className="text-link mola-source-link"
                href={documents.engine}
                target="_blank"
                rel="noreferrer"
              >
                Capacidade da sapata e limites <ArrowUpRight size={15} />
              </a>
            </article>
            <article>
              <span className="pill">BLOCOS SOBRE ESTACAS</span>
              <h2>Aoki–Velloso por estaca.</h2>
              <p>
                Integração por intervalos SPT e camadas, com F1/F2, α e K informados. A memória
                separa resistência de fuste, ponta e total da estaca isolada. Esses valores não são
                a rigidez nem a resistência última do grupo.
              </p>
              <div
                className="pile-number-strip"
                aria-label="Configurações disponíveis: 1, 2, 3 e 4 estacas"
              >
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
              <p>
                No Winkler, a capacidade não altera a rigidez linear. No Mindlin, RL/RP pode definir
                a proporção fixa de transferência; isso não implementa mobilização não linear.
              </p>
              <a
                className="text-link mola-source-link"
                href={documents.normative}
                target="_blank"
                rel="noreferrer"
              >
                Resistência, execução e conferência ELU <ArrowUpRight size={15} />
              </a>
            </article>
          </div>
        </div>
      </section>
      <section className="section container" id="resultados">
        <div className="section-kicker">
          <span>03 / RESULTADOS DISPONÍVEIS</span>
          <span>RIGIDEZ · RECALQUE · CAPACIDADE</span>
        </div>
        <div className="section-heading">
          <h2>
            Do terreno
            <br />
            ao modelo estrutural.
          </h2>
          <p>
            Rigidez relaciona ações e deslocamentos; recalque é uma resposta às ações no modelo;
            capacidade estima resistência. A conferência de um desses resultados não valida
            automaticamente os demais.
          </p>
        </div>
        <div className="feature-grid mola-feature-grid">
          {features.map(({ Icon, title, text, source, sourceLabel }, i) => (
            <article key={title}>
              <div className="feature-top">
                <Icon size={24} strokeWidth={1.5} />
                <span>0{i + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <a
                className="text-link mola-source-link"
                href={source}
                target="_blank"
                rel="noreferrer"
              >
                {sourceLabel} <ArrowUpRight size={15} />
              </a>
            </article>
          ))}
        </div>
        <p className="mola-reference-note">
          A matriz usa a ordem [ux, uy, uz, θx, θy, θz], no centro da base. As exportações mantêm as
          convenções kN, m e rad, com unidades dos blocos de translação, acoplamento e rotação
          identificadas na documentação.
        </p>
      </section>
      <section className="container mola-methods" id="metodos">
        <span className="eyebrow">
          04 / MÉTODOS IMPLEMENTADOS{release && <> NA {release.version}</>}
        </span>
        <h2>
          Um resultado.
          <br />
          Hipóteses identificadas.
        </h2>
        <div className="mola-method-groups">
          {methods.map((method) => (
            <article key={method.title}>
              <span className="eyebrow">{method.scope}</span>
              <span className="mola-method-status">Disponível na versão descrita</span>
              <h3>{method.title}</h3>
              <p>{method.text}</p>
              <p>
                <strong>Limites:</strong> {method.limit}
              </p>
              <a
                className="text-link mola-source-link"
                href={documents.engine}
                target="_blank"
                rel="noreferrer"
              >
                Equações e domínio do método <ArrowUpRight size={15} />
              </a>
            </article>
          ))}
        </div>
        <p className="mola-reference-note">
          A versão distribuída já contém os perfis simplificados que citam a documentação TQS. Isso
          é diferente da seleção posterior de coeficientes de reação horizontal (CRH). Não há
          comprovação de equivalência integral com o TQS.{' '}
          <a href={documents.methods} target="_blank" rel="noreferrer">
            Leia a revisão das fontes e as diferenças de modelagem.
          </a>
        </p>
      </section>
      <section className="section container mola-limits" id="limites">
        <div className="section-kicker">
          <span>05 / ALCANCE E VALIDAÇÃO</span>
          <span>APLICATIVO EXPERIMENTAL</span>
        </div>
        <div className="section-heading">
          <h2>
            Limites visíveis.
            <br />
            Revisão necessária.
          </h2>
          <p>
            A NBR 6122:2022 aparece em uma conferência parcial separada. Não fornece molas
            universais nem certifica o motor; os limites de serviço precisam ser informados e
            justificados para a obra.
          </p>
        </div>
        <div className="mola-method-groups">
          <article>
            <h3>O que o modelo local não resolve.</h3>
            <ul>
              <li>
                Interação global com a edificação, dimensionamento estrutural do bloco e das estacas
                e ligação resistente.
              </li>
              <li>
                Capacidade última do grupo, atrito negativo, adensamento, fluência e transferência
                não linear de carga.
              </li>
              <li>
                Contato unilateral da sapata e verificação completa de cargas excêntricas,
                horizontais e condições executivas.
              </li>
            </ul>
            <a
              className="text-link mola-source-link"
              href={documents.normative}
              target="_blank"
              rel="noreferrer"
            >
              Critérios calculados e pendências <ArrowUpRight size={15} />
            </a>
          </article>
          <article>
            <h3>O que as conferências demonstram.</h3>
            <p>
              Há testes analíticos e comparação independente de matrizes Winkler em casos lineares
              idealizados. Eles não validam automaticamente os parâmetros geotécnicos, o recalque
              Mindlin ou todas as rigidezes de outro software. A validação com provas de carga
              continua pendente.
            </p>
            <a
              className="text-link mola-source-link"
              href={documents.validation}
              target="_blank"
              rel="noreferrer"
            >
              Evidências e limites da validação <ArrowUpRight size={15} />
            </a>
          </article>
        </div>
      </section>
      {release && app.code.version !== release.version && (
        <section
          className="container mola-development"
          id="desenvolvimento"
          aria-labelledby="mola-development-title"
        >
          <span className="eyebrow">DESENVOLVIMENTO / FORA DO INSTALADOR {release.version}</span>
          <h2 id="mola-development-title">A branch avançou. A distribuição é outra.</h2>
          <p>
            O código revisado da branch {app.repository.branch} identifica a versão{' '}
            {app.code.version}. A apresentação foi revisada na release {release.version}. Os itens
            abaixo estão documentados nas revisões posteriores, sem pacote correspondente confirmado
            nessa consulta.
          </p>
          <ul>
            <li>
              Seleção CRH de kh manual, K/nh (TQS 3829/3836) e SPT/m, com tabelas e regras de
              discretização.
            </li>
            <li>
              Sapatas em meio contínuo pelas constantes k0 da FEMA 273 e correlação Teixeira–Godoy.
            </li>
          </ul>
          <a
            className="text-link mola-source-link"
            href={developmentHistory}
            target="_blank"
            rel="noreferrer"
          >
            Histórico do código em desenvolvimento <ArrowUpRight size={15} />
          </a>
        </section>
      )}
      <section className="section container" id="acesso">
        <div className="section-kicker">
          <span>06 / COMECE POR AQUI</span>
          <span>{app.name.toUpperCase()} / OPENSTRUCT</span>
        </div>
        <div className="access-grid">
          <article className="access-main">
            <span className="pill">APLICATIVO DESKTOP EXPERIMENTAL</span>
            <h2>
              Instale.
              <br />
              Confira seu modelo.
            </h2>
            <p>
              Abra o Struct Launcher e escolha o aplicativo na biblioteca. Consulte os exemplos, os
              métodos e as pendências antes de interpretar os resultados.
            </p>
            <ProductInstallation app={app} />
          </article>
          <article className="access-secondary">
            <BookOpen size={27} strokeWidth={1.5} />
            <h3>Documentação da versão distribuída.</h3>
            <p>
              Use as referências fixadas na tag{release && <> {release.sourceTag}</>}. O README
              dessa tag ainda exibe rótulos da base 0.5.0; a versão do pacote publicado é
              {release && <> {release.version}</>}. A disponibilidade é conferida pela release e
              pelo catálogo, separadamente das ressalvas de validação do aplicativo nativo.
            </p>
            <a className="text-link" href={documents.readme} target="_blank" rel="noreferrer">
              Leia a documentação <ArrowUpRight size={16} />
            </a>
            <div className="source-note">
              <GitFork size={18} />
              <a href={app.repository.url} target="_blank" rel="noreferrer">
                Projeto no GitHub <ArrowUpRight size={14} />
              </a>
            </div>
            {integration.webUrl && (
              <a
                className="text-link mola-source-link"
                href={integration.webUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir instância web <ArrowUpRight size={15} />
              </a>
            )}
          </article>
        </div>
      </section>
      <section className="product-community mola-community container">
        <div>
          <span className="eyebrow">CONSTRUA COM A GENTE</span>
          <h2>
            Que apoio falta
            <br />
            no seu dia a dia?
          </h2>
        </div>
        <div>
          <p>
            Compartilhe um caso reproduzível, uma revisão de parâmetros ou uma dúvida sobre a
            representação das fundações no modelo estrutural.
          </p>
          <Link className="button button-ink" to="/community">
            Participe do MolaStruct <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <Contributors repository="ricardocorsini/mola-struct" />
    </>
  );
}
