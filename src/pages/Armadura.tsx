import { CaptureGallery } from '../components/CaptureGallery';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  FileInput,
  FileOutput,
  FileStack,
  Layers,
  ListChecks,
  MousePointer2,
  PenTool,
  Ruler,
  Scissors,
  PanelRight,
  SquareDashed,
  Save,
} from 'lucide-react';
import { getCurrentApp } from '../lib/apps';
import { ProductAvailability } from '../components/CatalogAvailability';
import { ProductInstallation } from '../components/ProductInstallation';
import { LAUNCHER_INSTALL_LABEL } from '../lib/installation';
import { armaduraScreenshot } from '../lib/product-media';

const app = getCurrentApp('armadurastruct');
const release = app.distribution;
const sources = {
  guide: app.documentation.url,
  license: app.license.url,
  development: app.repository.url + '/blob/' + app.code.ref + '/CHANGELOG.md',
};

const features = [
  {
    Icon: PenTool,
    title: 'Desenhe o aço.',
    text: 'Barras livres, estribos retangulares, repetição de estribos e faixas por espaçamento e armaduras acompanhando a fôrma com cobrimento.',
  },
  {
    Icon: Layers,
    title: 'Trabalhe sobre a fôrma.',
    text: 'Abra DXF e DWG como máscaras. Ajuste unidade, escala, posição, camadas e opacidade sem alterar o desenho de origem.',
  },
  {
    Icon: ListChecks,
    title: 'Mantenha tudo vinculado.',
    text: 'Posições, diâmetros, quantidades e comprimentos alimentam o quadro de aço. Vistas rebatidas continuam ligadas à barra original.',
  },
  {
    Icon: PanelRight,
    title: 'Mais espaço para o CAD.',
    text: 'Faixa compacta e um painel lateral com abas Projeto e Propriedades. Recolha os comandos ou ative o modo Foco no CAD.',
  },
  {
    Icon: Ruler,
    title: 'Detalhes que acompanham a posição.',
    text: 'Cotas ortogonais e alinhadas, chamadas e cortes gráficos com identificação vinculada às barras. Tudo segue para o DXF e o PDF.',
  },
  {
    Icon: Scissors,
    title: 'Edite e confira.',
    text: 'Converta polilinhas, divida barras com traspasse informado e una geometrias compatíveis. Bloqueie, atualize e renumere a relação de aço.',
  },
];

