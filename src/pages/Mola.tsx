import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Box,
  Layers3,
  Ruler,
  MoveHorizontal,
  RotateCcw,
  FileText,
  GitFork,
  Download,
} from 'lucide-react';
import { FoundationPreview } from '../components/FoundationPreview';
import { useExperience } from '../components/Experience';
import { site } from '../lib/config';

const features = [
  {
    Icon: Box,
    title: 'Comece pela fundação.',
    text: 'Definição da geometria do elemento de fundação, considerando sapatas e blocos sobre estacas.',
  },
  {
    Icon: Layers3,
    title: 'Traga o solo para o modelo.',
    text: 'Perfil de sondagem e características do solo como informações de entrada para a estimativa.',
  },
  {
    Icon: MoveHorizontal,
    title: 'Estime a rigidez à translação.',
    text: 'Um apoio à definição das molas que representam a deformabilidade do conjunto fundação + solo.',
  },
  {
    Icon: RotateCcw,
    title: 'Considere a rotação.',
    text: 'Estimativas de rigidez à rotação para apoiar decisões sobre a representação das fundações na análise estrutural.',
  },
  {
    Icon: Ruler,
    title: 'Explore os recalques.',
    text: 'Para sapatas, o escopo inclui estimativa do recalque vertical com base na Teoria da Elasticidade.',
  },
  {
    Icon: FileText,
    title: 'Organize as verificações.',
    text: 'Informações de capacidade de carga e tensões de ruptura, de acordo com os métodos previstos para cada tipo de fundação.',
  },
];

