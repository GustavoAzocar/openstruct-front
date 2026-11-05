import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Search, BookOpen } from 'lucide-react';
import { site } from '../lib/config';

const articles = [
  {
    id: 'primeiros-passos',
    n: '01',
    title: 'Primeiros passos',
    body: 'Comece pelo catálogo de aplicativos. O ConsoloStruct é o primeiro projeto apresentado no ecossistema. Sua página reúne uma prévia visual, os recursos em desenvolvimento e formas de acompanhar o projeto.',
    action: 'Conheça o ConsoloStruct',
    to: '/apps/consolostruct',
  },
  {
    id: 'previa',
    n: '02',
    title: 'Explore a prévia visual',
    body: 'Na demonstração do ConsoloStruct, alterne entre Modelo, Armaduras e Detalhe. Ajuste a projeção do consolo e separe as camadas para entender a organização da peça. Esta demonstração altera apenas o desenho: não realiza cálculo, dimensionamento ou verificação estrutural.',
    action: 'Abrir a demonstração',
    to: '/apps/consolostruct#demonstracao',
  },
  {
    id: 'principios',
    n: '03',
    title: 'Princípios do ecossistema',
    body: 'O OpenStruct propõe ferramentas transparentes, com métodos, hipóteses, unidades e limites de aplicação apresentados junto aos resultados. Documentação, exemplos de referência e revisão fazem parte do desenvolvimento, assim como a interface e o código.',
    action: 'Participe da construção',
    to: '/community',
  },
  {
    id: 'unidades',
    n: '04',
    title: 'Unidades e representação',
    body: 'A prévia do ConsoloStruct apresenta dimensões em centímetros. O modelo é uma representação esquemática, sem escala de impressão. O aplicativo definitivo terá sua própria documentação técnica, com convenções, modelos de cálculo e exemplos de uso.',
    action: 'Explore a prévia',
    to: '/apps/consolostruct#demonstracao',
  },
  {
    id: 'contribuir',
    n: '05',
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
          Uma introdução ao ecossistema, à prévia do ConsoloStruct e aos princípios que orientam o
          projeto.
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
              <Link className="text-link" to={a.to}>
                {a.action} <ArrowRight size={16} />
              </Link>
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
