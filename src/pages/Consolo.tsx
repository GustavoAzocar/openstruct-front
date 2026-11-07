import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Box,
  Layers3,
  Ruler,
  FileText,
  Table2,
  SlidersHorizontal,
  GitFork,
  Download,
  BookOpen,
} from 'lucide-react';
import { ModelPreview } from '../components/ModelPreview';
import { AppStatus } from '../components/AppStatus';
import { ProductAvailability } from '../components/CatalogAvailability';
import { useProductAvailability } from '../components/CatalogProvider';
import { appIntegrations } from '../lib/config';
import { getCurrentApp } from '../lib/apps';
import { getMaturityLabel } from '../lib/app-registry';

const app = getCurrentApp('consolostruct');
const release = app.distribution;
const engine = app.engine;
const integration = appIntegrations[app.id];
const sourceRoot = app.repository.url + '/blob/' + app.documentation.ref;
const documents = {
  guide: app.documentation.url,
  criteria: sourceRoot + '/docs/CRITERIOS-DE-CALCULO.md',
  detailing: sourceRoot + '/docs/DETALHAMENTO.md',
  validation: sourceRoot + '/docs/VALIDACAO-MOTOR.md',
};
const platforms = new Intl.ListFormat('pt-BR').format(
  release?.platforms.map((asset) => (asset.os === 'windows' ? 'Windows' : 'Linux')) || [],
);
const features = [
  {
    Icon: Box,
    title: 'Defina a geometria.',
    text: 'Organize consolos, materiais, ações e combinações por peça. Ajuste dimensões pelo desenho e navegue pelas vistas 2D e 3D.',
    source: documents.guide,
    sourceLabel: 'Entradas e vistas',
  },
  {
    Icon: Layers3,
    title: 'Confira o ELU local.',
    text: 'Verifique consolos simples curtos por bielas e tirantes e muito curtos por atrito-cisalhamento, dentro das hipóteses e do domínio do motor.',
    source: documents.criteria,
    sourceLabel: 'Critérios de cálculo',
  },
  {
    Icon: SlidersHorizontal,
    title: 'Revise a armadura.',
    text: 'Explore sugestões de bitolas, quantidades e camadas, sujeitas às verificações e à revisão do projetista. Tirante duplo corresponde a duas camadas na mesma face.',
    source: documents.guide,
    sourceLabel: 'Guia de uso',
  },
  {
    Icon: Ruler,
    title: 'Leia o detalhamento.',
    text: 'Reúna elevação, planta, cortes e formas de dobramento. Confira um consolo ou todos os tipos do projeto, com identificação, revisão e notas.',
    source: documents.detailing,
    sourceLabel: 'Vistas e convenções',
  },
  {
    Icon: Table2,
    title: 'Confira o quadro de aço.',
    text: 'Acompanhe posições, barras físicas, comprimentos e massas. A quantidade de cada tipo multiplica os quantitativos; o resumo reúne classes de aço e bitolas.',
    source: documents.detailing,
    sourceLabel: 'Quadro e comprimentos',
  },
  {
    Icon: FileText,
    title: 'Rastreie o resultado.',
    text: 'Consulte a memória por combinação, com fórmulas, resultados e referências. O registro .calc.json conserva entradas, versão do motor e verificações para auditoria.',
    source: documents.criteria,
    sourceLabel: 'Memória e auditoria',
  },
];

