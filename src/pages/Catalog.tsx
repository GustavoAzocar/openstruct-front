import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, useLocation, useNavigationType } from 'react-router-dom';
import { usePublicCatalog } from '../components/CatalogProvider';
import { defaultFilters, readFilters, writeFilters, selectCatalog } from '../lib/catalog-filters';
import type { CatalogFilters } from '../lib/catalog-filters';
import '../catalog-filters.css';
import { Search, ArrowRight } from 'lucide-react';
import { AppCard } from '../components/AppCard';
import { site } from '../lib/config';
import { apps } from '../lib/apps';
import { CatalogSyncStatus } from '../components/CatalogAvailability';

const categories = ['Todos', ...new Set(apps.map((app) => app.category))];
export function Catalog() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigation = useNavigationType();
  const editing = useRef(false);
  const [shareStatus, setShareStatus] = useState('');
  const { products } = usePublicCatalog();
  const filters = readFilters(params, categories);
  const { category, q: query } = filters;
  useEffect(() => {
    if (navigation === 'POP') editing.current = false;
    setShareStatus('');
  }, [location.key, navigation]);
  const update = (changes: Partial<CatalogFilters>, typing = false) => {
    const replace = typing && editing.current;
    editing.current = typing;
    const next = {
      ...readFilters(new URLSearchParams(window.location.search), categories),
      ...changes,
    };
    if (changes.future === false && next.availability === 'planned') next.availability = 'all';
    if (next.availability === 'planned') next.future = true;
    setParams(writeFilters(next), { replace, preventScrollReset: true });
  };
  const filtered = selectCatalog(apps, products, filters);
  const plannedCount = filtered.filter((app) => app.stage === 'planned').length;
  const share = async () => {
    try {
      const url = new URL(location.pathname, window.location.origin);
      url.search = writeFilters(filters).toString();
      await navigator.clipboard.writeText(url.href);
      setShareStatus('Link copiado.');
    } catch {
      setShareStatus('Não foi possível copiar. Copie o endereço na barra do navegador.');
    }
  };
  const clear = () => {
    editing.current = false;
    setParams(writeFilters(defaultFilters), { preventScrollReset: true });
  };
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
      <CatalogSyncStatus />
      <div className="catalog-controls">
        <div className="category-tabs" role="group" aria-label="Filtrar aplicativos por categoria">
          {categories.map((item) => (
            <button
              key={item}
              aria-pressed={category === item}
              onClick={() => update({ category: item })}
            >
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
            maxLength={200}
            onChange={(e) => update({ q: e.target.value }, true)}
            onBlur={() => {
              editing.current = false;
            }}
          />
        </label>
      </div>
      <div className="catalog-extra-filters">
        <label>
          Disponibilidade
          <select
            value={filters.availability}
            onChange={(e) =>
              update({
                availability: e.target.value as CatalogFilters['availability'],
              })
            }
          >
            <option value="all">Todos os estados</option>
            <option value="available">Com pacote confirmado</option>
            <option value="unconfirmed">Sem pacote confirmado</option>
            <option value="planned">Em planejamento</option>
          </select>
        </label>
        <label>
          Plataforma
          <select
            value={filters.platform}
            onChange={(e) => update({ platform: e.target.value as CatalogFilters['platform'] })}
          >
            <option value="all">Todas as plataformas</option>
            <option value="windows">Windows</option>
            <option value="linux">Linux</option>
          </select>
        </label>
        <label className="catalog-future">
          <input
            type="checkbox"
            checked={filters.future}
            onChange={(e) => update({ future: e.target.checked })}
          />
          Mostrar horizonte futuro
        </label>
        <button className="button button-outline" onClick={clear}>
          Limpar filtros
        </button>
        <button className="button button-outline" onClick={() => void share()}>
          Copiar link da seleção
        </button>
      </div>
      <p role="status">{shareStatus}</p>
      <p className="catalog-order">
        Ordem: pacotes confirmados, demais aplicativos e planejamento; dentro de cada grupo, ordem
        do ecossistema. Plataformas usam apenas pacotes do catálogo validado, inclusive dados
        identificados como desatualizados.
      </p>
      <p className="result-count" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'} nesta seleção ·{' '}
        {filtered.length - plannedCount}{' '}
        {filtered.length - plannedCount === 1 ? 'aplicativo' : 'aplicativos'} · {plannedCount} em
        planejamento
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
          <p>
            Tente outro nome, categoria ou plataforma. Projetos planejados não possuem pacotes ou
            plataformas confirmados; para vê-los, remova o filtro de plataforma e mostre o horizonte
            futuro.
          </p>
          <button className="button button-outline" onClick={clear}>
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
        <Link to={`${site.developmentPath}#repositories`} className="button button-ink">
          Compartilhe uma ideia <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
}
