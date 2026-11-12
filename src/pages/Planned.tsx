import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getPlannedApp } from '../lib/apps';
import { AppStatus } from '../components/AppStatus';
import '../planned.css';

function PlannedProduct({ app }: { app: ReturnType<typeof getPlannedApp> }) {
  return (
    <section className="product-hero container planned-product">
      <Link className="back-link" to="/apps?future=1">
        <ArrowLeft size={15} /> Todos os aplicativos
      </Link>
      <div className="product-identity">
        <div>
          <span className="eyebrow">
            {app.number} / {app.category}
          </span>
          <h1>{app.name}</h1>
        </div>
        <AppStatus app={app} />
      </div>
      <div className="planned-intro">
        <div>
          <span className="eyebrow">NO HORIZONTE DO OPENSTRUCT</span>
          <h2>{app.description}</h2>
          <p className="planned-stage">Desenvolvimento não iniciado.</p>
          <p>
            Uma proposta de aplicativo para o ecossistema OpenStruct. Os detalhes do software serão
            apresentados em breve.
          </p>
          <Link className="text-link" to="/apps?future=1">
            Ver horizonte futuro <ArrowRight size={17} />
          </Link>
        </div>
        <figure className="planned-art">
          <img src={app.page.image} alt={app.page.imageAlt} width="512" height="512" />
          <figcaption>{app.name} / OpenStruct</figcaption>
        </figure>
      </div>
    </section>
  );
}

export function Anchor() {
  return <PlannedProduct app={getPlannedApp('anchorstruct')} />;
}

export function Slope() {
  return <PlannedProduct app={getPlannedApp('slopestruct')} />;
}
