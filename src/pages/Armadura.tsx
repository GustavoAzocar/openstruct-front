import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  FileStack,
  Layers,
  ListChecks,
  MousePointer2,
  PenTool,
  Ruler,
  Scissors,
  PanelRight,
  SquareDashed,
} from 'lucide-react';
import { site } from '../lib/config';

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
            <img src="/assets/armadurastruct-hephaestus.webp" alt="" width="56" height="56" />
            <strong>ArmaduraStruct</strong>
            <span>v{site.armVersion}</span>
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
              <Download size={18} /> Instalar pelo Launcher
            </Link>
            <a className="text-link" href="#editor">
              Explore o editor <ArrowDown size={17} />
            </a>
          </div>
          <div className="arm-hero-meta">
            <span>Windows + Linux</span>
            <span>Código aberto · GPLv3</span>
            <span>Arquivos locais</span>
          </div>
        </div>
        <figure className="arm-identity-art">
          <img
            src="/assets/armadurastruct-hephaestus.webp"
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
        <figure className="arm-editor-preview">
          <img
            src="/assets/armadurastruct-editor.webp"
            alt="Interface real do ArmaduraStruct: ferramentas CAD, desenho de armaduras, propriedades e quadro de aço"
            width="1600"
            height="1000"
            loading="lazy"
          />
          <figcaption>
            <span>CAPTURA DO APLICATIVO · EXEMPLO DE DETALHAMENTO</span>
            <span>v{site.armVersion}</span>
          </figcaption>
        </figure>
        <div className="arm-feature-grid">
          {features.map(({ Icon, title, text }) => (
            <article key={title}>
              <Icon size={25} strokeWidth={1.6} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="arm-workflow">
        <div className="container arm-workflow-inner">
          <div>
            <span className="eyebrow">02 / UM FLUXO CONTÍNUO</span>
            <h2>
              Abra. Detalhe.
              <br />
              Compartilhe.
            </h2>
            <p>A geometria, as posições e o quantitativo fazem parte do mesmo projeto.</p>
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
                'Leve o projeto adiante.',
                'Salve o projeto editável e exporte DXF, PDF A3 com escala selecionada e quadro de aço em CSV. Projetos antigos da série 0.1 são migrados ao abrir.',
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
      <section className="section container arm-downloads" id="downloads">
        <div>
          <span className="eyebrow">03 / VERSÃO ATUAL</span>
          <h2>
            Pronto para
            <br />
            começar um traço.
          </h2>
          <p>
            Instale pelo Struct Launcher para acompanhar as próximas versões, ou baixe diretamente o
            pacote do seu sistema.
          </p>
          <Link className="button button-primary" to="/launcher">
            Conheça o Launcher <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="arm-download-card">
          <span className="eyebrow">ARMADURASTRUCT {site.armVersion} · X86_64</span>
          <a
            className="button button-ink"
            href={`${site.armReleaseAssets}/armadurastruct-${site.armVersion}-windows-x86_64.exe`}
          >
            <Download size={18} /> Windows <span>.exe</span>
          </a>
          <a
            className="button button-outline"
            href={`${site.armReleaseAssets}/armadurastruct-${site.armVersion}-linux-x86_64.AppImage`}
          >
            <Download size={18} /> Linux <span>.AppImage</span>
          </a>
          <a className="text-link" href={site.armReleaseUrl} target="_blank" rel="noreferrer">
            Notas da versão e checksums <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <section className="section container faq-section arm-faq">
        <div>
          <span className="eyebrow">ANTES DE DETALHAR</span>
          <h2>Bom saber.</h2>
          <a
            className="text-link"
            href={`${site.armRepository}/blob/master/docs/GUIA.md`}
            target="_blank"
            rel="noreferrer"
          >
            <FileStack size={16} /> Guia do aplicativo <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="faq-list">
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
              Sim. O ArmaduraStruct é distribuído sob GPL-3.0-or-later, com instruções de
              desenvolvimento e testes no repositório.
            </p>
            <a className="text-link" href={site.armRepository} target="_blank" rel="noreferrer">
              Código no GitHub <ArrowUpRight size={15} />
            </a>
          </details>
        </div>
      </section>
    </>
  );
}
