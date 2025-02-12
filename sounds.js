import { audioCtx } from './audioContext.js';

// Electric Guitar: Strong fundamental, quickly dropping harmonics.
const electricGuitarWave = audioCtx.createPeriodicWave(
    new Float32Array([0, 1.0, 0.25, 0.1, 0.05, 0.02, 0.01, 0.005]),
    new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]),
    { disableNormalization: true }
);

const organWave = audioCtx.createPeriodicWave(
    new Float32Array([0, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4]),
    new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]),
    { disableNormalization: true }
);

const saxWave = audioCtx.createPeriodicWave(
    new Float32Array([0, 1.0, 0.6, 0.4, 0.3, 0.2, 0.1, 0.05]),
    new Float32Array([0, 0, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01]),
    { disableNormalization: true }
);

const bellWave = audioCtx.createPeriodicWave(
    new Float32Array([0, 1.0, 0.6, 0.3, 0.15, 0.07, 0.03, 0.015]),
    new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]),
    { disableNormalization: true }
);

const brassWave = audioCtx.createPeriodicWave(
    new Float32Array([0, 1.0, 0.8, 0.6, 0.4, 0.3, 0.2, 0.15]),
    new Float32Array([0, 0, 0.3, 0.2, 0.1, 0.05, 0.025, 0.0125]),
    { disableNormalization: true }
);

const harpsichordWave = audioCtx.createPeriodicWave(
    new Float32Array([0, 1.0, 0.5, 0.3, 0.2, 0.15, 0.1, 0.08]),
    new Float32Array([0, 0, 0.2, 0.1, 0.05, 0.025, 0.0125, 0]),
    { disableNormalization: true }
);

export const waves =
[
    { name: 'Electric Guitar', wave: electricGuitarWave},
    { name: 'Organ', wave: organWave},
    { name: 'Sax', wave: saxWave }
];