import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  Grid2X2,
  Package,
  RefreshCw,
} from 'lucide-react';
import { Mark } from '../components/Brand';
import { LauncherDownloads } from '../components/LauncherDownloads';
import { apps } from '../lib/config';
import { LAUNCHER_RELEASES_URL } from '../lib/launcher';

export function Launcher() {
  return (
    <>
      <section className="container launcher-hero">
        <div className="launcher-hero-copy">
          <span className="eyebrow">OPENSTRUCT / WINDOWS + LINUX</span>
          <div className="launcher-product-name">
            <Mark /> Struct Launcher
          </div>
          <h1>
            Grandes ideias.
            <br />
            <span className="blue-text">Um só lugar.</span>
          </h1>
          <p>
            Seus aplicativos de engenharia, por perto. Descubra, instale e acompanhe as atualizações
            do ecossistema OpenStruct no seu computador.
          </p>
          <div className="button-row">
            <a className="button button-primary" href="#downloads">
              <Download size={18} /> Baixar o launcher
            </a>
            <a className="text-link" href="#como-funciona">
              Conheça a experiência <ArrowDown size={16} />
            </a>
          </div>
          <div className="launcher-hero-meta">
            <span>Projetos no seu computador</span>
            <span>Atualizações sob seu controle</span>
          </div>
        </div>
        <div
          className="launcher-library-preview"
          aria-label="Representação da biblioteca do Struct Launcher"
        >
          <div className="launcher-preview-bar">
            <span>
              <Mark /> STRUCT LAUNCHER
            </span>
            <span>VISÃO DA BIBLIOTECA</span>
          </div>
          <div className="launcher-preview-body">
            <span className="eyebrow">SEU ESPAÇO DE ENGENHARIA</span>
            <h2>
              Ferramentas abertas.
              <br />
              <span className="blue-text">Novas possibilidades.</span>
            </h2>
            <div className="launcher-preview-apps">
              {apps
                .filter((app) => app.route)
                .map((app) => (
                  <div className="launcher-preview-app" key={app.id}>
                    <img src={app.image} alt="" width="68" height="68" />
                    <div>
                      <strong>{app.name}</strong>
                      <span>{app.category}</span>
                    </div>
                    <span className="launcher-preview-status">
                      {app.id === 'molastruct' ? 'Disponível' : 'Em desenvolvimento'}
                    </span>
                  </div>
                ))}
            </div>
            <div className="launcher-preview-bottom">
              <Grid2X2 size={15} /> Uma biblioteca para construir suas ideias{' '}
              <ArrowUpRight size={15} />
            </div>
          </div>
          <div className="launcher-preview-accent" aria-hidden="true">
            <Mark monochrome />
          </div>
        </div>
      </section>
      <div className="launcher-feature-strip">
        <div className="container">
          <span>
            <Package size={16} /> Instale os aplicativos
          </span>
          <span>
            <Grid2X2 size={16} /> Organize sua biblioteca
          </span>
          <span>
            <RefreshCw size={16} /> Acompanhe novas versões
          </span>
        </div>
      </div>
      <section className="section container launcher-start" id="como-funciona">
        <div className="section-kicker">
          <span>01 / DO DOWNLOAD AO PROJETO</span>
          <span>SEM COMPLICAÇÃO</span>
        </div>
        <div className="section-heading">
          <h2>
            Instale uma vez.
            <br />
            Explore a partir daqui.
          </h2>
          <p>
            O launcher reúne o acesso aos aplicativos. Cada ferramenta tem sua própria versão e
            documentação.
          </p>
        </div>
        <div className="launcher-steps">
          {[
            {
              n: '01',
              title: 'Baixe para seu sistema.',
              text: 'Escolha Windows ou Linux e instale o Struct Launcher no seu computador.',
            },
            {
              n: '02',
              title: 'Encontre sua ferramenta.',
              text: 'Explore a biblioteca, veja os detalhes e instale os aplicativos disponíveis.',
            },
            {
              n: '03',
              title: 'Continue evoluindo.',
              text: 'Receba os avisos de novas versões e escolha quando atualizar seus aplicativos.',
            },
          ].map((step) => (
            <article key={step.n}>
              <span>{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="launcher-download-section">
        <div className="container">
          <LauncherDownloads />
        </div>
      </div>
      <section className="section container launcher-install" id="instalacao">
        <div>
          <span className="eyebrow">02 / PRIMEIRA INSTALAÇÃO</span>
          <h2>
            Seu próximo
            <br />
            ponto de partida.
          </h2>
          <p>
            Depois de abrir o launcher, use a biblioteca para instalar os aplicativos. O MolaStruct
            já tem sua primeira versão publicada; o ConsoloStruct está em preparação.
          </p>
          <Link className="text-link" to="/apps">
            Conheça os aplicativos <ArrowRight size={16} />
          </Link>
        </div>
        <div className="launcher-install-guides">
          <article>
            <span className="eyebrow">WINDOWS / INSTALADOR .EXE</span>
            <h3>Baixe, execute e abra.</h3>
            <p>
              Execute o instalador e siga as etapas. A instalação padrão é por usuário. Depois, abra
              o Struct Launcher pelo atalho criado.
            </p>
          </article>
          <article>
            <span className="eyebrow">LINUX / APPIMAGE</span>
            <h3>Permita a execução e abra.</h3>
            <p>
              Nas propriedades do AppImage, marque a opção de permitir a execução como programa.
              Abra o arquivo e mantenha-o em uma pasta sua. Algumas distribuições podem solicitar o
              suporte a AppImage/FUSE.
            </p>
          </article>
        </div>
      </section>
      <section className="section container faq-section launcher-faq">
        <div>
          <span className="eyebrow">ANTES DE COMEÇAR</span>
          <h2>Bom saber.</h2>
          <a className="text-link" href={LAUNCHER_RELEASES_URL} target="_blank" rel="noreferrer">
            Todos os lançamentos <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="faq-list">
          <details>
            <summary>
              Preciso de uma conta?<span>+</span>
            </summary>
            <p>
              Os downloads e o uso do launcher não exigem uma conta GitHub. Os aplicativos e seus
              projetos ficam no seu computador.
            </p>
          </details>
          <details>
            <summary>
              Como chegam as atualizações?<span>+</span>
            </summary>
            <p>
              O launcher verifica novas versões ao abrir e periodicamente, conforme suas
              preferências. Quando houver atualização, você escolhe quando instalar. A atualização
              do próprio launcher também é apresentada no aplicativo.
            </p>
          </details>
          <details>
            <summary>
              Quais sistemas são atendidos?<span>+</span>
            </summary>
            <p>
              Nesta etapa, os pacotes são para Windows e Linux em computadores x86_64. A página
              oferece os dois formatos para você escolher o sistema de destino.
            </p>
          </details>
          <details>
            <summary>
              Quando o ConsoloStruct fica disponível?<span>+</span>
            </summary>
            <p>
              O aplicativo está na revisão da sua primeira versão desktop. Ele aparecerá para
              instalação na biblioteca depois da publicação dos instaladores. Enquanto isso, conheça
              sua página e a prévia visual.
            </p>
            <Link className="text-link" to="/apps/consolostruct">
              Conhecer o ConsoloStruct <ArrowRight size={15} />
            </Link>
          </details>
        </div>
      </section>
    </>
  );
}