export function Mola() {
  const { community } = useExperience();
  return (
    <>
      <section className="product-hero container mola-product-hero">
        <Link className="back-link" to="/apps">
          <ArrowLeft size={15} /> Todos os aplicativos
        </Link>
        <div className="product-identity">
          <img
            src="/assets/molastruct-gaia.webp"
            alt="Ícone do MolaStruct: figura da Terra sustentando uma mola e uma fundação em gravura sobre fundo cobalto"
            width="90"
            height="90"
          />
          <div>
            <span className="eyebrow">02 / FUNDAÇÕES</span>
            <h1>MolaStruct</h1>
          </div>
          <span className="status status-active">
            <i /> Disponível para desktop
          </span>
        </div>
        <div className="product-intro">
          <h2>
            Uma base melhor
            <br />
            para suas decisões.
          </h2>
          <div>
            <p>
              Uma ferramenta aberta em desenvolvimento para auxiliar na estimativa da rigidez do
              conjunto fundação + solo e na sua representação na análise estrutural.
            </p>
            <div className="button-row">
              <a
                className="button button-primary"
                href={site.molaAppUrl || '#visao-geral'}
                {...(site.molaAppUrl ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {site.molaAppUrl ? 'Abrir MolaStruct' : 'Conheça a proposta'}{' '}
                <ArrowUpRight size={17} />
              </a>
              <a
                className="button button-outline"
                href={site.molaAppRepository || site.repository}
                target="_blank"
                rel="noreferrer"
              >
                <GitFork size={17} /> Acompanhe o projeto
              </a>
            </div>
            <span className="product-meta">Fundações · Rigidez · Interação solo-estrutura</span>
          </div>
        </div>
      </section>
      <section className="container mola-overview" id="visao-geral">
        <FoundationPreview />
        <div className="demo-caption">
          <span>Explore sapatas e blocos com 1, 2, 3 ou 4 estacas.</span>
          <span>Esquema de apresentação · Sem cálculo de rigidez</span>
        </div>
      </section>
      <section className="section container">
        <div className="section-kicker">
          <span>01 / UM PONTO DE PARTIDA</span>
          <span>GEOMETRIA + SONDAGEM + SOLO</span>
        </div>
        <div className="section-heading">
          <h2>
            O que acontece na base
            <br />
            importa para a estrutura.
          </h2>
          <p>
            O objetivo é oferecer uma forma simples de reunir as informações da fundação e do solo
            para apoiar a tomada de decisão do projetista.
          </p>
        </div>
        <div className="mola-inputs">
          {[
            {
              n: '01',
              title: 'Geometria da fundação',
              text: 'Tipo e dimensões do elemento. Para blocos, a configuração das estacas.',
            },
            {
              n: '02',
              title: 'Perfil de sondagem',
              text: 'Informações do terreno organizadas a partir do perfil de investigação.',
            },
            {
              n: '03',
              title: 'Características do solo',
              text: 'Parâmetros necessários às estimativas, conforme o método adotado.',
            },
          ].map((item) => (
            <article key={item.n}>
              <span>{item.n}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mola-foundations">
        <div className="container">
          <div className="section-kicker">
            <span>02 / TIPOS DE FUNDAÇÃO</span>
            <span>DUAS FRENTES, UMA MESMA PROPOSTA</span>
          </div>
          <div className="mola-foundation-grid">
            <article>
              <span className="pill">FUNDAÇÕES SUPERFICIAIS</span>
              <h2>Sapatas.</h2>
              <p>
                Estimativa do recalque vertical pela Teoria da Elasticidade, além das rigidezes e
                informações de tensão de ruptura previstas no escopo.
              </p>
              <ul>
                <li>Geometria da fundação e características do solo.</li>
                <li>Rigidezes à translação e à rotação.</li>
                <li>Terzaghi, Vesic e correlações com SPT para as estimativas de ruptura.</li>
              </ul>
            </article>
            <article>
              <span className="pill">BLOCOS SOBRE ESTACAS</span>
              <h2>De uma a quatro estacas.</h2>
              <p>
                Configurações de blocos com 1, 2, 3 ou 4 estacas, conectando a geometria do conjunto
                às informações do terreno.
              </p>
              <div
                className="pile-number-strip"
                aria-label="Configurações previstas: 1, 2, 3 e 4 estacas"
              >
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
              <p>
                O método Aoki–Velloso integra o escopo para a estimativa da capacidade de carga das
                estacas.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-kicker">
          <span>03 / RECURSOS PREVISTOS</span>
          <span>RIGIDEZ, RECALQUE E CAPACIDADE DE CARGA</span>
        </div>
        <div className="section-heading">
          <h2>
            Do terreno
            <br />
            ao apoio estrutural.
          </h2>
          <p>
            Este é o escopo inicial do MolaStruct. Os detalhes de entrada, resultados e aplicação
            dos métodos serão apresentados conforme o desenvolvimento avançar.
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
      <section className="container mola-methods" id="metodos">
        <span className="eyebrow">04 / MÉTODOS DO ESCOPO INICIAL</span>
        <h2>
          Uma estimativa com
          <br />
          um caminho definido.
        </h2>
        <div className="mola-method-groups">
          <article>
            <span className="eyebrow">RIGIDEZ E DEFORMABILIDADE</span>
            <h3>Mindlin · Steinbrenner · Winkler</h3>
            <p>
              Referências previstas para a representação da deformabilidade e para as estimativas do
              conjunto fundação + solo. Para o recalque vertical de sapatas, a proposta utiliza a
              Teoria da Elasticidade.
            </p>
          </article>
          <article>
            <span className="eyebrow">CAPACIDADE DE CARGA E RUPTURA</span>
            <h3>Aoki–Velloso · Terzaghi · Vesic · SPT</h3>
            <p>
              Aoki–Velloso para a capacidade de carga das estacas; Terzaghi, Vesic e correlações com
              SPT para as estimativas de tensão de ruptura em sapatas.
            </p>
          </article>
        </div>
        <p className="mola-reference-note">
          A descrição inicial também menciona a ABNT NBR 6122:1996 como referência histórica. Os
          critérios, as hipóteses e as edições normativas de implementação serão especificados na
          documentação técnica.
        </p>
      </section>
      <section className="section container">
        <div className="section-kicker">
          <span>05 / ACOMPANHE A CONSTRUÇÃO</span>
          <span>MOLASTRUCT / OPENSTRUCT</span>
        </div>
        <div className="access-grid">
          <article className="access-main">
            <span className="pill">UM NOVO APLICATIVO OPENSTRUCT</span>
            <h2>
              Uma fundação
              <br />
              para novas possibilidades.
            </h2>
            <p>
              O MolaStruct já tem sua primeira versão desktop publicada. Use o Struct Launcher para
              instalar o aplicativo e acompanhar as próximas versões.
            </p>
            {site.molaAppUrl ? (
              <a
                className="button button-primary"
                href={site.molaAppUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir MolaStruct <ArrowUpRight size={17} />
              </a>
            ) : (
              <Link className="button button-primary" to="/launcher">
                Instalar pelo launcher <Download size={17} />
              </Link>
            )}
          </article>
          <article className="access-secondary">
            <Download size={27} strokeWidth={1.5} />
            <h3>Também disponível diretamente.</h3>
            <p>
              Prefere instalar somente o MolaStruct? Os instaladores de cada versão e a documentação
              estão disponíveis no repositório do aplicativo.
            </p>
            {site.molaDownloadUrl ? (
              <a className="text-link" href={site.molaDownloadUrl} target="_blank" rel="noreferrer">
                Baixar MolaStruct <ArrowUpRight size={16} />
              </a>
            ) : (
              <button className="text-link" onClick={community}>
                Acompanhe as novidades <ArrowRight size={16} />
              </button>
            )}
            <div className="source-note">
              <GitFork size={18} />
              <a href={site.molaAppRepository || site.repository} target="_blank" rel="noreferrer">
                Veja o projeto no GitHub <ArrowUpRight size={14} />
              </a>
            </div>
          </article>
        </div>
      </section>
      <section className="product-community mola-community container">
        <div>
          <span className="eyebrow">CONSTRUA COM A GENTE</span>
          <h2>
            Que apoio falta
            <br />
            no seu dia a dia?
          </h2>
        </div>
        <div>
          <p>
            Compartilhe um caso, uma sugestão ou uma dúvida sobre a representação das fundações no
            modelo estrutural.
          </p>
          <Link className="button button-ink" to="/community">
            Participe do MolaStruct <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
