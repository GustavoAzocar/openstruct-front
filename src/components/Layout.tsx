import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, GitFork, Menu, Moon, Sun, X, ArrowRight, Download } from 'lucide-react';
import { Brand, Mark } from './Brand';
import { useExperience } from './Experience';
import { site } from '../lib/config';
import { currentApps } from '../lib/apps';

export function Layout() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  const { launch, community } = useExperience();
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }),
      );
    } else window.scrollTo({ top: 0, behavior: 'instant' });
    const page =
      location.pathname === '/'
        ? 'Engenharia aberta.'
        : (currentApps.find((app) => app.route === location.pathname)?.name ??
          (location.pathname === '/apps'
            ? 'Aplicativos'
            : location.pathname === '/launcher'
              ? 'Struct Launcher'
              : location.pathname === '/docs'
                ? 'Documentação'
                : location.pathname === '/community'
                  ? 'Comunidade'
                  : location.pathname === site.developmentPath
                    ? 'Central de desenvolvimento'
                    : 'Página não encontrada'));
    document.title = `${page} — OpenStruct`;
  }, [location.pathname, location.hash]);
  function changeTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try {
      localStorage.setItem('openstruct-theme-v1', next ? 'dark' : 'light');
    } catch {
      /* Preferência apenas desta sessão. */
    }
  }
  const close = () => setOpen(false);
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner container">
          <Link
            className="brand-link"
            to="/"
            onClick={close}
            aria-label="OpenStruct, página inicial"
          >
            <Brand />
          </Link>
          <nav
            className={`main-nav ${open ? 'is-open' : ''}`}
            aria-label="Navegação principal"
            id="main-navigation"
          >
            <NavLink to="/apps" onClick={close}>
              Aplicativos
            </NavLink>
            <NavLink to="/docs" onClick={close}>
              Documentação
            </NavLink>
            <NavLink to="/community" onClick={close}>
              Comunidade
            </NavLink>
            <NavLink to={site.developmentPath} onClick={close}>
              Desenvolvimento
            </NavLink>
            <a href={site.repository} target="_blank" rel="noreferrer" onClick={close}>
              GitHub <ArrowUpRight size={13} />
            </a>
            <Link to="/launcher" className="button button-primary mobile-launch" onClick={close}>
              Baixar Launcher <Download size={15} />
            </Link>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button theme-button"
              onClick={changeTheme}
              aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link to="/launcher" className="button button-primary desktop-launch">
              Baixar Launcher <Download size={16} />
            </Link>
            <button
              className="icon-button menu-toggle"
              aria-controls="main-navigation"
              aria-expanded={open}
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="conteudo">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-intro">
              <Link to="/" className="brand-link" aria-label="OpenStruct, início">
                <Brand />
              </Link>
              <p>
                Ferramentas abertas.
                <br />
                Novas formas de fazer engenharia.
              </p>
              <a className="text-link" href={site.repository} target="_blank" rel="noreferrer">
                <GitFork size={17} /> Construído em público <ArrowUpRight size={15} />
              </a>
            </div>
            <div>
              <span className="footer-heading">ECOSSISTEMA</span>
              <Link to="/apps">Todos os aplicativos</Link>
              {currentApps.map((app) => (
                <Link to={app.route} key={app.id}>
                  {app.name}
                </Link>
              ))}
              <Link to="/launcher">Baixar o Struct Launcher</Link>
              <button onClick={launch}>
                Abrir aplicativos <ArrowUpRight size={13} />
              </button>
            </div>
            <div>
              <span className="footer-heading">EXPLORE</span>
              <Link to="/docs">Documentação</Link>
              <Link to={site.developmentPath}>Central de desenvolvimento</Link>
              <Link to="/docs#principios">Princípios</Link>
              <a href="/assets/openstruct-mark.svg" download>
                Marca em SVG <ArrowUpRight size={13} />
              </a>
            </div>
            <div>
              <span className="footer-heading">CONSTRUA COM A GENTE</span>
              <a href={site.repository} target="_blank" rel="noreferrer">
                GitHub <ArrowUpRight size={13} />
              </a>
              <button onClick={community}>
                Discord <ArrowUpRight size={13} />
              </button>
              <Link to="/community">
                Como contribuir <ArrowRight size={13} />
              </Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} OpenStruct.</span>
            <span className="footer-note">
              <Mark monochrome /> Feito por quem gosta de entender como funciona.
            </span>
            <a href={`${site.repository}/blob/master/LICENSE`} target="_blank" rel="noreferrer">
              Código aberto / MIT <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
