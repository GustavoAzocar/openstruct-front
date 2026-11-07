import { useState } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { AppCard } from '../components/AppCard';
import { site } from '../lib/config';
import { apps } from '../lib/apps';

const categories = ['Todos', ...new Set(apps.map((app) => app.category))];
export function Catalog() {
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const filtered = apps.filter(
    (app) =>
      (category === 'Todos' || app.category === category) &&
      `${app.name} ${app.description} ${app.category}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(
          query
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase(),
        ),
  );
  return (
    <div className="container">
      <section className="page-hero">
        <span className="eyebrow">O ECOSSISTEMA OPENSTRUCT</span>
        <h1>
          Uma ferramenta para
          <br />
          cada nova possibilidade.
        </h1>
        <p>
          Aplicativos especializados, uma linguagem em comum. Conheça os projetos em desenvolvimento
          e o que está no nosso horizonte.
        </p>
      </section>
      <div className="catalog-controls">
        <div className="category-tabs" role="group" aria-label="Filtrar aplicativos por categoria">
          {categories.map((item) => (
            <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label="Buscar aplicativos"
            placeholder="Buscar aplicativo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="result-count" aria-live="polite">
        {filtered.length}{' '}
        {filtered.length === 1 ? 'aplicativo no horizonte' : 'aplicativos no horizonte'}
      </p>
      <div className="catalog-grid">
        {filtered.map((app) => (
          <AppCard app={app} key={app.id} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state">
          <Search size={30} />
          <h2>Nenhum aplicativo por aqui.</h2>
          <p>Tente outro nome ou explore todas as categorias.</p>
          <button
            className="button button-outline"
            onClick={() => {
              setQuery('');
              setCategory('Todos');
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
      <section className="catalog-bottom">
        <div>
          <span className="eyebrow">O PRÓXIMO CAPÍTULO</span>
          <h2>Sentiu falta de uma ferramenta?</h2>
          <p>O ecossistema está em construção. Conte o que faria diferença no seu trabalho.</p>
        </div>
        <a
          href={`${site.repository}/issues/new`}
          target="_blank"
          rel="noreferrer"
          className="button button-ink"
        >
          Compartilhe uma ideia <ArrowUpRight size={17} />
        </a>
      </section>
    </div>
  );
}
