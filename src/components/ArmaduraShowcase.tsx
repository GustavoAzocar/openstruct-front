import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { getCurrentApp } from '../lib/apps';
import { armaduraScreenshot as capture } from '../lib/product-media';
import { ProductCatalogMeta } from './CatalogAvailability';

const app = getCurrentApp(capture.appId);

export function ArmaduraShowcase() {
  return (
    <figure className="arm-home-showcase">
      <div className="arm-home-showcase-heading">
        <img src={app.image} alt="" width="52" height="52" />
        <div>
          <span className="eyebrow">EM DESTAQUE / CAD 2D</span>
          <Link to={app.route}>
            {app.name} <ArrowUpRight size={17} />
          </Link>
        </div>
        <span className="arm-home-showcase-label">
          DO DESENHO
          <br />
          AO QUADRO DE AÇO
        </span>
      </div>
      <Link
        className="arm-home-capture-link"
        to={`${app.route}#editor`}
        aria-label={`Conhecer o ${app.name} e ver a captura completa do editor`}
      >
        <img
          src={capture.src}
          alt={capture.alt}
          width={capture.width}
          height={capture.height}
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
      </Link>
      <figcaption>
        <div className="arm-home-capture-source">
          <span>CAPTURA REAL · v{capture.version}</span>
          <a href={capture.source.url} target="_blank" rel="noreferrer">
            Ver fonte <ArrowUpRight size={12} />
          </a>
        </div>
        <ProductCatalogMeta app={app} />
        <a className="arm-home-license" href={app.license.url} target="_blank" rel="noreferrer">
          Aplicativo {app.license.spdx} <ArrowUpRight size={12} />
        </a>
      </figcaption>
    </figure>
  );
}