export function Consolo() {
  const availableRelease = useProductAvailability(app.id)?.release;
  return (
    <>
      <section className="product-hero container">
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
            Do cálculo
            <br />
            ao detalhe.
          </h2>
          <div>
            <p>
              Calcule consolos de concreto armado, revise a memória de ELU e prepare desenhos com
              quadro de aço. O aplicativo reúne essas etapas em uma interface desktop, com
              processamento local e projetos no seu computador.
            </p>
            <div className="button-row">
              <Link className="button button-primary" to="/launcher">
                <Download size={17} />{' '}
                {release ? 'Instalar pelo Launcher' : 'Consultar a biblioteca'}
              </Link>
              <a
                className="button button-outline"
                href={documents.guide}
                target="_blank"
                rel="noreferrer"
              >
                <BookOpen size={17} /> Guia da versão
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
      <section className="container product-demo" id="demonstracao">
        <div className="consolo-demo-heading">
          <h2>Uma prévia do site.</h2>
          <a className="text-link" href="#recursos">
            Conheça o aplicativo <ArrowRight size={16} />
          </a>
        </div>
        <ModelPreview />
        <div className="demo-caption">
          <span>Representação esquemática em SVG; não é uma captura da interface desktop.</span>
          <span>Altera apenas o desenho. Sem cálculo ou verificação estrutural.</span>
        </div>
      </section>

      <section className="section container" id="recursos">
        <div className="section-kicker">
          <span>01 / RECURSOS DO APLICATIVO</span>
          <span>{release && <>VERSÃO {release.version}</>}</span>
        </div>
        <div className="section-heading">
          <h2>
            Geometria, ELU
            <br />e detalhamento.
          </h2>
          <p>
            Estes recursos fazem parte da versão publicada. Cada etapa tem sua documentação: confira
            as hipóteses, as pendências e as convenções antes de usar as saídas.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ Icon, title, text, source, sourceLabel }, i) => (
            <article key={title}>
              <div className="feature-top">
                <Icon size={24} strokeWidth={1.5} />
                <span>0{i + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <a
                className="text-link consolo-feature-source"
                href={source}
                target="_blank"
                rel="noreferrer"
              >
                {sourceLabel} <ArrowUpRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="product-workflow">
        <div className="container">
          <div className="section-kicker">
            <span>02 / UM CAMINHO PARA O PROJETO</span>
            <span>ENTRADAS → MEMÓRIA → DETALHAMENTO</span>
          </div>
          <div className="workflow-header">
            <h2>
              Revise a peça.
              <br />
              Acompanhe cada etapa.
            </h2>
            <a className="text-link" href={documents.guide} target="_blank" rel="noreferrer">
              Siga o guia de uso <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="workflow-grid">
            {[
              {
                n: '01',
                title: 'Defina e confira.',
                text: 'Crie ou abra um projeto. Revise geometria, materiais, apoio, ações e combinações fornecidas pelo projetista.',
              },
              {
                n: '02',
                title: 'Calcule e interprete.',
                text: 'Execute Calcular e abra a Memória. Leia o estado de cada verificação, as referências e as pendências. Alterou as entradas? Recalcule.',
              },
              {
                n: '03',
                title: 'Detalhe e exporte.',
                text: 'Revise armaduras, camadas, desenhos e quantitativos. Salve o projeto e exporte as saídas da peça ou do conjunto para conferência.',
              },
            ].map((step) => (
              <article key={step.n}>
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container consolo-scope" id="escopo">
        <div className="section-kicker">
          <span>03 / ESCOPO E LIMITES</span>
          <span>ENGENHARIA À VISTA</span>
        </div>
        <div className="section-heading">
          <h2>
            Cálculo local.
            <br />
            Limites à vista.
          </h2>
          <p>
            {release && <>Este escopo descreve a versão {release.version}. </>}
            {engine && (
              <>
                O motor de cálculo é o {engine.version}, com a política {engine.policy}.{' '}
              </>
            )}
            A versão da interface e a do motor são identificações independentes.
          </p>
        </div>
        <div className="consolo-scope-grid">
          <article>
            <h3>ELU estático de consolos simples.</h3>
            <p>
              O motor trata consolos curtos e muito curtos, com ações estáticas no plano médio e
              combinações normais de ELU. Os critérios documentados se apoiam nas NBR 6118:2026 e
              9062:2017 e nos modelos de Araújo e El Debs, nos recortes descritos pelo projeto.
            </p>
            <p>
              A memória distingue atendimento às verificações implementadas, falha, revisão
              necessária, entrada inválida e domínio não implementado. A vista 3D é esquemática e
              não faz análise resistente espacial.
            </p>
            <a className="text-link" href={documents.criteria} target="_blank" rel="noreferrer">
              Hipóteses e critérios <ArrowUpRight size={15} />
            </a>
          </article>
          <article>
            <h3>O que permanece fora do escopo.</h3>
            <ul>
              <li>Dentes Gerber, consolos duplos ou contínuos e relações a/d maiores que 1.</li>
              <li>ELS, fissuração, fadiga, análise espacial e estrutura global.</li>
              <li>
                Verificação completa do aparelho de apoio, pinos, chumbadores e compatibilização
                integral com as armaduras do suporte.
              </li>
            </ul>
            <p>
              As combinações são informadas pelo projetista. A sugestão de armaduras e a exportação
              de desenhos não eliminam as pendências de cálculo, fabricação ou revisão do
              responsável técnico.
            </p>
          </article>
        </div>
        <p className="consolo-scope-note">
          Atender às verificações implementadas não equivale à aprovação executiva da peça ou da
          estrutura.{' '}
          <a href={documents.validation} target="_blank" rel="noreferrer">
            Consulte os casos de validação e seus limites.
          </a>
        </p>
      </section>

      <section className="section container" id="acesso">
        <div className="section-kicker">
          <span>04 / COMECE POR AQUI</span>
          <span>{app.name.toUpperCase()}</span>
        </div>
        <div className="access-grid">
          <article className="access-main">
            <span className="pill">
              <Download size={14} /> APLICATIVO DESKTOP
            </span>
            <h2>
              Instale.
              <br />
              Abra um projeto.
            </h2>
            <p>
              Instale pelo Struct Launcher e consulte o guia para abrir os exemplos incluídos,
              conferir as entradas e acompanhar o resultado.
            </p>
            <Link className="button button-primary" to="/launcher">
              <Download size={17} /> Instalar pelo Launcher
            </Link>
            {availableRelease && (
              <a
                className="text-link consolo-release-link"
                href={availableRelease.releaseUrl}
                target="_blank"
                rel="noreferrer"
              >
                Notas e instaladores {availableRelease.version} <ArrowUpRight size={15} />
              </a>
            )}
          </article>
          <article className="access-secondary">
            <BookOpen size={27} strokeWidth={1.5} />
            <h3>Do projeto às saídas.</h3>
            <p>
              Salve em <code>.consolo.json</code>, com leitura dos projetos anteriores{' '}
              <code>.lume.json</code>. O módulo Detalhamento exporta DXF em cm, SVG, PDF vetorial e
              quadro de aço em CSV. A memória é um relatório separado; <code>.calc.json</code> é o
              registro auditável do cálculo.
            </p>
            <a className="text-link" href={documents.guide} target="_blank" rel="noreferrer">
              Guia da versão publicada <ArrowUpRight size={16} />
            </a>
            <div className="source-note">
              <GitFork size={18} />
              <a href={app.repository.url} target="_blank" rel="noreferrer">
                Código no GitHub <ArrowUpRight size={14} />
              </a>
            </div>
            {integration.webUrl && (
              <a
                className="text-link consolo-release-link"
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

      <section className="section container faq-section">
        <div>
          <span className="eyebrow">ANTES DE COMEÇAR</span>
          <h2>Bom saber.</h2>
          <a className="text-link" href={documents.guide} target="_blank" rel="noreferrer">
            Documentação oficial <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="faq-list">
          <details>
            <summary>
              A prévia deste site faz os cálculos?<span>+</span>
            </summary>
            <p>
              Não. Os controles da prévia alteram apenas o desenho SVG. Eles não executam o motor,
              não dimensionam armaduras e não geram desenhos para obra. O cálculo e o detalhamento
              descritos nesta página pertencem ao aplicativo.
            </p>
          </details>
          <details>
            <summary>
              Qual é a versão do motor?<span>+</span>
            </summary>
            <p>
              {engine && (
                <>
                  O motor é o {engine.version}, política {engine.policy}.{' '}
                </>
              )}
              {release && <>A apresentação descreve o aplicativo {release.version}. </>}
              As duas versões evoluem separadamente. Consulte os critérios e as pendências na
              memória de cada peça.
            </p>
          </details>
          <details>
            <summary>
              Tirante duplo é um consolo de cada lado?<span>+</span>
            </summary>
            <p>
              Não. Significa duas camadas de tirante na mesma face do suporte. Consolos duplos ou
              contínuos ficam fora do escopo do motor e do gerador local. O quadro conta barras
              físicas, não apenas ramos longitudinais.
            </p>
            <a className="text-link" href={documents.detailing} target="_blank" rel="noreferrer">
              Convenções do detalhamento <ArrowUpRight size={15} />
            </a>
          </details>
          <details>
            <summary>
              Todo DXF usa as mesmas unidades?<span>+</span>
            </summary>
            <p>
              O DXF do módulo Detalhamento usa centímetros. O comando Geometria DXF exporta
              contornos em milímetros e é uma saída diferente. Confira o comando utilizado, as
              unidades e as convenções antes de levar o desenho ao CAD.
            </p>
          </details>
          <details>
            <summary>
              Exportar significa que a peça está aprovada?<span>+</span>
            </summary>
            <p>
              Não. A exportação pode ser usada para revisão mesmo com pendências. Verifique os
              estados da memória e os avisos de emissão, inclusive as pendências impeditivas. A
              conferência do responsável técnico e a compatibilização com o conjunto continuam
              necessárias.
            </p>
            <a className="text-link" href={documents.detailing} target="_blank" rel="noreferrer">
              Situação de emissão e limites <ArrowUpRight size={15} />
            </a>
          </details>
        </div>
      </section>

      <section className="product-community container">
        <div>
          <span className="eyebrow">CONSTRUA COM A GENTE</span>
          <h2>
            Qual detalhe você
            <br />
            gostaria de melhorar?
          </h2>
        </div>
        <div>
          <p>
            Contribua com exemplos reproduzíveis, revisão de documentação ou relatos de
            divergências.
          </p>
          <Link className="button button-ink" to="/community">
            Faça parte do {app.name} <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
