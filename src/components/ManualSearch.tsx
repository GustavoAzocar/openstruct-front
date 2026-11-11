import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Link, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { manualSystems, publicManualEditions } from '../lib/manual-chapters';
import {
  highlightManualText,
  MANUAL_SEARCH_QUERY_LIMIT,
  MANUAL_SEARCH_RESULT_LIMIT,
  searchManualSections,
} from '../lib/manual-search';
import type { ManualSearchSection } from '../lib/manual-search';
import './manual-search.css';

const allSystems = 'todos';
const systems = manualSystems.map((system) => ({ system, editions: publicManualEditions(system) }));
const bySystem = new Map(systems.map((entry) => [entry.system.id, entry]));
const currentIndexKey = systems
  .flatMap(({ system }) =>
    system.currentEditionId ? [`${system.id}/${system.currentEditionId}`] : [],
  )
  .join('|');

type LoadedIndex = { key: string; sections: ManualSearchSection[] | null };

async function loadSections(key: string) {
  const { default: loaders } = await import('virtual:manual-search');
  const partitions = await Promise.all(key.split('|').map((id) => loaders[id]()));
  return partitions.flat();
}

function Highlight({ text, query }: { text: string; query: string }) {
  return highlightManualText(text, query).map((part, index) =>
    part.match ? <mark key={index}>{part.text}</mark> : part.text,
  );
}

