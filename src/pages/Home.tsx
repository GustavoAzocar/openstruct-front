import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  GitFork,
  MoveUpRight,
  Sparkles,
  Download,
} from 'lucide-react';
import { Mark } from '../components/Brand';
import { AppCard } from '../components/AppCard';
import { CorbelModel } from '../components/CorbelModel';
import { ModelPreview } from '../components/ModelPreview';
import { useExperience } from '../components/Experience';
import { site } from '../lib/config';
import { currentApps, currentAppNames, getCurrentApp } from '../lib/apps';
import { AppStatus } from '../components/AppStatus';
import { CatalogSyncStatus } from '../components/CatalogAvailability';

const consolo = getCurrentApp('consolostruct');
const mola = getCurrentApp('molastruct');

export function Home() {
  const { launch, community } = useExperience();
  return (
    <>
      <section className="home-hero container">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="tiny-cross">✳</span> FERRAMENTAS ABERTAS PARA ENGENHARIA
          </div>
          <h1>
            Engenharia
            <br />
            <span className="blue-text">aberta.</span>
            <span className="hero-period" aria-hidden="true">
              ↗
            </span>
          </h1>
          <p>
            Boas ferramentas ampliam possibilidades. Estamos construindo um novo jeito de calcular,
            compreender e detalhar estruturas.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/launcher">
              Baixar o launcher <Download size={18} />
            </Link>
            <Link className="button button-plain" to="/apps">
              Explore os aplicativos <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-meta">
            <span>
              <i /> Código aberto
            </span>
            <span>Feito para engenharia</span>
            <span>Construído em comunidade</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <span className="hero-coordinate">ESTRUTURA / CONEXÃO / POSSIBILIDADE</span>
          <div className="hero-drawing">
            <CorbelModel />
          </div>
          <div className="hero-app-stamp">
            <img src={consolo.image} alt={consolo.imageAlt} width="110" height="110" />
            <div>
              <span>PRIMEIRO APLICATIVO</span>
              <strong>{consolo.name}</strong>
              <Link to={consolo.route}>
                Conheça <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <div className="hero-art-caption">
            <span>01 / PRÉVIA SVG · SEM CÁLCULO</span>
            <MoveUpRight size={18} />
          </div>
        </div>
      </section>
      <div className="principle-strip">
        <div className="container">
          <span>O conhecimento avança quando é compartilhado.</span>
          <a href={site.repository} target="_blank" rel="noreferrer">
            <GitFork size={16} /> Conheça o projeto no GitHub <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
      <section className="section container" id="aplicativos">
        <div className="section-kicker">
          <span>01 / O ECOSSISTEMA</span>
          <span>DA IDEIA AO DETALHE</span>
        </div>
        <div className="section-heading">
          <h2>
            Várias ferramentas.
            <br />
            Uma mesma ideia.
          </h2>
          <div>
            <p>
              Um ecossistema para diferentes etapas do projeto, conectado pela liberdade de explorar
              e construir.
            </p>
            <Link className="text-link" to="/apps">
              Todos os aplicativos <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <CatalogSyncStatus />
        <div className="home-app-grid">
          {currentApps.map((app, i) => (
            <AppCard key={app.id} app={app} featured={i === 0} />
          ))}
        </div>
        <p className="catalog-note">
          <Sparkles size={15} /> Um ecossistema em construção. Conheça {currentAppNames}.
        </p>
      </section>
      <section className="consolo-spotlight">
        <div className="container">
          <div className="section-kicker">
            <span>02 / EM DESTAQUE</span>
            <span>{consolo.name.toUpperCase()}</span>
          </div>
          <div className="spotlight-layout">
            <div className="spotlight-copy">
              <span className="pill">CONCRETO ARMADO</span>
              <h2>
                Um pequeno apoio.
                <br />
                Muitas possibilidades.
              </h2>
              <p>
                O {consolo.name} reúne geometria, verificações de ELU, memória de cálculo e
                detalhamento com quadro de aço. Explore o escopo da versão publicada e instale o
                aplicativo para trabalhar com seus projetos.
              </p>
              <Link className="button button-ink" to="/launcher">
                Instalar pelo Launcher <Download size={17} />
              </Link>
              <span className="spotlight-note">
                <AppStatus app={consolo} />
              </span>
              <Link className="text-link consolo-release-link" to={consolo.route}>
                Recursos, documentação e limites <ArrowRight size={16} />
              </Link>
            </div>
            <div className="spotlight-preview">
              <ModelPreview simple />
            </div>
          </div>
        </div>
      </section>
      <section className="mola-discovery container" aria-labelledby="mola-discovery-title">
        <img src={mola.image} alt={mola.imageAlt} width="112" height="112" loading="lazy" />
        <div>
          <span className="eyebrow">
            {mola.name.toUpperCase()} / {mola.category.toUpperCase()}
          </span>
          <h2 id="mola-discovery-title">Da fundação ao modelo estrutural.</h2>
          <p>
            Geometria, sondagem e características do solo como ponto de partida para estimar a
            rigidez do apoio.
          </p>
        </div>
        <Link className="text-link" to={mola.route}>
          Conheça o {mola.name} <ArrowUpRight size={17} />
        </Link>
      </section>
      <section className="container home-launcher" aria-labelledby="home-launcher-title">
        <Mark />
        <div>
          <span className="eyebrow">STRUCT LAUNCHER / WINDOWS + LINUX</span>
          <h2 id="home-launcher-title">Seu ecossistema, no seu computador.</h2>
          <p>
            Instale os aplicativos disponíveis, organize sua biblioteca e acompanhe as novas versões
            em um só lugar.
          </p>
        </div>
        <Link className="button button-primary" to="/launcher">
          Conheça e baixe <Download size={17} />
        </Link>
      </section>
      <section className="section container principles-section" id="principios">
        <div className="section-kicker">
          <span>03 / O QUE NOS MOVE</span>
          <span>ABERTO POR PRINCÍPIO</span>
        </div>
        <div className="section-heading">
          <h2>
            Entender faz parte
            <br />
            de projetar.
          </h2>
          <p>
            Acreditamos em ferramentas que aproximam o engenheiro do raciocínio por trás de cada
            resultado.
          </p>
        </div>
        <div className="principles-grid">
          {[
            {
              n: 'A',
              Icon: BookOpen,
              title: 'Conhecimento à vista.',
              copy: 'Métodos, hipóteses e exemplos devem fazer parte da experiência. Transparência para estudar, revisar e evoluir.',
            },
            {
              n: 'B',
              Icon: Code2,
              title: 'Liberdade para construir.',
              copy: 'Código aberto para conhecer por dentro, adaptar ao seu contexto e participar dos próximos capítulos.',
            },
            {
              n: 'C',
              Icon: MoveUpRight,
              title: 'Engenharia que se conecta.',
              copy: 'Ferramentas com uma linguagem comum, pensadas para aproximar o cálculo, o modelo e o desenho.',
            },
          ].map(({ n, Icon, title, copy }) => (
            <article key={n}>
              <div className="principle-card-top">
                <span>{n}</span>
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="community-banner container">
        <div className="community-banner-content">
          <span className="eyebrow">FEITO EM PÚBLICO. CONSTRUÍDO EM CONJUNTO.</span>
          <h2>
            A próxima boa ideia
            <br />
            pode ser a sua.
          </h2>
          <p>
            Teste, questione, documente, desenhe ou programe. Existem muitas formas de fazer parte.
          </p>
          <div className="button-row">
            <Link className="button button-paper" to="/community">
              Faça parte do projeto <ArrowUpRight size={17} />
            </Link>
            <button className="button button-outline-light" onClick={community}>
              Conversar no Discord <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
        <div className="community-symbol" aria-hidden="true">
          <Mark monochrome />
        </div>
      </section>
      <section className="section container faq-section">
        <div>
          <span className="eyebrow">ANTES DE COMEÇAR</span>
          <h2>
            Algumas respostas.
            <br />
            Novas possibilidades.
          </h2>
          <Link className="text-link" to="/docs">
            Explore a documentação <ArrowRight size={17} />
          </Link>
        </div>
        <div className="faq-list">
          <details>
            <summary>
              O que é o OpenStruct?<span>+</span>
            </summary>
            <p>
              É um ecossistema em desenvolvimento de ferramentas abertas para engenharia estrutural.
              A proposta reúne aplicativos especializados, documentação e espaço para colaboração.
            </p>
          </details>
          <details>
            <summary>
              Por qual aplicativo posso começar?<span>+</span>
            </summary>
            <p>
              Conheça {currentAppNames}. Os produtos publicados podem ser instalados pelo Launcher;
              cada página apresenta os recursos, a documentação e os limites de uso.{' '}
              {currentApps.map((app) => (
                <span key={app.id}>
                  <Link to={app.route}>Conhecer o {app.name}.</Link>{' '}
                </span>
              ))}
            </p>
          </details>
          <details>
            <summary>
              Preciso instalar alguma coisa?<span>+</span>
            </summary>
            <p>
              Para explorar o site e as prévias, basta o navegador. Para instalar os aplicativos no
              computador, conheça o <Link to="/launcher">Struct Launcher para Windows e Linux</Link>
              .
            </p>
          </details>
          <details>
            <summary>
              Como posso contribuir?<span>+</span>
            </summary>
            <p>
              Compartilhe sugestões, relate problemas, proponha melhorias na documentação ou
              contribua com código. <Link to="/community">Veja como participar.</Link>
            </p>
          </details>
        </div>
      </section>
      <div className="last-call container">
        <span>Seu próximo ponto de partida.</span>
        <button onClick={launch}>
          Explore o OpenStruct <ArrowUpRight />
        </button>
      </div>
    </>
  );
}
