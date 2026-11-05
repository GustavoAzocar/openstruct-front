import { useId } from 'react';

/** Geometria esquemática para apresentação; não executa verificação estrutural. */
export function CorbelModel({
  reinforcement = true,
  exploded = false,
  drawing = false,
  projection = 0,
}: {
  reinforcement?: boolean;
  exploded?: boolean;
  drawing?: boolean;
  projection?: number;
}) {
  const id = useId().replace(/:/g, '');
  const dx = projection * 0.55;
  return (
    <svg
      className={`corbel-model ${drawing ? 'drawing' : ''}`}
      viewBox="0 0 620 470"
      role="img"
      aria-label={
        drawing
          ? 'Vista esquemática do detalhamento de um consolo'
          : 'Modelo esquemático em perspectiva de um pilar com consolo e armadura'
      }
    >
      <defs>
        <pattern id={`grid-${id}`} width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".12" />
        </pattern>
        <pattern
          id={`hatch-${id}`}
          width="7"
          height="7"
          patternTransform="rotate(35)"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 0V7" stroke="currentColor" strokeWidth="1" opacity=".16" />
        </pattern>
      </defs>
      <rect width="620" height="470" fill={`url(#grid-${id})`} />
      <g
        transform={`translate(${exploded ? -18 : 0} ${exploded ? 10 : 0})`}
        className="concrete-shape"
      >
        <path className="concrete-side" d="m218 95 84-44 0 308-84 51Z" />
        <path className="concrete-front" d="M151 63h67v347h-67Z" />
        <path className="concrete-top" d="m151 63 84-44 67 32-84 44Z" />
        <path className="concrete-front" d={`M218 180H${394 + dx}v69L218 339Z`} />
        <path className="concrete-top" d={`m218 180 84-44 ${176 + dx} 0-84 44Z`} />
        <path className="concrete-side" d={`m${394 + dx} 180 84-44v69l-84 44Z`} />
        <path className="concrete-bottom" d={`m218 339 ${176 + dx}-90 84-44-176 90Z`} />
        {drawing && (
          <path d={`M151 63h67v117h${176 + dx}v69L218 339v71h-67Z`} fill={`url(#hatch-${id})`} />
        )}
      </g>
      {reinforcement && (
        <g className="rebar" transform={`translate(${exploded ? 13 : 0} ${exploded ? -18 : 0})`}>
          {[0, 16, 32].map((k) => (
            <path
              key={k}
              d={`m${175 + k * 0.35} ${102 - k * 0.3} 0 115 Q${175 + k * 0.35} ${230 - k * 0.3} ${191 + k * 0.35} ${230 - k * 0.3} L${371 + dx + k * 0.35} ${230 - k * 0.3} Q${385 + dx + k * 0.35} ${230 - k * 0.3} ${385 + dx + k * 0.35} ${216 - k * 0.3}v-8 Q${385 + dx + k * 0.35} ${194 - k * 0.3} ${371 + dx + k * 0.35} ${194 - k * 0.3}H${207 + k * 0.35}Q${196 + k * 0.35} ${194 - k * 0.3} ${196 + k * 0.35} ${180 - k * 0.3}V${92 - k * 0.3}`}
            />
          ))}
          {[0, 1, 2, 3, 4].map((k) => (
            <path
              className="stirrups"
              key={k}
              d={`m${240 + k * 27 + (dx * k) / 4} 180 0 ${112 - k * 14} 35-18 0-${112 - k * 14}Z`}
            />
          ))}
          <path className="column-bar" d="M166 81v303m36-295v303m58-317v281m28-295v279" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
            <path
              className="stirrups"
              key={`c${k}`}
              d={`m161 ${103 + k * 35} 43 20 80-43-43-19Z`}
            />
          ))}
        </g>
      )}
      <g className="model-dimension" fill="none" stroke="currentColor" strokeWidth="1.1">
        <path d={`M218 373h${176 + dx}m-${176 + dx} -7v14m${176 + dx}-14v14`} />
        <path d="M119 63v347m-7-347h14m-14 347h14" />
        <path d={`m${435 + dx} 275-27 41h-49`} />
      </g>
      <g className="model-labels" fill="currentColor">
        <text x={280 + dx / 2} y="393">
          a = {35 + projection} cm
        </text>
        <text x="105" y="261" transform="rotate(-90 105 261)">
          PILAR
        </text>
        <text x={365 + dx} y="334">
          {reinforcement ? 'ARMADURA' : 'CONCRETO'}
        </text>
        <text x="35" y="432">
          {drawing ? 'VISTA ESQUEMÁTICA / SEM ESCALA' : 'MODELO ILUSTRATIVO / UNIDADES EM CM'}
        </text>
      </g>
    </svg>
  );
}
