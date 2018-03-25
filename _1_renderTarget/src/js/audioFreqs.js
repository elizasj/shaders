import average from 'analyser-frequency-average';

// music
const layer = new Audio();
layer.src = 'src/static/song.ogg';

const ctx = new AudioContext();
const source = ctx.createMediaElementSource(layer);
const analyser = ctx.createAnalyser();
source.connect(analyser);
analyser.connect(ctx.destination);
layer.play();
layer.loop = true;

const freq = new Uint8Array(analyser.frequencyBinCount);
requestAnimationFrame(update);

var bands = {
  sub: {
    from: 20,
    to: 250
  },

  low: {
    from: 251,
    to: 500
  },

  mid: {
    from: 501,
    to: 3000
  },

  high: {
    from: 3001,
    to: 6000
  }
};

function update() {
  requestAnimationFrame(update);

  analyser.getByteFrequencyData(freq);
}

export { analyser, freq, bands };