export function ManualSearch({ scope }: { scope?: { systemId: string; editionId?: string } }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const queryId = useId();
  const scopeId = useId();
  const input = useRef<HTMLInputElement>(null);
  const pendingSearch = useRef<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedIndex>();

  const params = new URLSearchParams(location.search);
  const query = (params.get('q') ?? '').slice(0, MANUAL_SEARCH_QUERY_LIMIT);
  const [draft, setDraft] = useState(query);
  const requestedSystem = params.get('sistema');
  const systemId =
    requestedSystem && (requestedSystem === allSystems || bySystem.has(requestedSystem))
      ? requestedSystem
      : (scope?.systemId ?? allSystems);
  const selection = bySystem.get(systemId);
  const requestedEdition = params.get('edicao');
  const routeEdition =
    !requestedSystem && scope?.systemId === systemId ? scope.editionId : undefined;
  const edition =
    selection?.editions.find(({ id }) => id === requestedEdition) ??
    selection?.editions.find(
      ({ id }) => id === (routeEdition ?? selection.system.currentEditionId),
    );
  const editionOptions = selection?.editions ?? [];
  const canChooseEdition = editionOptions.length > 1 || (!edition && editionOptions.length > 0);
  const hasQuery = query.trim().length > 0;
  const indexKey = !hasQuery
    ? ''
    : systemId === allSystems
      ? currentIndexKey
      : edition
        ? `${systemId}/${edition.id}`
        : '';

  useEffect(() => {
    // A navegação atualiza a URL em transição. Digitação em andamento continua síncrona.
    const pending = pendingSearch.current;
    if (navigationType === 'REPLACE' && pending !== null && pending !== location.search.slice(1))
      return;
    pendingSearch.current = null;
    setDraft(query);
  }, [location.search, location.key, navigationType, query]);

  useEffect(() => {
    if (!indexKey) return;
    let active = true;
    void loadSections(indexKey).then(
      (sections) => {
        if (active) setLoaded({ key: indexKey, sections });
      },
      () => {
        if (active) setLoaded({ key: indexKey, sections: null });
      },
    );
    return () => {
      active = false;
    };
  }, [indexKey]);

  const sections = loaded?.key === indexKey ? loaded.sections : undefined;
  const results = useMemo(
    () => (sections ? searchManualSections(sections, query) : []),
    [sections, query],
  );
  const failed = hasQuery && Boolean(indexKey) && sections === null;
  const loading = Boolean(indexKey) && sections === undefined;
  let message = '';
  if (hasQuery) {
    if (loading) message = 'Carregando índice de busca…';
    else if (failed) message = 'Não foi possível carregar o índice de busca.';
    else if (!indexKey) message = 'Nenhuma edição disponível neste escopo.';
    else if (results.length === 0)
      message = 'Nenhum resultado. Tente outro termo ou amplie o escopo.';
    else if (results.length === 1) message = '1 resultado';
    else
      message = `${results.length} resultados${results.length === MANUAL_SEARCH_RESULT_LIMIT ? ' exibidos' : ''}`;
  }

  function updateSearch(values: { q?: string; sistema?: string; edicao?: string }) {
    const next = new URLSearchParams(pendingSearch.current ?? location.search);
    for (const [name, value] of Object.entries(values)) {
      if (value) next.set(name, value);
      else next.delete(name);
    }
    const search = next.toString();
    pendingSearch.current = search;
    navigate(
      { pathname: location.pathname, search, hash: location.hash },
      { replace: true, preventScrollReset: true },
    );
  }

  function clear() {
    setDraft('');
    updateSearch({ q: '' });
    input.current?.focus();
  }

  function focusCurrentAnchor(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;

    const { pathname, hash } = new URL(event.currentTarget.href);
    if (pathname !== location.pathname || !hash || hash !== location.hash) return;

    requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target?.closest('.manual-reading-content')) return;
      if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'instant' });
    });
  }

  return (
    <search className="manual-search" aria-label="Busca nos manuais">
      <div className="manual-search-fields">
        <div className="manual-search-query">
          <label htmlFor={queryId}>Buscar nos manuais</label>
          <div className="manual-search-input">
            <Search size={18} aria-hidden="true" />
            <input
              id={queryId}
              ref={input}
              type="search"
              autoComplete="off"
              placeholder="Memória de cálculo"
              value={draft}
              maxLength={MANUAL_SEARCH_QUERY_LIMIT}
              aria-describedby={scopeId}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setDraft(value);
                updateSearch({ q: value });
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && draft && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  clear();
                }
              }}
            />
          </div>
        </div>
        <label className="manual-search-filter">
          Sistema
          <select
            value={systemId}
            onChange={(event) => updateSearch({ sistema: event.currentTarget.value, edicao: '' })}
          >
            <option value={allSystems}>Todos os manuais</option>
            {systems.map(({ system }) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
        </label>
        {canChooseEdition && (
          <label className="manual-search-filter">
            Edição
            <select
              value={edition?.id ?? ''}
              onChange={(event) => updateSearch({ edicao: event.currentTarget.value })}
            >
              {!edition && (
                <option value="" disabled>
                  Edição vigente indisponível
                </option>
              )}
              {editionOptions.map(({ id, title }) => (
                <option key={id} value={id}>
                  {title} · {id === selection?.system.currentEditionId ? 'Vigente' : 'Histórica'}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="manual-search-summary">
        <p id={scopeId} className={canChooseEdition ? 'sr-only' : 'manual-search-scope'}>
          {systemId === allSystems
            ? 'Edições vigentes'
            : edition
              ? `${edition.title} · ${edition.id === selection?.system.currentEditionId ? 'Vigente' : 'Histórica'}`
              : 'Edição vigente indisponível'}
        </p>
        {draft && (
          <button className="manual-search-clear" type="button" onClick={clear}>
            Limpar busca
          </button>
        )}
      </div>
      <p className="manual-search-status" role="status">
        {message}
      </p>
      {failed && (
        <button
          className="manual-search-clear"
          type="button"
          onClick={() => window.location.reload()}
        >
          Recarregar para tentar novamente
        </button>
      )}
      {results.length > 0 && (
        <ol className="manual-search-results" role="list">
          {results.map(({ section, snippet }) => (
            <li key={section.href}>
              <p className="manual-search-result-meta">
                {section.systemName} · {section.editionTitle}
                {section.appVersion && ` · Aplicativo ${section.appVersion}`}
                {section.historical && ' · Histórica'}
                {section.chapterStatus === 'sample' && ' · Amostra'}
              </p>
              <Link
                className="manual-search-result-link"
                to={section.href}
                state={{ manualSearchOrigin: location.key }}
                onClick={focusCurrentAnchor}
              >
                <span>
                  <Highlight text={section.chapterTitle} query={query} />
                  {section.sectionTitle !== section.chapterTitle && (
                    <>
                      {' '}
                      › <Highlight text={section.sectionTitle} query={query} />
                    </>
                  )}
                </span>
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <p className="manual-search-snippet">
                <Highlight text={snippet} query={query} />
              </p>
            </li>
          ))}
        </ol>
      )}
    </search>
  );
}