export function Armadura() {
  return (
    <>
      <section className="container arm-hero">
        <div>
          <Link className="text-link" to="/apps">
            Aplicativos <ArrowRight size={15} /> Detalhamento
          </Link>
          <div className="arm-product-name">
            <img src={app.image} alt="" width="56" height="56" />
            <strong>{app.name}</strong>
            {release && <span>v{release.version} · conteúdo</span>}
          </div>
          <h1>
            Da fôrma
            <br />
            ao <span className="blue-text">aço.</span>
          </h1>
          <p>
            Um ambiente CAD feito para desenhar armaduras. Barras, estribos e quadro de aço
            conectados, do primeiro traço ao detalhe.
          </p>
          <div className="button-row">
            <Link className="button button-primary" to="/launcher">
              <Download size={18} /> {LAUNCHER_INSTALL_LABEL}
            </Link>
            <a className="text-link" href="#editor">
              Explore o editor <ArrowDown size={17} />
            </a>
          </div>
          <div className="arm-hero-meta">
            <span>Windows + Linux</span>
            <a href={sources.license} target="_blank" rel="noreferrer">
              Licença do aplicativo · {app.license.spdx}
            </a>
            <span>Arquivos locais</span>
          </div>
        </div>
        <figure className="arm-identity-art">
          <img
            src={app.image}
            alt="Hefesto em gravura trabalhando uma armadura de aço sobre fundo âmbar, ícone do ArmaduraStruct"
            width="768"
            height="768"
          />
          <figcaption>
            <span>ARMADURA / FORMA / PRECISÃO</span>
            <ArrowUpRight size={18} />
          </figcaption>
        </figure>
      </section>
      <div className="container">
        <ProductAvailability app={app} />
      </div>
      <div className="arm-feature-strip">
        <div className="container">
          <span>
            <MousePointer2 size={17} /> Ambiente CAD 2D
          </span>
          <span>
            <SquareDashed size={17} /> Máscaras DXF + DWG
          </span>
          <span>
            <ListChecks size={17} /> Quadro de aço automático
          </span>
        </div>
      </div>
      <section className="section container" id="editor">
        <div className="section-kicker">
          <span>01 / SEU ESPAÇO DE DESENHO</span>
          <span>DO TRAÇO AO QUANTITATIVO</span>
        </div>
        <div className="section-heading">
          <h2>
            O detalhe encontra
            <br />
            seu lugar.
          </h2>
          <p>
            Ferramentas de armadura em uma faixa compacta, um único painel com abas e mais área
            livre para desenhar. Cotas, chamadas e quantitativos fazem parte do mesmo ambiente.
          </p>
        </div>
        <CaptureGallery
          label="Capturas do ArmaduraStruct"
          captures={[
            {
              ...armaduraScreenshot,
              id: 'armadura-editor',
              title: 'Editor de armaduras.',
              caption:
                'Captura real da versão 0.2.0: barras longitudinais, estribo N3, cotas e propriedades do exemplo V01.',
              sourceUrl: armaduraScreenshot.source.url,
            },
          ]}
        />
        <div className="arm-feature-grid">
          {features.map(({ Icon, title, text }) => (
            <article key={title}>
              <Icon size={25} strokeWidth={1.6} />
              <h3>{title}</h3>
              <p>{text}</p>
              <a
                className="text-link arm-source-link"
                href={sources.guide}
                target="_blank"
                rel="noreferrer"
              >
                Conferir no guia da 0.2 <ArrowUpRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="arm-workflow">
        <div className="container arm-workflow-inner">
          <div>
            <span className="eyebrow">02 / UM FLUXO CONTÍNUO</span>
            <h2>
              Importe. Detalhe.
              <br />
              Confira. Exporte.
            </h2>
            <p>Máscara, armaduras e quantitativos permanecem no mesmo projeto editável.</p>
          </div>
          <ol>
            {[
              [
                'Importe a referência.',
                'Abra uma máscara DXF ou DWG e confira suas unidades. A leitura acontece localmente, no seu computador.',
              ],
              [
                'Construa o detalhamento.',
                'Use snap e modo ortogonal. Crie barras e estribos, edite diâmetros, copie, rotacione, espelhe e organize as posições.',
              ],
              [
                'Confira os quantitativos.',
                'Revise posições, quantidades, comprimentos geométricos e pesos teóricos. Se bloquear a relação de aço, atualize-a antes de exportar.',
              ],
              [
                'Leve o projeto adiante.',
                'Salve o projeto editável no formato armadurastruct/2. Exporte DXF, PDF A3 com escala selecionada e quadro de aço em CSV.',
              ],
            ].map(([title, text], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section container arm-files" id="arquivos">
        <div className="section-kicker">
          <span>03 / ENTRADAS E SAÍDAS</span>
          <span>FORMATO ARMADURASTRUCT/2</span>
        </div>
        <div className="section-heading">
          <h2>
            Referência para entrar.
            <br />
            Projeto para continuar.
          </h2>
          <p>
            DXF e DWG entram como máscaras. O arquivo editável conserva o modelo do aplicativo; DXF,
            PDF e CSV são entregas sem todos os vínculos paramétricos do projeto.
          </p>
        </div>
        <div className="arm-files-grid">
          <article>
            <FileInput size={25} strokeWidth={1.6} />
            <span className="eyebrow">ENTRADAS / MÁSCARAS</span>
            <h3>DXF ASCII e DWG.</h3>
            <p>
              Importe como referência 2D, confira o relatório de entidades e meça uma distância
              conhecida. Quando não houver unidade declarada, o aplicativo assume 1 unidade = 1 mm e
              avisa; escala, posição, rotação, camadas e opacidade podem ser ajustadas.
            </p>
            <p className="arm-file-limit">
              DWG depende da versão e das entidades reconhecidas pelo LibreDWG. Xrefs, objetos
              proxy, hachuras, splines, sólidos 3D, estilos e layouts não têm reprodução integral.
            </p>
          </article>
          <article>
            <Save size={25} strokeWidth={1.6} />
            <span className="eyebrow">FONTE EDITÁVEL</span>
            <h3>.armstruct.json · armadurastruct/2.</h3>
            <p>
              Preserva barras, anotações, relação de aço e máscaras normalizadas. Os bytes originais
              do CAD não são incorporados. Projetos da série 0.1 são migrados ao abrir; aplicativos
              antigos não abrem o formato 2.
            </p>
            <p className="arm-file-limit">
              Guarde o JSON junto das entregas. Ele é o arquivo para continuar editando o projeto.
            </p>
          </article>
          <article>
            <FileOutput size={25} strokeWidth={1.6} />
            <span className="eyebrow">SAÍDAS / ENTREGA</span>
            <h3>DXF · PDF A3 · CSV.</h3>
            <p>
              O DXF usa entidades CAD simples e curvas discretizadas; não há exportação DWG. O PDF
              usa escala selecionada ou ajuste à folha, com quadro nas páginas seguintes. O CSV leva
              o quadro de aço para conferência e continuidade do processo.
            </p>
            <p className="arm-file-limit">
              Imprima o PDF em 100%. DXF e PDF não conservam os vínculos próprios do projeto JSON.
            </p>
          </article>
        </div>
        <div className="arm-files-note">
          <strong>Unidades e responsabilidade.</strong>
          <p>
            Coordenadas e geometria são trabalhadas em mm; cotas gráficas aparecem em cm e
            comprimentos do quadro em m. O traspasse é informado manualmente e somado às duas peças.
            Dimensionamento, ancoragem, cobrimento, dobras mínimas, perdas e verificações normativas
            continuam sob responsabilidade do projetista.
          </p>
          <a className="text-link" href={sources.guide} target="_blank" rel="noreferrer">
            Convenções e compatibilidade da versão 0.2 <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <section className="container arm-development" id="desenvolvimento">
        <span className="eyebrow">MASTER / FORA DO INSTALADOR {release?.version}</span>
        <h2>A branch de desenvolvimento avançou.</h2>
        <p>
          A master consultada mantém o número de pacote 0.2.0, mas já documenta recursos posteriores
          à tag distribuída: hierarquia de pavimentos, elementos e detalhamentos; edição isolada de
          conjuntos; gerenciador de pranchas, folhas e vistas; composição vetorial em papel; e
          migração até o formato <code>armadurastruct/5</code>.
        </p>
        <p>
          Esses recursos não descrevem o instalador público 0.2.0 e não são representados pela
          captura desta página. Eles passam para a seção disponível somente quando uma nova release
          e o catálogo correspondente forem confirmados.
        </p>
        <a className="text-link" href={sources.development} target="_blank" rel="noreferrer">
          Histórico do código em desenvolvimento <ArrowUpRight size={15} />
        </a>
      </section>
      <section className="section container arm-downloads" id="downloads">
        <div>
          <span className="eyebrow">04 / COMECE PELO LAUNCHER</span>
          <h2>
            Pronto para
            <br />
            começar um traço.
          </h2>
          <p>
            Encontre o ArmaduraStruct na biblioteca do Struct Launcher. Instale o aplicativo e
            acompanhe as próximas versões em um só lugar.
          </p>
        </div>
        <ProductInstallation app={app} />
      </section>
      <section className="section container faq-section arm-faq">
        <div>
          <span className="eyebrow">ANTES DE DETALHAR</span>
          <h2>Bom saber.</h2>
          <a className="text-link" href={app.documentation.url} target="_blank" rel="noreferrer">
            <FileStack size={16} /> Guia do aplicativo <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="faq-list">
          <details>
            <summary>
              Qual arquivo devo guardar para continuar editando?<span>+</span>
            </summary>
            <p>
              Guarde o <code>.armstruct.json</code> no formato <code>armadurastruct/2</code>. Ele
              preserva o modelo e as máscaras normalizadas. DXF, PDF e CSV são saídas de entrega e
              não substituem o projeto editável.
            </p>
          </details>
          <details>
            <summary>
              O que faz esta versão?<span>+</span>
            </summary>
            <p>
              Desenha e organiza armaduras em 2D, calcula comprimentos geométricos e quantitativos e
              gera saídas vinculadas. O traspasse é informado pelo projetista e contabilizado nas
              duas peças; não é dimensionado automaticamente. As verificações normativas, as
              ancoragens e os ajustes de fabricação permanecem sob definição do projetista.
            </p>
          </details>
          <details>
            <summary>
              Como funcionam DXF e DWG?<span>+</span>
            </summary>
            <p>
              Os arquivos são referências de desenho, usadas como máscaras. As entidades compatíveis
              são convertidas para visualização 2D; o importador informa entidades ignoradas.
              Confira escala, unidades e geometria após importar. A exportação CAD desta versão é
              DXF.
            </p>
          </details>
          <details>
            <summary>
              Meus desenhos são enviados para um servidor?<span>+</span>
            </summary>
            <p>
              O editor processa os projetos e as máscaras localmente. Você salva o arquivo editável
              no seu computador e escolhe quais saídas compartilhar.
            </p>
          </details>
          <details>
            <summary>
              Posso estudar e modificar o código?<span>+</span>
            </summary>
            <p>
              Sim. O {app.name} é distribuído sob {app.license.spdx}, com instruções de
              desenvolvimento e testes no repositório. Essa é a licença do aplicativo; ela não é
              generalizada para os demais projetos do ecossistema ou para o frontend do site.
            </p>
            <a className="text-link" href={sources.license} target="_blank" rel="noreferrer">
              Licença da versão distribuída <ArrowUpRight size={15} />
            </a>
          </details>
        </div>
      </section>
    </>
  );
}
