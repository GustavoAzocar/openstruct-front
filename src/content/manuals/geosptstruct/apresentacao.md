## Escopo

O GeoSPT 2.0.7 reúne sondagens SPT, compatibiliza os furos por cota absoluta e estima a capacidade de carga de estacas pelos métodos de Décourt–Quaresma e Aoki–Velloso. A aba **Capacidade** permite comparar envoltória, perfil médio, cálculo por furo e interpolação. A aba **Saídas** reúne os memoriais em XLSX e PDF e a exportação da obra em JSON.

## Primeiros passos

1. Preencha a identificação em **Obra** e cadastre em **Sondagens** as cotas de topo, profundidades e leituras de NSPT.
2. Em **Compatibilização**, confira o alinhamento e o perfil consolidado. Essa operação exige pelo menos duas sondagens.
3. Cadastre uma estaca em **Estacas**, selecione-a em **Capacidade** e consulte os resultados do modo escolhido. Exporte a obra em JSON para guardar uma cópia que pode ser reaberta pelo aplicativo.

## Limites

> [!WARNING]
> Os métodos fornecem estimativas semiempíricas dependentes das sondagens e dos coeficientes informados. O corte esquemático conecta camadas interpretadas entre os furos com base nas famílias de solo. A investigação geotécnica e a avaliação da solução de fundação permanecem sob responsabilidade técnica do projetista.

## Fontes da versão

- [Manual no repositório oficial do GeoSPT](https://github.com/itanervale/GEOSPT-STRUCT/blob/5f5cded75e94dbce2bea90eb685deef74d1dfd1f/README.md)
- [Identificação do pacote 2.0.7](https://github.com/itanervale/GEOSPT-STRUCT/blob/5f5cded75e94dbce2bea90eb685deef74d1dfd1f/package.json)
