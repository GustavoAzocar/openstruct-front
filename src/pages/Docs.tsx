import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Search, BookOpen } from 'lucide-react';
import { site } from '../lib/config';
import { currentAppNames, getCurrentApp } from '../lib/apps';
import { ProductCatalogMeta } from '../components/CatalogAvailability';
import { CONTRIBUTION_MANUAL_PATH } from '../lib/contribution-manual';
import {
  getManualSystem,
  manualChapterPath,
  manualSystemPath,
  manualSystems,
  publicManualChapters,
} from '../lib/manual-chapters';
import './docs-index.css';

const consolo = getCurrentApp('consolostruct');
const mola = getCurrentApp('molastruct');
const armadura = getCurrentApp('armadurastruct');
const geospt = getCurrentApp('geosptstruct');
const systemManuals = manualSystems.filter((system) => system.kind === 'app');
const editorialId = 'recursos-editoriais';
const editorialManual = getManualSystem(editorialId);
const editorialEdition = editorialManual?.editions.find(
  (edition) => edition.id === editorialManual.currentEditionId,
);
const editorialChapters = editorialEdition ? publicManualChapters(editorialEdition) : [];

const articles = [
  {
    id: 'launcher',
    title: 'Struct Launcher: instalação e atualizações',
    body: 'O Struct Launcher é o caminho recomendado para instalar os aplicativos OpenStruct e acompanhar suas atualizações. Baixe para Windows ou Linux x86_64, abra o Launcher e escolha o aplicativo na biblioteca. Nas páginas de cada produto, a seção recolhida Instalação manual e versões anteriores oferece os pacotes avulsos como alternativa, com os dados do catálogo verificado. Você escolhe quando atualizar.',
    action: 'Baixar e conhecer o launcher',
    to: '/launcher',
  },
  {
    id: 'primeiros-passos',
    title: 'Primeiros passos',
    body: `Comece pelo catálogo de aplicativos. ${currentAppNames} possuem páginas próprias com versões publicadas, escopo, documentação e formas de acompanhar os projetos. As prévias do site são representações de apresentação, separadas dos aplicativos.`,
    action: 'Explore os aplicativos',
    to: '/apps',
  },
  {
    id: 'consolostruct',
    title: `${consolo.name}: cálculo e detalhamento`,
    body: `${consolo.name}${consolo.distribution ? ' ' + consolo.distribution.version : ''} reúne geometria paramétrica, memória de ELU e detalhamento com quadro de aço. ${consolo.engine ? 'O motor ' + consolo.engine.version + ' trata o ELU estático local de consolos simples curtos e muito curtos. ' : ''}Salve projetos .consolo.json e consulte as convenções de exportação e as pendências no guia da versão. A prévia SVG deste site não executa esses cálculos.`,
    action: 'Guia da versão publicada',
    to: consolo.documentation.url,
    external: true,
  },
  {
    id: 'previa',
    title: 'Explore a prévia visual',
    body: 'Na demonstração do ConsoloStruct, alterne entre Modelo, Armaduras e Detalhe. Ajuste a projeção do consolo e separe as camadas para entender a organização da peça. Esta demonstração altera apenas o desenho: não realiza cálculo, dimensionamento ou verificação estrutural.',
    action: 'Abrir a demonstração',
    to: `${consolo.route}${consolo.previewAnchor}`,
  },
  {
    id: 'principios',
    title: 'Princípios do ecossistema',
    body: 'O OpenStruct propõe ferramentas transparentes, com métodos, hipóteses, unidades e limites de aplicação apresentados junto aos resultados. Documentação, exemplos de referência e revisão fazem parte do desenvolvimento, assim como a interface e o código.',
    action: 'Participe da construção',
    to: '/community',
  },
  {
    id: 'unidades',
    title: 'Unidades e representação',
    body: `A prévia do ${consolo.name} apresenta dimensões em centímetros. O modelo é uma representação esquemática, sem escala de impressão. As convenções, os modelos de cálculo e os exemplos do aplicativo estão na documentação da versão distribuída.`,
    action: 'Explore a prévia',
    to: `${consolo.route}${consolo.previewAnchor}`,
  },
  {
    id: 'molastruct',
    title: `${mola.name}: fundação + solo`,
    body: `${mola.name}${mola.distribution ? ' ' + mola.distribution.version : ''} estima a rigidez de sapatas e blocos sobre 1 a 4 estacas, com SPT, camadas, matriz 6×6 e memória. Rigidez, recalque e capacidade são resultados distintos. Consulte os métodos disponíveis, a conferência parcial NBR 6122:2022 e os limites da versão publicada. A seleção de CRH/TQS e as sapatas FEMA/Teixeira–Godoy das revisões posteriores não fazem parte desse instalador; o esquema do site é apenas ilustrativo.`,
    action: 'Métodos, limites e documentação',
    to: mola.route,
  },
  {
    id: 'armadurastruct',
    title: `${armadura.name}: desenho e quadro de aço`,
    body: `${armadura.name}${armadura.distribution ? ' ' + armadura.distribution.version : ''} importa DXF ASCII ou DWG como máscaras 2D, com compatibilidade limitada às entidades reconhecidas. O detalhamento, os comprimentos geométricos e o quadro permanecem no projeto editável .armstruct.json, formato armadurastruct/2. As saídas são DXF, PDF A3 e CSV; não há exportação DWG. Traspasse, dimensionamento e verificações de projeto são manuais. A licença deste aplicativo é ${armadura.license.spdx}.`,
    action: `Fluxo, arquivos e limites do ${armadura.name}`,
    to: armadura.route,
  },
  {
    id: 'geosptstruct',
    title: 'GeoSPT: sondagens e capacidade de carga de estacas',
    body: 'Cadastre os furos SPT, compatibilize as cotas e compare Décourt–Quaresma e Aoki–Velloso em quatro modos: envoltória, perfil médio, por furo e interpolação. Consulte o corte interpretado, os diagramas de transferência de carga e os memoriais. Salve obras JSON e exporte XLSX, HTML/PDF e dados de auditoria. O exemplo Balsas está no aplicativo. A licença ainda não foi informada pelo repositório.',
    action: 'Fluxo, métodos e manual do GeoSPT',
    to: geospt.route,
  },
  {
    id: 'contribuir',
    title: 'Como colaborar: manual passo a passo',
    body: 'Escolha o projeto certo e sua forma de ajudar. O manual conduz uma primeira colaboração sem código e uma alteração no frontend até a revisão, com exemplos, comandos, resultados esperados e cuidados antes de compartilhar. Também apresenta os guias próprios dos aplicativos.',
    action: 'Como colaborar',
    to: CONTRIBUTION_MANUAL_PATH,
  },
  {
    id: editorialId,
    title: 'Recursos editoriais',
    body: 'Veja uma amostra didática de como os manuais apresentam fórmulas, símbolos, unidades e exemplos numéricos.',
    action: 'Ver recursos editoriais',
    to: manualSystemPath(editorialId),
  },
];

