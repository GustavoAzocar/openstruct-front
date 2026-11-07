import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExperienceProvider } from './components/Experience';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Consolo } from './pages/Consolo';
import { Armadura } from './pages/Armadura';
import { Mola } from './pages/Mola';
import { Launcher } from './pages/Launcher';
import { Catalog } from './pages/Catalog';
import { Docs } from './pages/Docs';
import { Community, NotFound } from './pages/Community';
import { getCurrentApp } from './lib/apps';
import { CatalogProvider } from './components/CatalogProvider';
import './styles.css';
import './molastruct.css';
import './armadurastruct.css';
import './launcher.css';
import './catalog.css';

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
              <Route path="launcher" element={<Launcher />} />
              <Route path="docs" element={<Docs />} />
              <Route path="community" element={<Community />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ExperienceProvider>
      </CatalogProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
