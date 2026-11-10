import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Layers3,
  MapPinned,
  ChartNoAxesCombined,
  Save,
} from 'lucide-react';
import { getCurrentApp } from '../lib/apps';
import { AppStatus } from '../components/AppStatus';
import { ProductAvailability } from '../components/CatalogAvailability';
import { ProductInstallation } from '../components/ProductInstallation';
import { Contributors } from '../components/Contributors';
import { CaptureGallery } from '../components/CaptureGallery';
import { LAUNCHER_INSTALL_LABEL } from '../lib/installation';
import media from '../lib/geospt-media.json';

const app = getCurrentApp('geosptstruct');
const sourceRoot = `${app.repository.url}/blob/${app.code.ref}`;
const documents = {
  manual: app.documentation.url,
  desktop: `${sourceRoot}/docs/DESKTOP.md`,
  technical: `${sourceRoot}/NOTAS_TECNICAS.md`,
  history: `${sourceRoot}/HISTORICO_DESENVOLVIMENTO.md`,
};
const steps = [
  [
    'Obra',
    'Identifique a obra, o local e o responsável técnico. Esses dados acompanham os memoriais.',
  ],
  ['Sondagens', 'Cadastre NSPT por metro, cotas de topo, solo, cor e nível d’água dos furos.'],
  ['Compatibilização', 'Alinhe os furos por cota absoluta e examine o perfil consolidado.'],
  ['Análise', 'Revise os alertas críticos e os agrupamentos em domínios geotécnicos.'],
  ['Estacas', 'Defina tipo, diâmetro, arrasamento, carga prevista e posição de cada estaca.'],
  ['Capacidade', 'Compare os métodos e os modos de cálculo, com curvas e memorial por camada.'],
  [
    'Saídas',
    'Exporte os memoriais, a obra e os registros de auditoria para conferir e compartilhar.',
  ],
];
const modes = [
  [
    'Envoltória inferior',
    'NSPT mínimo, cota a cota.',
    'Use a envoltória inferior das sondagens para estudar uma hipótese conservadora do perfil.',
  ],
  [
    'Perfil médio',
    'Um perfil representativo.',
    'Examine a média das sondagens e seus submodos, observando as famílias de solo e as hipóteses selecionadas.',
  ],
  [
    'Por furo',
    'Cada sondagem, separadamente.',
    'Compare a capacidade calculada em cada furo com as mesmas configurações da estaca.',
  ],
  [
    'Interpolação',
    'A posição da estaca importa.',
    'Estime o perfil na locação da estaca a partir dos furos próximos, com pesos por cota.',
  ],
];
const features = [
  {
    Icon: MapPinned,
    title: 'Sondagens em conjunto.',
    text: 'Compatibilização por cota absoluta, análise de alertas e domínios geotécnicos para organizar diferentes regiões do terreno.',
  },
  {
    Icon: Layers3,
    title: 'Um corte para interpretar.',
    text: 'Reúna sondagens e estacas, leia as camadas e o nível d’água e exporte o desenho em SVG. As conexões entre furos são interpretadas e devem ser revisadas.',
  },
  {
    Icon: ChartNoAxesCombined,
    title: 'Acompanhe a transferência.',
    text: 'Leia esforço normal N(z) e tensão axial σ(z) ao longo da estaca. Explore cenários de ruptura, carga prevista e prevista × FS, com os modelos A e B de Aoki.',
  },
  {
    Icon: Save,
    title: 'Continue de onde parou.',
    text: 'O autosave é local. Para transportar a obra ou manter um backup independente, exporte o JSON e reimporte quando precisar.',
  },
];
const formats = [
  {
    Icon: FileSpreadsheet,
    title: 'XLSX',
    text: 'Memoriais por modo e uma aba comparativa, com dados para auditoria no Excel ou LibreOffice.',
  },
  {
    Icon: FileText,
    title: 'HTML / PDF',
    text: 'Relatórios compacto e completo. Abra a impressão para imprimir ou salvar em PDF.',
  },
  {
    Icon: FileJson,
    title: 'JSON',
    text: 'Obra para reabertura, registros de auditoria e exportação para detalhamento de estacas.',
  },
];

