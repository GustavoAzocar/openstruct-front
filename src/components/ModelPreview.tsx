import { useState } from 'react';
import { Box, Layers3, Ruler, RotateCcw, Maximize2, X, ChevronDown } from 'lucide-react';
import { CorbelModel } from './CorbelModel';

type Mode = 'model' | 'rebar' | 'drawing';
export function ModelPreview({ simple = false }: { simple?: boolean }) {
  const [mode, setMode] = useState<Mode>('rebar');
  const [a, setA] = useState(35);
  const [exploded, setExploded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`preview-shell ${simple ? 'preview-simple' : ''} ${expanded ? 'preview-expanded' : ''}`}
    >
      <div className="preview-topbar">
        <div className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>
          CONSOLOSTRUCT <span className="preview-filename">/ exemplo-01</span>
        </span>
        <span className="preview-label">SVG · sem cálculo</span>
      </div>
      <div className="preview-toolbar">
        <div className="preview-tabs" role="group" aria-label="Vista do modelo">
          {(
            [
              { key: 'model', label: 'Modelo', Icon: Box },
              { key: 'rebar', label: 'Armaduras', Icon: Layers3 },
              { key: 'drawing', label: 'Detalhe', Icon: Ruler },
            ] as const
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              className={mode === key ? 'selected' : ''}
              aria-pressed={mode === key}
              onClick={() => setMode(key)}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button
          className="icon-button preview-expand"
          aria-label={expanded ? 'Recolher demonstração' : 'Ampliar demonstração'}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <X size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
      <div className="preview-body">
        <aside className="preview-sidebar">
          <span className="panel-title">
            GEOMETRIA <ChevronDown size={12} />
          </span>
          <div className="preview-field">
            <span>Pilar</span>
            <strong>
              25 × 40 <small>cm</small>
            </strong>
          </div>
          <div className="preview-field">
            <span>Projeção do consolo</span>
            <strong>
              {a} <small>cm</small>
            </strong>
          </div>
          <label className="range-label" htmlFor={simple ? 'a-mini' : 'a-full'}>
            Ajustar projeção
            <input
              id={simple ? 'a-mini' : 'a-full'}
              type="range"
              min="25"
              max="60"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
            />
          </label>
          <span className="panel-title second-title">EXIBIÇÃO</span>
          <label className="check-label">
            <input
              type="checkbox"
              checked={exploded}
              onChange={(e) => setExploded(e.target.checked)}
            />{' '}
            Separar camadas
          </label>
          <button
            className="reset-model"
            onClick={() => {
              setA(35);
              setExploded(false);
              setMode('rebar');
            }}
          >
            <RotateCcw size={13} /> Restaurar
          </button>
          <span className="preview-side-note">
            Exemplo visual.
            <br />
            Sem verificação estrutural.
          </span>
        </aside>
        <div className="preview-canvas">
          <span className="canvas-tag">
            {mode === 'drawing' ? 'VISTA ESQUEMÁTICA' : 'PERSPECTIVA ISOMÉTRICA'}
          </span>
          <CorbelModel
            reinforcement={mode !== 'model'}
            drawing={mode === 'drawing'}
            exploded={exploded}
            projection={a - 35}
          />
          <div className="axis-key" aria-hidden="true">
            <span>x</span>
            <span>y</span>
            <span>z</span>
          </div>
        </div>
      </div>
      <div className="preview-statusbar">
        <span>
          <i /> Exemplo de apresentação
        </span>
        <span>
          cm · {mode === 'drawing' ? 'Detalhamento' : 'Vista 3D'} · {a} cm
        </span>
      </div>
    </div>
  );
}
