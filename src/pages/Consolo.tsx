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
  Globe,
  Download,
} from 'lucide-react';
import { ModelPreview } from '../components/ModelPreview';
import { useExperience } from '../components/Experience';
import { site } from '../lib/config';

const features = [
  {
    Icon: Box,
    title: 'Comece pela geometria.',
    text: 'Uma experiência paramétrica para explorar a forma do consolo e sua conexão com o pilar.',
  },
  {
    Icon: Layers3,
    title: 'Veja a armadura por dentro.',
    text: 'Um espaço visual para organizar tirantes, estribos e armaduras de suspensão.',
  },
  {
    Icon: SlidersHorizontal,
    title: 'Explore possibilidades.',
    text: 'Um fluxo pensado para comparar configurações, incluindo a possibilidade de tirante duplo.',
  },
  {
    Icon: Ruler,
    title: 'Avance até o detalhe.',
    text: 'Desenhos com vistas, cortes, cotas e identificação das barras como parte do fluxo de trabalho.',
  },
  {
    Icon: Table2,
    title: 'Organize o aço.',
    text: 'Um quadro de aço conectado às peças detalhadas, reunindo posições, quantidades e comprimentos.',
  },
  {
    Icon: FileText,
    title: 'Registre o raciocínio.',
    text: 'Documentação e apresentação dos resultados para tornar o caminho do projeto mais claro.',
  },
];

export function Consolo() {
  const { community, launch } = useExperience();
  return (
    <>
      <section className="product-hero container">
        <Link className="back-link" to="/apps">
          <ArrowLeft size={15} /> Todos os aplicativos
        </Link>
        <div className="product-identity">
          <img
            src="/assets/consolostruct-atlas.webp"
            alt="Ícone do ConsoloStruct, Atlas em gravura sobre fundo laranja"
            width="90"
            height="90"
          />
          <div>
            <span className="eyebrow">01 / CONCRETO ARMADO</span>
            <h1>ConsoloStruct</h1>
          </div>
          <span className="status status-active">
            <i /> Em desenvolvimento
          </span>
        </div>
        <div className="product-intro">
          <h2>
            Pequeno apoio.
            <br />
            Grande responsabilidade.
          </h2>
          <div>
            <p>
              Uma ferramenta aberta em desenvolvimento para conectar o estudo de consolos de
              concreto armado ao modelo, à armadura e ao detalhamento.
            </p>
            <div className="button-row">
              <a className="button button-primary" href="#demonstracao">
                Explore a demonstração <ArrowUpRight size={17} />
              </a>
              <a
                className="button button-outline"
                href={site.appRepository || site.repository}
                target="_blank"
                rel="noreferrer"
              >
                <GitFork size={17} /> Acompanhe o projeto
              </a>
            </div>
            <span className="product-meta">Web · Código aberto · Um aplicativo OpenStruct</span>
          </div>
        </div>
      </section>
      <section className="container product-demo" id="demonstracao">
        <ModelPreview />
        <div className="demo-caption">
          <span>Explore as vistas e ajuste a projeção do consolo.</span>
          <span>Prévia visual da experiência · Sem cálculo estrutural</span>
        </div>
      </section>
      <section className="section container">
        <div className="section-kicker">
          <span>01 / A IDEIA POR TRÁS DO APLICATIVO</span>
          <span>UM FLUXO CONECTADO</span>
        </div>
        <div className="section-heading">
          <h2>
            Do primeiro modelo
            <br />
            ao último detalhe.
          </h2>
          <p>
            Estes são os recursos que orientam o desenvolvimento do ConsoloStruct. A prévia acima
            demonstra a apresentação visual.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ Icon, title, text }, i) => (
            <article key={title}>
              <div className="feature-top">
                <Icon size={24} strokeWidth={1.5} />
                <span>0{i + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="product-workflow">
        <div className="container">
          <div className="section-kicker">
            <span>02 / UM CAMINHO PARA O PROJETO</span>
            <span>MODELO → ARMADURA → DESENHO</span>
          </div>
          <div className="workflow-header">
            <h2>
              Uma decisão
              <br />
              conversa com a próxima.
            </h2>
            <Link className="text-link" to="/docs">
              Conheça os princípios <ArrowRight size={17} />
            </Link>
          </div>
          <div className="workflow-grid">
            {[
              {
                n: '01',
                title: 'Defina o problema.',
                text: 'Geometria, materiais e ações organizados desde o início.',
              },
              {
                n: '02',
                title: 'Entenda a solução.',
                text: 'Modelo e armadura visualizados no contexto da peça.',
              },
              {
                n: '03',
                title: 'Comunique o projeto.',
                text: 'Detalhes e informações preparados para uma leitura clara.',
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
      <section className="section container" id="acesso">
        <div className="section-kicker">
          <span>03 / COMECE POR AQUI</span>
          <span>CONSOLOSTRUCT</span>
        </div>
        <div className="access-grid">
          <article className="access-main">
            <span className="pill">
              <Globe size={14} /> NO NAVEGADOR
            </span>
            <h2>
              Explore o que
              <br />
              estamos construindo.
            </h2>
            <p>
              A prévia está disponível aqui mesmo. Acompanhe a evolução do aplicativo e ajude a
              definir os próximos passos.
            </p>
            <button className="button button-primary" onClick={launch}>
              {site.appUrl ? 'Abrir ConsoloStruct' : 'Explorar a prévia'} <ArrowUpRight size={17} />
            </button>
          </article>
          <article className="access-secondary">
            <Download size={27} strokeWidth={1.5} />
            <h3>Novas formas de usar.</h3>
            <p>
              As opções de instalação e distribuição serão apresentadas conforme o aplicativo
              evoluir.
            </p>
            {site.downloadUrl ? (
              <a href={site.downloadUrl} className="text-link" target="_blank" rel="noreferrer">
                Baixar aplicativo <ArrowUpRight size={16} />
              </a>
            ) : (
              <button className="text-link" onClick={community}>
                Acompanhe as novidades <ArrowRight size={16} />
              </button>
            )}
            <div className="source-note">
              <GitFork size={18} />
              <a href={site.appRepository || site.repository} target="_blank" rel="noreferrer">
                Veja o projeto no GitHub <ArrowUpRight size={14} />
              </a>
            </div>
          </article>
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
          <p>O próximo avanço pode começar com um exemplo, uma dúvida ou uma sugestão sua.</p>
          <Link className="button button-ink" to="/community">
            Faça parte do ConsoloStruct <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