export function GeoSPT() {
  return (
    <>
      <section className="product-hero container geo-hero">
        <Link className="back-link" to="/apps">
          <ArrowLeft size={15} /> Todos os aplicativos
        </Link>
        <div className="product-identity">
          <img src={app.image} alt={app.imageAlt} width="90" height="90" />
          <div>
            <span className="eyebrow">{app.number} / GEOTECNIA · FUNDAÇÕES</span>
            <h1>{app.name}</h1>
          </div>
          <AppStatus app={app} />
        </div>
        <div className="geo-intro">
          <div className="geo-intro-copy">
            <span className="eyebrow">CONHEÇA O TERRENO. COMPARE AS HIPÓTESES.</span>
            <h2>
              Da sondagem
              <br />à capacidade
              <br />
              <span>de carga.</span>
            </h2>
            <p>
              Organize os furos SPT, compare a capacidade de carga das estacas e acompanhe o caminho
              dos dados até o memorial. Décourt–Quaresma e Aoki–Velloso, em um mesmo fluxo de
              trabalho.
            </p>
            <div className="button-row">
              <Link className="button button-primary" to="/launcher">
                <Download size={17} /> {LAUNCHER_INSTALL_LABEL}
              </Link>
              <a className="button button-outline" href="#interface">
                Conhecer a interface <ArrowRight size={17} />
              </a>
            </div>
            <span className="product-meta">
              Windows e Linux x86_64 · Conteúdo revisado da versão 2.0.7
            </span>
          </div>
          <figure className="geo-art">
            <img src={app.image} alt={app.imageAlt} width="768" height="768" fetchPriority="high" />
            <figcaption>
              <span>GEOSPT / OPENSTRUCT</span>
              <span>SPT → ESTACAS → MEMORIAIS</span>
            </figcaption>
          </figure>
        </div>
      </section>
      <div className="container">
        <ProductAvailability app={app} />
      </div>
      <nav className="container geo-section-nav" aria-label="Nesta página">
        {[
          ['fluxo', 'Fluxo de trabalho'],
          ['metodos', 'Métodos'],
          ['interface', 'Interface'],
          ['recursos', 'Recursos'],
          ['arquivos', 'Arquivos'],
          ['instalar', 'Instalação'],
        ].map(([id, label]) => (
          <a href={`#${id}`} key={id}>
            {label} <ArrowDownSmall />
          </a>
        ))}
      </nav>

      <section
        className="section container geo-workflow"
        id="fluxo"
        aria-labelledby="geo-fluxo-title"
      >
        <div className="section-kicker">
          <span>01 / UM PROJETO, SETE ETAPAS</span>
          <span>DA ENTRADA À CONFERÊNCIA</span>
        </div>
        <div className="section-heading">
          <h2 id="geo-fluxo-title">
            O terreno é o início.
            <br />O memorial, o registro.
          </h2>
          <p>
            As sete abas do GeoSPT organizam a obra sem impedir a navegação entre etapas. Comece
            pelos dados de campo, revise as hipóteses e acompanhe cada resultado.
          </p>
        </div>
        <ol className="geo-steps">
          {steps.map(([title, text], i) => (
            <li key={title}>
              <span className="geo-step-number">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="geo-method-section" id="metodos" aria-labelledby="geo-metodos-title">
        <div className="container">
          <div className="section-kicker">
            <span>02 / MÉTODOS E MODOS DE CÁLCULO</span>
            <span>COMPARE ANTES DE ADOTAR</span>
          </div>
          <div className="section-heading">
            <h2 id="geo-metodos-title">
              Duas estimativas.
              <br />
              Hipóteses à vista.
            </h2>
            <p>
              O aplicativo apresenta as parcelas de fuste e ponta, a capacidade admissível, a carga
              prevista e a margem. O comparativo ajuda a identificar diferenças entre métodos e
              modos.
            </p>
          </div>
          <div className="geo-method-pair">
            <article>
              <span className="eyebrow">DQ / CAPACIDADE DE CARGA</span>
              <h3>Décourt–Quaresma.</h3>
              <p>
                Estimativa semiempírica a partir do SPT, com coeficientes por solo e tipo de estaca.
                Consulte no memorial as parcelas de resistência e os critérios que governam o
                resultado.
              </p>
            </article>
            <article>
              <span className="eyebrow">AV / CAPACIDADE DE CARGA</span>
              <h3>Aoki–Velloso.</h3>
              <p>
                Estimativa com parâmetros do solo e fatores do tipo de estaca. A integração ao longo
                do perfil permite examinar a contribuição de cada camada e a resistência de ponta.
              </p>
            </article>
          </div>
          <h3 className="geo-modes-heading">Quatro formas de ler as sondagens.</h3>
          <div className="geo-mode-grid">
            {modes.map(([title, subtitle, text], i) => (
              <article key={title}>
                <span className="geo-mode-number">0{i + 1}</span>
                <h4>{title}</h4>
                <strong>{subtitle}</strong>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className="geo-note">
            Há também uma aba Comparativo. O editor de coeficientes, os tratamentos de ponta, as
            opções de atrito e o limite estrutural da estaca fazem parte das configurações do
            aplicativo. Confira os valores usados em cada análise.
          </p>
          <a className="text-link" href={documents.technical} target="_blank" rel="noreferrer">
            Notas técnicas do projeto <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <section
        className="section container geo-captures"
        id="interface"
        aria-labelledby="geo-interface-title"
      >
        <div className="section-kicker">
          <span>03 / INTERFACE REAL</span>
          <span>MANUAL DA VERSÃO 2.0.7</span>
        </div>
        <div className="section-heading">
          <h2 id="geo-interface-title">
            Veja os dados
            <br />
            ganharem contexto.
          </h2>
          <p>
            Capturas do manual incluído no repositório, com o exemplo público Balsas. Amplie as
            telas para conhecer a compatibilização, o memorial, o corte e a transferência de carga.
          </p>
        </div>
        <CaptureGallery label="Capturas reais do GeoSPT" captures={media.captures} />
        <p className="geo-note">
          As imagens registram exemplos da documentação. Seus valores não são parâmetros de projeto;
          o catálogo informa separadamente a versão disponível para instalar.
        </p>
      </section>

      <section className="section container" id="recursos" aria-labelledby="geo-recursos-title">
        <div className="section-kicker">
          <span>04 / DO PERFIL À ESTACA</span>
          <span>LEITURA, COMPARAÇÃO E REGISTRO</span>
        </div>
        <div className="section-heading">
          <h2 id="geo-recursos-title">
            Uma leitura integrada
            <br />
            da fundação.
          </h2>
          <p>
            Hélice contínua, escavadas, pré-moldadas e raiz: cadastre a geometria e a carga de cada
            estaca e acompanhe a resposta junto ao perfil geotécnico.
          </p>
        </div>
        <div className="feature-grid geo-feature-grid">
          {features.map(({ Icon, title, text }, i) => (
            <article key={title}>
              <div className="feature-top">
                <Icon size={24} strokeWidth={1.5} />
                <span>0{i + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container geo-exports" id="arquivos" aria-labelledby="geo-arquivos-title">
        <span className="eyebrow">05 / SAÍDAS DO APLICATIVO</span>
        <h2 id="geo-arquivos-title">
          O cálculo acompanha
          <br />a documentação.
        </h2>
        <div className="geo-export-grid">
          {formats.map(({ Icon, title, text }) => (
            <article key={title}>
              <Icon size={27} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <p>
          O corte também pode ser exportado em SVG. Os arquivos JSON de obra, auditoria e
          detalhamento têm finalidades diferentes; use o JSON de obra para reabrir seus dados.
        </p>
      </section>

      <section
        className="section container geo-download-section"
        id="instalar"
        aria-labelledby="geo-instalar-title"
      >
        <div className="section-kicker">
          <span>06 / NO SEU COMPUTADOR</span>
          <span>WINDOWS · LINUX</span>
        </div>
        <div className="geo-install-grid">
          <div>
            <h2 id="geo-instalar-title">
              Seu projeto.
              <br />
              No seu ambiente.
            </h2>
            <p>
              Instale pelo Struct Launcher e acompanhe as versões publicadas. O cálculo e os
              arquivos de trabalho são locais; o uso do aplicativo instalado dispensa Node.js e
              Rust.
            </p>
            <p>
              O Windows usa um instalador por usuário. No Linux, o AppImage depende das bibliotecas
              do sistema indicadas no guia desktop.
            </p>
            <a className="text-link" href={documents.desktop} target="_blank" rel="noreferrer">
              Requisitos e guia desktop <ArrowUpRight size={16} />
            </a>
          </div>
          <ProductInstallation app={app} />
        </div>
      </section>

      <section className="container geo-faq" aria-labelledby="geo-duvidas-title">
        <div>
          <span className="eyebrow">07 / ANTES DE COMEÇAR</span>
          <h2 id="geo-duvidas-title">Dúvidas frequentes.</h2>
        </div>
        <div>
          <details>
            <summary>Como experimentar com um exemplo?</summary>
            <p>
              Use o botão Balsas (demo) do aplicativo para carregar a obra de referência. Os dados
              permitem percorrer as abas e explorar os resultados antes de cadastrar uma obra
              própria.
            </p>
          </details>
          <details>
            <summary>Como levar uma obra do navegador para o desktop?</summary>
            <p>
              Exporte o JSON da obra no navegador e importe no aplicativo instalado. O autosave
              pertence ao ambiente local de cada um; mantenha uma cópia JSON como backup.
            </p>
          </details>
          <details>
            <summary>O GeoSPT calcula recalques ou dimensiona a armadura?</summary>
            <p>
              Seu foco é estimar a capacidade de carga geotécnica de estacas. A análise de
              recalques, os efeitos de grupo e o dimensionamento estrutural da armadura não são
              substituídos por essa estimativa. O diagrama axial simplificado também não substitui
              uma prova de carga.
            </p>
          </details>
          <details>
            <summary>Preciso conferir os resultados?</summary>
            <p>
              Sim. Os métodos dependem da qualidade das sondagens, da interpretação do subsolo e dos
              parâmetros adotados. Confira as hipóteses, os coeficientes e os memoriais; a decisão
              de projeto permanece com o responsável técnico.
            </p>
          </details>
          <details>
            <summary>Onde estão o código e a licença?</summary>
            <p>
              O código está no repositório público de Itan Ervale. A seção de licença do README
              ainda está sem definição; consulte o mantenedor sobre as condições de uso e
              redistribuição.
            </p>
            <a className="text-link" href={app.license.url} target="_blank" rel="noreferrer">
              Consultar o README original <ArrowUpRight size={15} />
            </a>
          </details>
        </div>
      </section>

      <section className="section container geo-resources" aria-labelledby="geo-documentacao-title">
        <div>
          <span className="eyebrow">DOCUMENTAÇÃO E DESENVOLVIMENTO</span>
          <h2 id="geo-documentacao-title">
            Aprofunde a leitura.
            <br />
            Participe do projeto.
          </h2>
          <p>
            As informações desta página foram revisadas a partir do repositório da versão 2.0.7. O
            empacotamento OpenStruct preserva a interface e o núcleo de cálculo do GeoSPT.
          </p>
        </div>
        <div className="geo-resource-links">
          <a href={documents.manual} target="_blank" rel="noreferrer">
            <BookOpen size={19} />
            <span>Manual de utilização</span>
            <ArrowUpRight size={17} />
          </a>
          <a href={documents.technical} target="_blank" rel="noreferrer">
            <FileText size={19} />
            <span>Notas técnicas</span>
            <ArrowUpRight size={17} />
          </a>
          <a href={documents.history} target="_blank" rel="noreferrer">
            <FileText size={19} />
            <span>Histórico do projeto</span>
            <ArrowUpRight size={17} />
          </a>
          <a href={app.repository.url} target="_blank" rel="noreferrer">
            <Layers3 size={19} />
            <span>Código-fonte · itanervale/GEOSPT-STRUCT</span>
            <ArrowUpRight size={17} />
          </a>
          <Link to="/development?repo=GEOSPT-STRUCT">
            <ArrowRight size={19} />
            <span>Acompanhar o desenvolvimento</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <Contributors repository="itanervale/GEOSPT-STRUCT" />
    </>
  );
}

function ArrowDownSmall() {
  return <span aria-hidden="true">↓</span>;
}
