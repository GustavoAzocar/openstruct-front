import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Search, BookOpen } from 'lucide-react';
import { site } from '../lib/config';
import { currentAppNames, getCurrentApp } from '../lib/apps';
import { ProductCatalogMeta } from '../components/CatalogAvailability';

const consolo = getCurrentApp('consolostruct');
const mola = getCurrentApp('molastruct');
const armadura = getCurrentApp('armadurastruct');

const articles = [
  {
    id: 'launcher',
    n: '01',
    title: 'Struct Launcher: instalação e atualizações',
    body: 'Baixe o launcher para Windows ou Linux x86_64. No Windows, execute o instalador; no Linux, permita a execução do AppImage e abra o arquivo. A biblioteca apresenta os aplicativos disponíveis para instalar e avisa sobre novas versões. Você escolhe quando atualizar.',
    action: 'Baixar e conhecer o launcher',
    to: '/launcher',
  },
  {
    id: 'primeiros-passos',
    n: '02',
    title: 'Primeiros passos',
    body: `Comece pelo catálogo de aplicativos. ${currentAppNames} possuem páginas próprias com versões publicadas, escopo, documentação e formas de acompanhar os projetos. As prévias do site são representações de apresentação, separadas dos aplicativos.`,
    action: 'Explore os aplicativos',
    to: '/apps',
  },
  {
    id: 'consolostruct',
    n: '03',
    title: `${consolo.name}: cálculo e detalhamento`,
    body: `${consolo.name}${consolo.distribution ? ' ' + consolo.distribution.version : ''} reúne geometria paramétrica, memória de ELU e detalhamento com quadro de aço. ${consolo.engine ? 'O motor ' + consolo.engine.version + ' trata o ELU estático local de consolos simples curtos e muito curtos. ' : ''}Salve projetos .consolo.json e consulte as convenções de exportação e as pendências no guia da versão. A prévia SVG deste site não executa esses cálculos.`,
    action: 'Guia da versão publicada',
    to: consolo.documentation.url,
    external: true,
  },
  {
    id: 'previa',
    n: '04',
    title: 'Explore a prévia visual',
    body: 'Na demonstração do ConsoloStruct, alterne entre Modelo, Armaduras e Detalhe. Ajuste a projeção do consolo e separe as camadas para entender a organização da peça. Esta demonstração altera apenas o desenho: não realiza cálculo, dimensionamento ou verificação estrutural.',
    action: 'Abrir a demonstração',
    to: `${consolo.route}${consolo.previewAnchor}`,
  },
  {
    id: 'principios',
    n: '05',
    title: 'Princípios do ecossistema',
    body: 'O OpenStruct propõe ferramentas transparentes, com métodos, hipóteses, unidades e limites de aplicação apresentados junto aos resultados. Documentação, exemplos de referência e revisão fazem parte do desenvolvimento, assim como a interface e o código.',
    action: 'Participe da construção',
    to: '/community',
  },
  {
    id: 'unidades',
    n: '06',
    title: 'Unidades e representação',
    body: `A prévia do ${consolo.name} apresenta dimensões em centímetros. O modelo é uma representação esquemática, sem escala de impressão. As convenções, os modelos de cálculo e os exemplos do aplicativo estão na documentação da versão distribuída.`,
    action: 'Explore a prévia',
    to: `${consolo.route}${consolo.previewAnchor}`,
  },
  {
    id: 'molastruct',
    n: '07',
    title: `${mola.name}: fundação + solo`,
    body: `${mola.name}${mola.distribution ? ' ' + mola.distribution.version : ''} estima a rigidez de sapatas e blocos sobre 1 a 4 estacas, com SPT, camadas, matriz 6×6 e memória. Rigidez, recalque e capacidade são resultados distintos. Consulte os métodos disponíveis, a conferência parcial NBR 6122:2022 e os limites da versão publicada. A seleção de CRH/TQS e as sapatas FEMA/Teixeira–Godoy das revisões posteriores não fazem parte desse instalador; o esquema do site é apenas ilustrativo.`,
    action: 'Métodos, limites e documentação',
    to: mola.route,
  },
  {
    id: 'armadurastruct',
    n: '08',
    title: `${armadura.name}: desenho e quadro de aço`,
    body: `${armadura.name}${armadura.distribution ? ' ' + armadura.distribution.version : ''} importa DXF ASCII ou DWG como máscaras 2D, com compatibilidade limitada às entidades reconhecidas. O detalhamento, os comprimentos geométricos e o quadro permanecem no projeto editável .armstruct.json, formato armadurastruct/2. As saídas são DXF, PDF A3 e CSV; não há exportação DWG. Traspasse, dimensionamento e verificações de projeto são manuais. A licença deste aplicativo é ${armadura.license.spdx}.`,
    action: `Fluxo, arquivos e limites do ${armadura.name}`,
    to: armadura.route,
  },
  {
    id: 'contribuir',
    n: '09',
    title: 'Como contribuir',
    body: 'Descreva o contexto da sua ideia ou problema, o comportamento esperado e, quando possível, um exemplo que ajude a reproduzir a situação. Sugestões sobre clareza, documentação, acessibilidade e fluxo de trabalho também são contribuições importantes.',
    action: 'Veja as formas de participar',
    to: '/community',
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
        <span className="eyebrow">DOCUMENTAÇÃO / UM CONHECIMENTO COMPARTILHADO</span>
        <h1>
          Entenda por onde
          <br />
          começar.
        </h1>
        <p>
          Uma introdução ao ecossistema, aos aplicativos {currentAppNames} e aos princípios que
          orientam o projeto.
        </p>
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Buscar na documentação"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você quer explorar?"
          />
        </label>
      </section>
      <div className="docs-layout">
        <aside className="docs-nav">
          <span className="eyebrow">NESTA PÁGINA</span>
          {articles.map((a) => (
            <a href={`#${a.id}`} key={a.id} onClick={() => setQuery('')}>
              <span>{a.n}</span>
              {a.title}
            </a>
          ))}
          <a
            className="docs-repo"
            href={`${site.repository}#readme`}
            target="_blank"
            rel="noreferrer"
          >
            Documentação do código <ArrowUpRight size={15} />
          </a>
        </aside>
        <div className="docs-articles">
          <span className="sr-only" aria-live="polite">
            {filtered.length} tópicos encontrados
          </span>
          {filtered.map((a) => (
            <article id={a.id} key={a.id}>
              <span className="eyebrow">GUIA / {a.n}</span>
              <h2>{a.title}</h2>
              <p>{a.body}</p>
              {[consolo, mola, armadura].find((app) => app.id === a.id) && (
                <ProductCatalogMeta app={getCurrentApp(a.id)} />
              )}
              {a.external ? (
                <a className="text-link" href={a.to} target="_blank" rel="noreferrer">
                  {a.action} <ArrowUpRight size={16} />
                </a>
              ) : (
                <Link className="text-link" to={a.to}>
                  {a.action} <ArrowRight size={16} />
                </Link>
              )}
            </article>
          ))}
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
