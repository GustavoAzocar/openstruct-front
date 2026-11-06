import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Search, BookOpen } from 'lucide-react';
import { site } from '../lib/config';

const articles = [
  {
    id: 'launcher',
    n: '01',
    title: 'Struct Launcher: instalação e atualizações',
    body: 'Baixe o launcher para Windows ou Linux x86_64. No Windows, execute o instalador; no Linux, permita a execução do AppImage e abra o arquivo. A biblioteca apresenta os aplicativos disponíveis para instalar e avisa sobre novas versões. Você escolhe quando atualizar.',
    action: 'Baixar e conhecer o launcher',
    to: '/launcher',
  },
  {
    id: 'primeiros-passos',
    n: '02',
    title: 'Primeiros passos',
    body: 'Comece pelo catálogo de aplicativos. ConsoloStruct, MolaStruct e ArmaduraStruct possuem páginas próprias, com suas propostas, representações visuais, recursos em desenvolvimento e formas de acompanhar os projetos.',
    action: 'Explore os aplicativos',
    to: '/apps',
  },
  {
    id: 'previa',
    n: '03',
    title: 'Explore a prévia visual',
    body: 'Na demonstração do ConsoloStruct, alterne entre Modelo, Armaduras e Detalhe. Ajuste a projeção do consolo e separe as camadas para entender a organização da peça. Esta demonstração altera apenas o desenho: não realiza cálculo, dimensionamento ou verificação estrutural.',
    action: 'Abrir a demonstração',
    to: '/apps/consolostruct#demonstracao',
  },
  {
    id: 'principios',
    n: '04',
    title: 'Princípios do ecossistema',
    body: 'O OpenStruct propõe ferramentas transparentes, com métodos, hipóteses, unidades e limites de aplicação apresentados junto aos resultados. Documentação, exemplos de referência e revisão fazem parte do desenvolvimento, assim como a interface e o código.',
    action: 'Participe da construção',
    to: '/community',
  },
  {
    id: 'unidades',
    n: '05',
    title: 'Unidades e representação',
    body: 'A prévia do ConsoloStruct apresenta dimensões em centímetros. O modelo é uma representação esquemática, sem escala de impressão. O aplicativo definitivo terá sua própria documentação técnica, com convenções, modelos de cálculo e exemplos de uso.',
    action: 'Explore a prévia',
    to: '/apps/consolostruct#demonstracao',
  },
  {
    id: 'molastruct',
    n: '06',
    title: 'MolaStruct: fundação + solo',
    body: 'O MolaStruct está sendo desenvolvido para auxiliar na estimativa da rigidez à translação e à rotação do conjunto fundação + solo. O escopo inicial reúne geometria da fundação, perfil de sondagem e características do solo, contemplando sapatas e blocos com 1, 2, 3 ou 4 estacas. A página apresenta os métodos previstos e um esquema conceitual que não executa cálculos.',
    action: 'Conheça o MolaStruct',
    to: '/apps/molastruct',
  },
  {
    id: 'armadurastruct',
    n: '07',
    title: 'ArmaduraStruct: desenho e quadro de aço',
    body: 'Importe DXF ou DWG como máscara, confira as unidades e desenhe barras e estribos com as ferramentas CAD. Vistas rebatidas e quantitativos permanecem vinculados às posições. Salve o projeto editável e exporte DXF, PDF ou CSV. A primeira versão trabalha com comprimentos geométricos, sem dimensionamento ou verificações normativas.',
    action: 'Conheça o ArmaduraStruct e seu guia',
    to: '/apps/armadurastruct',
  },
  {
    id: 'contribuir',
    n: '08',
    title: 'Como contribuir',
    body: 'Descreva o contexto da sua ideia ou problema, o comportamento esperado e, quando possível, um exemplo que ajude a reproduzir a situação. Sugestões sobre clareza, documentação, acessibilidade e fluxo de trabalho também são contribuições importantes.',
    action: 'Veja as formas de participar',
    to: '/community',
  },
];

export function Docs() {
  const [query, setQuery] = useState('');
  const normalized = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const filtered = articles.filter((a) =>
    `${a.title} ${a.body}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(normalized),
  );
  return (
    <div className="container">
      <section className="page-hero docs-hero">
        <span className="eyebrow">DOCUMENTAÇÃO / UM CONHECIMENTO COMPARTILHADO</span>
        <h1>
          Entenda por onde
          <br />
          começar.
        </h1>
        <p>
          Uma introdução ao ecossistema, ao ConsoloStruct, ao MolaStruct, ao ArmaduraStruct e aos
          princípios que orientam o projeto.
        </p>
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Buscar na documentação"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você quer explorar?"
          />
        </label>
      </section>
      <div className="docs-layout">
        <aside className="docs-nav">
          <span className="eyebrow">NESTA PÁGINA</span>
          {articles.map((a) => (
            <a href={`#${a.id}`} key={a.id} onClick={() => setQuery('')}>
              <span>{a.n}</span>
              {a.title}
            </a>
          ))}
          <a
            className="docs-repo"
            href={`${site.repository}#readme`}
            target="_blank"
            rel="noreferrer"
          >
            Documentação do código <ArrowUpRight size={15} />
          </a>
        </aside>
        <div className="docs-articles">
          <span className="sr-only" aria-live="polite">
            {filtered.length} tópicos encontrados
          </span>
          {filtered.map((a) => (
            <article id={a.id} key={a.id}>
              <span className="eyebrow">GUIA / {a.n}</span>
              <h2>{a.title}</h2>
              <p>{a.body}</p>
              <Link className="text-link" to={a.to}>
                {a.action} <ArrowRight size={16} />
              </Link>
            </article>
          ))}
          {!filtered.length && (
            <div className="empty-state">
              <BookOpen size={30} />
              <h2>Vamos tentar outro assunto?</h2>
              <p>Nenhum tópico corresponde à sua busca.</p>
              <button className="button button-outline" onClick={() => setQuery('')}>
                Ver todos os tópicos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