export function Docs() {
  const [query, setQuery] = useState('');
  const normalized = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const filtered = articles.filter((a) =>
    `${a.title} ${a.body}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(normalized),
  );
  return (
    <div className="container">
      <section className="page-hero docs-hero">
        <h1>Documentação do OpenStruct</h1>
        <p>Acesse os manuais dos aplicativos e os guias de instalação e colaboração.</p>
        <Link className="text-link" to={manualSystemPath(editorialId)}>
          Recursos editoriais <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </section>
      <section className="docs-directory" aria-labelledby="docs-directory-title">
        <h2 id="docs-directory-title">Manuais por sistema</h2>
        <ul className="docs-directory-list">
          {systemManuals.map((system) => {
            const edition = system.editions.find(({ id }) => id === system.currentEditionId);
            return (
              <li className="docs-directory-entry" key={system.id}>
                <h3>
                  <Link to={manualSystemPath(system.id)}>
                    {system.name} <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </h3>
                <p>{system.summary}</p>
                <p className="docs-directory-status">
                  {edition?.status === 'reviewed'
                    ? 'Manual disponível'
                    : edition?.status === 'sample'
                      ? 'Amostra disponível'
                      : 'Manual em elaboração'}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="docs-guides" aria-labelledby="docs-guides-title">
        <h2 id="docs-guides-title">Guias do ecossistema</h2>
        <label className="search-box">
          <Search aria-hidden="true" size={18} />
          <input
            aria-label="Buscar guias do ecossistema"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar guias"
          />
        </label>
      </section>
      <div className="docs-layout">
        <nav className="docs-nav" aria-label="Guias nesta página">
          <span className="eyebrow" aria-hidden="true">
            NESTA PÁGINA
          </span>
          {articles.map((a) => (
            <a href={`#${a.id}`} key={a.id} onClick={() => setQuery('')}>
              {a.title}
            </a>
          ))}
          <a
            className="docs-repo"
            href={`${site.websiteRepository}#readme`}
            target="_blank"
            rel="noreferrer"
          >
            Documentação deste site <ArrowUpRight size={15} />
          </a>
        </nav>
        <div className="docs-articles">
          <span className="sr-only" aria-live="polite">
            {filtered.length} tópicos encontrados
          </span>
          {filtered.map((a) => {
            const system = systemManuals.find(({ id }) => id === a.id);
            return (
              <article id={a.id} key={a.id}>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
                {[consolo, mola, armadura].find((app) => app.id === a.id) && (
                  <ProductCatalogMeta app={getCurrentApp(a.id)} />
                )}
                <div className="docs-topic-links">
                  {system && (
                    <Link className="text-link" to={manualSystemPath(system.id)}>
                      Manual do {system.name} <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  )}
                  {a.external ? (
                    <a className="text-link" href={a.to} target="_blank" rel="noreferrer">
                      {a.action} <ArrowUpRight aria-hidden="true" size={16} />
                    </a>
                  ) : (
                    <Link className="text-link" to={a.to}>
                      {a.action} <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  )}
                  {a.id === editorialId &&
                    editorialEdition &&
                    editorialChapters.map((chapter) => (
                      <Link
                        className="text-link"
                        key={chapter.slug}
                        to={manualChapterPath(editorialId, editorialEdition.id, chapter.slug)}
                      >
                        {chapter.title} <ArrowRight aria-hidden="true" size={16} />
                      </Link>
                    ))}
                </div>
              </article>
            );
          })}
          {!filtered.length && (
            <div className="empty-state">
              <BookOpen size={30} />
              <h2>Vamos tentar outro assunto?</h2>
              <p>Nenhum tópico corresponde à sua busca.</p>
              <button className="button button-outline" onClick={() => setQuery('')}>
                Ver todos os tópicos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
