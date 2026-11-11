import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExperienceProvider } from './components/Experience';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Consolo } from './pages/Consolo';
import { Armadura } from './pages/Armadura';
import { Mola } from './pages/Mola';
import { GeoSPT } from './pages/GeoSPT';
import { Launcher } from './pages/Launcher';
import { Catalog } from './pages/Catalog';
import { Docs } from './pages/Docs';
import { Community, NotFound } from './pages/Community';
import { Development } from './pages/Development';
import { site } from './lib/config';
import { getCurrentApp } from './lib/apps';
import { CatalogProvider } from './components/CatalogProvider';
import './styles.css';
import './consolostruct.css';
import './molastruct.css';
import './geosptstruct.css';
import './armadurastruct.css';
import './launcher.css';
import './catalog.css';
import './home.css';
const Releases = React.lazy(() =>
  import('./pages/Releases').then((module) => ({ default: module.Releases })),
);
const ContributionManual = React.lazy(() =>
  import('./pages/ContributionManual').then((module) => ({ default: module.ContributionManual })),
);
const AiContribution = React.lazy(() =>
  import('./pages/AiContribution').then((module) => ({ default: module.AiContribution })),
);
const RectangleArea = React.lazy(() =>
  import('./pages/RectangleArea').then((module) => ({ default: module.RectangleArea })),
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <ExperienceProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="apps" element={<Catalog />} />
              <Route path={getCurrentApp('consolostruct').route} element={<Consolo />} />
              <Route path={getCurrentApp('molastruct').route} element={<Mola />} />
              <Route path={getCurrentApp('armadurastruct').route} element={<Armadura />} />
              <Route path={getCurrentApp('geosptstruct').route} element={<GeoSPT />} />
              <Route path="launcher" element={<Launcher />} />
              <Route path="docs" element={<Docs />} />
              <Route
                path="docs/recursos-editoriais/edicao-1/area-retangular"
                element={
                  <React.Suspense
                    fallback={
                      <div className="container page-hero" role="status">
                        Carregando capítulo…
                      </div>
                    }
                  >
                    <RectangleArea />
                  </React.Suspense>
                }
              />
              <Route path="community" element={<Community />} />
              <Route
                path="community/como-colaborar"
                element={
                  <React.Suspense
                    fallback={
                      <div className="container page-hero" role="status">
                        Carregando manual…
                      </div>
                    }
                  >
                    <ContributionManual />
                  </React.Suspense>
                }
              />
              <Route
                path="releases"
                element={
                  <React.Suspense
                    fallback={
                      <div className="container page-hero" role="status">
                        Carregando releases…
                      </div>
                    }
                  >
                    <Releases />
                  </React.Suspense>
                }
              />
              <Route path={site.developmentPath} element={<Development />} />
              <Route
                path="development/contribuir-com-ia"
                element={
                  <React.Suspense
                    fallback={
                      <div className="container page-hero" role="status">
                        Carregando guia…
                      </div>
                    }
                  >
                    <AiContribution />
                  </React.Suspense>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ExperienceProvider>
      </CatalogProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
