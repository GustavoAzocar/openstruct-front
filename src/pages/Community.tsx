import { PublicGithubStatus } from '../components/PublicGithubStatus';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, GitPullRequest, BookOpen, Lightbulb } from 'lucide-react';
import { Mark } from '../components/Brand';
import { useExperience } from '../components/Experience';
import { site } from '../lib/config';
import { FirstContributions } from '../components/FirstContributions';
import { Contributors } from '../components/Contributors';

export function Community() {
  const { community } = useExperience();
  return (
    <div className="container">
      <section className="page-hero community-hero">
        <span className="eyebrow">UM PROJETO ABERTO PRECISA DE PESSOAS</span>
        <h1>
          Engenharia se constrói
          <br />
          <span className="blue-text">em conjunto.</span>
        </h1>
        <p>
          Experiência de projeto, olhar crítico, uma boa pergunta. Traga o que você sabe e ajude a
          construir o próximo capítulo.
        </p>
        <div className="button-row">
          <a href="#para-comecar" className="button button-outline">
            Para começar <ArrowRight size={17} />
          </a>
          <Link to={site.developmentPath} className="button button-primary">
            Acompanhar desenvolvimento <ArrowRight size={17} />
          </Link>
          <Link to={site.developmentPath + '#roadmap'} className="button button-outline">
            Roadmap público
          </Link>
          <button className="button button-outline" onClick={community}>
            <MessageCircle size={18} /> Comunidade no Discord
          </button>
        </div>
        <Mark className="community-hero-mark" monochrome />
      </section>
      <FirstContributions />
      <section className="contribution-grid">
        {[
          {
            Icon: Lightbulb,
            title: 'Compartilhe uma ideia.',
            copy: 'Escolha o aplicativo na central e conte o que faz falta no seu fluxo de trabalho. Um caso real ajuda a dar direção ao projeto.',
            label: 'Propor uma melhoria',
            to: `${site.developmentPath}#repositories`,
          },
          {
            Icon: MessageCircle,
            title: 'Ajude a enxergar melhor.',
            copy: 'Encontre o repositório do aplicativo na central e descreva como o problema aconteceu e o que você esperava encontrar.',
            label: 'Relatar um problema',
            to: `${site.developmentPath}#repositories`,
          },
          {
            Icon: GitPullRequest,
            title: 'Construa uma parte.',
            copy: 'Código, testes, interface ou acessibilidade: contribuições de diferentes tamanhos são bem-vindas.',
            label: 'Conhecer o código',
            to: `${site.developmentPath}#repositories`,
          },
          {
            Icon: BookOpen,
            title: 'Torne o caminho mais claro.',
            copy: 'Um exemplo, uma explicação ou uma revisão podem fazer diferença para quem está chegando.',
            label: 'Explorar a documentação',
            to: '/docs',
          },
        ].map(({ Icon, title, copy, label, to }) => (
          <article key={title}>
            <Icon size={28} strokeWidth={1.5} />
            <h2>{title}</h2>
            <p>{copy}</p>
            <Link className="text-link" to={to}>
              {label} <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </section>
      <PublicGithubStatus />
      <Contributors />
      <section className="community-note">
        <span className="eyebrow">NOSSO PONTO EM COMUM</span>
        <h2>
          Curiosidade para entender.
          <br />
          Generosidade para compartilhar.
        </h2>
        <p>
          O OpenStruct está no começo. É uma boa hora para chegar perto, acompanhar as decisões e
          ajudar a transformar possibilidades em ferramentas.
        </p>
      </section>
    </div>
  );
}

export function NotFound() {
  return (
    <section className="container not-found">
      <span className="eyebrow">404 / UM CAMINHO AINDA NÃO CONSTRUÍDO</span>
      <Mark />
      <h1>
        Vamos encontrar
        <br />
        outro ponto de apoio?
      </h1>
      <p>Esta página não existe. Os aplicativos e a documentação estão logo ali.</p>
      <div className="button-row">
        <Link to="/" className="button button-primary">
          Voltar ao início <ArrowRight size={17} />
        </Link>
        <Link to="/apps" className="button button-outline">
          Explorar aplicativos
        </Link>
      </div>
    </section>
  );
}
