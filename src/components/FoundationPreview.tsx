import { useState } from 'react';

type Foundation = 'footing' | 'piles';

function Spring({ x, y }: { x: number; y: number }) {
  return <path className="foundation-spring" d={`M${x} ${y}v7l-10 6 20 8-20 8 20 8-20 8 10 6v8`} />;
}

function FoundationDrawing({ type, piles }: { type: Foundation; piles: number }) {
  const positions: Record<number, [number, number][]> = {
    1: [[310, 214]],
    2: [
      [250, 224],
      [370, 194],
    ],
    3: [
      [240, 231],
      [375, 217],
      [302, 177],
    ],
    4: [
      [235, 225],
      [325, 248],
      [305, 184],
      [395, 207],
    ],
  };
  return (
    <svg
      className="foundation-drawing"
      viewBox="0 0 620 420"
      role="img"
      aria-label={
        type === 'footing'
          ? 'Esquema de uma sapata apoiada em molas que representam a deformabilidade do solo'
          : `Esquema de um bloco com ${piles} ${piles === 1 ? 'estaca' : 'estacas'} e apoios elásticos conceituais`
      }
    >
      <g className="foundation-soil">
        <path d="m85 288 280-101 190 81-280 104Z" />
        <path d="m85 288 190 84 280-104v29L275 401 85 317Z" />
        <path d="m85 317 190 84 280-104" fill="none" />
        <path d="m85 302 190 84 280-104" fill="none" strokeDasharray="4 5" />
      </g>
      {type === 'piles' &&
        positions[piles].map(([x, y]) => (
          <g key={`${x}-${y}`} className="foundation-pile">
            <path d={`M${x - 10} ${y}v91q10 11 20 0v-91Z`} />
            <path d={`M${x} ${y + 5}v83`} className="pile-center" />
          </g>
        ))}
      <g className="foundation-springs">
        {(type === 'footing'
          ? [
              [216, 238],
              [310, 269],
              [405, 227],
            ]
          : positions[piles].map(([x, y]) => [x, y + 70])
        ).map(([x, y]) => (
          <Spring key={`${x}-${y}`} x={x} y={y} />
        ))}
      </g>
      <g className="foundation-concrete">
        <path className="concrete-front" d="m169 194 150 58 143-64v39l-143 65-150-59Z" />
        <path className="concrete-top" d="m169 194 143-62 150 56-143 64Z" />
        <path className="concrete-side" d="m319 252 143-64v39l-143 65Z" />
        <path className="concrete-front" d="m286 77 38 14v109l-38-15Z" />
        <path className="concrete-side" d="m324 91 29-13v109l-29 13Z" />
        <path className="concrete-top" d="m286 77 29-13 38 14-29 13Z" />
      </g>
      <g className="foundation-callouts">
        <path d="M200 204h-84l-20-20M401 278h81l30-31M414 352h85l19 18" />
        <text x="63" y="172">
          {type === 'footing' ? 'SAPATA' : 'BLOCO SOBRE ESTACAS'}
        </text>
        <text x="472" y="235">
          MOLAS
        </text>
        <text x="480" y="389">
          SOLO
        </text>
      </g>
      <text className="foundation-drawing-note" x="30" y="402">
        ESQUEMA CONCEITUAL / SEM ESCALA
      </text>
    </svg>
  );
}

export function FoundationPreview() {
  const [type, setType] = useState<Foundation>('footing');
  const [piles, setPiles] = useState(4);
  return (
    <section className="foundation-preview" aria-labelledby="foundation-preview-title">
      <div className="foundation-preview-top">
        <div>
          <span className="eyebrow">FUNDAÇÃO + SOLO</span>
          <h3 id="foundation-preview-title">O apoio também faz parte do modelo.</h3>
        </div>
        <span className="preview-label">Representação conceitual</span>
      </div>
      <div className="foundation-preview-body">
        <div className="foundation-options">
          <span className="panel-title">TIPO DE FUNDAÇÃO</span>
          <div className="foundation-type-buttons" role="group" aria-label="Tipo de fundação">
            <button aria-pressed={type === 'footing'} onClick={() => setType('footing')}>
              Sapata
            </button>
            <button aria-pressed={type === 'piles'} onClick={() => setType('piles')}>
              Bloco sobre estacas
            </button>
          </div>
          {type === 'piles' && (
            <div className="pile-count">
              <span className="panel-title">NÚMERO DE ESTACAS</span>
              <div role="group" aria-label="Número de estacas">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    aria-pressed={piles === n}
                    onClick={() => setPiles(n)}
                    aria-label={`${n} ${n === 1 ? 'estaca' : 'estacas'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="foundation-option-note">
            <strong>Translação e rotação.</strong>
            <p>
              O MolaStruct propõe estimar a rigidez do apoio a partir da geometria da fundação e das
              características do solo.
            </p>
          </div>
          <small>
            Este esquema permite explorar as configurações previstas, sem executar cálculos.
          </small>
        </div>
        <div className="foundation-canvas">
          <FoundationDrawing type={type} piles={piles} />
        </div>
      </div>
      <div className="preview-statusbar">
        <span aria-live="polite">
          {type === 'footing'
            ? 'Sapata'
            : `Bloco com ${piles} ${piles === 1 ? 'estaca' : 'estacas'}`}
        </span>
        <span>Escopo inicial · Em desenvolvimento</span>
      </div>
    </section>
  );
}
