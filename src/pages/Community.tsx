import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  GitFork,
  MessageCircle,
  GitPullRequest,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { Mark } from '../components/Brand';
import { useExperience } from '../components/Experience';
import { site } from '../lib/config';

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
          <a
            href={site.repository}
            target="_blank"
            rel="noreferrer"
            className="button button-primary"
          >
            <GitFork size={18} /> Encontre o projeto <ArrowUpRight size={16} />
          </a>
          <button className="button button-outline" onClick={community}>
            <MessageCircle size={18} /> Comunidade no Discord
          </button>
        </div>
        <Mark className="community-hero-mark" monochrome />
      </section>
      <section className="contribution-grid">
        {[
          {
            Icon: Lightbulb,
            title: 'Compartilhe uma ideia.',
            copy: 'Conte o que faz falta no seu fluxo de trabalho. Um caso real ajuda a dar direção ao projeto.',
            label: 'Propor uma melhoria',
            url: `${site.repository}/issues/new?labels=enhancement`,
          },
          {
            Icon: MessageCircle,
            title: 'Ajude a enxergar melhor.',
            copy: 'Encontrou um problema? Descreva como aconteceu e o que você esperava encontrar.',
            label: 'Relatar um problema',
            url: `${site.repository}/issues/new?labels=bug`,
          },
          {
            Icon: GitPullRequest,
            title: 'Construa uma parte.',
            copy: 'Código, testes, interface ou acessibilidade: contribuições de diferentes tamanhos são bem-vindas.',
            label: 'Conhecer o código',
            url: site.repository,
          },
          {
            Icon: BookOpen,
            title: 'Torne o caminho mais claro.',
            copy: 'Um exemplo, uma explicação ou uma revisão podem fazer diferença para quem está chegando.',
            label: 'Explorar a documentação',
            to: '/docs',
          },
        ].map(({ Icon, title, copy, label, url, to }) => (
          <article key={title}>
            <Icon size={28} strokeWidth={1.5} />
            <h2>{title}</h2>
            <p>{copy}</p>
            {to ? (
              <Link className="text-link" to={to}>
                {label} <ArrowRight size={16} />
              </Link>
            ) : (
              <a className="text-link" href={url} target="_blank" rel="noreferrer">
                {label} <ArrowUpRight size={16} />
              </a>
            )}
          </article>
        ))}
      </section>
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
