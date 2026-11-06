import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExperienceProvider } from './components/Experience';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Consolo } from './pages/Consolo';
import { Mola } from './pages/Mola';
import { Launcher } from './pages/Launcher';
import { Catalog } from './pages/Catalog';
import { Docs } from './pages/Docs';
import { Community, NotFound } from './pages/Community';
import './styles.css';
import './molastruct.css';
import './launcher.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ExperienceProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="apps" element={<Catalog />} />
            <Route path="apps/consolostruct" element={<Consolo />} />
            <Route path="apps/molastruct" element={<Mola />} />
            <Route path="launcher" element={<Launcher />} />
            <Route path="docs" element={<Docs />} />
            <Route path="community" element={<Community />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ExperienceProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
