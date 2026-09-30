// ======================================================
// SONS SINTETIZADOS DE SWITCH — via Web Audio API
// Não usa nenhum arquivo de áudio: o som é gerado na hora,
// pelo próprio navegador, combinando ondas curtas (osciladores)
// com um "envelope" de volume que cria o efeito de clique.
// Serve de RESERVA — ver mais abaixo os áudios reais, que são
// usados no lugar deste sempre que o arquivo existir.
// ======================================================

// ======================================================
// ÁUDIOS REAIS — coloque os arquivos de som de cada switch aqui.
// Caminho relativo a partir da pasta onde está o sounds.html
// (ex: precisa existir uma pasta "audio" do lado do sounds.html,
// com esses três arquivos dentro).
// Se o arquivo não existir ainda (ou falhar ao carregar), o site
// automaticamente volta a usar o som sintetizado acima como reserva —
// então você pode ir adicionando um áudio de cada vez, sem quebrar nada.
// ======================================================
const realAudioFiles = {
  linear: 'audio/linear.mp3',
  tactile: 'audio/tatil.mp3',
  clicky: 'audio/clikcy.mp3',
};

// Tenta tocar o arquivo de áudio real. Retorna uma Promise que:
// - resolve (dá certo) se o áudio de verdade tocou
// - rejeita (dá errado) se o arquivo não existe ou não pôde tocar,
//   sinalizando pro código que chamou que deve usar o som sintetizado no lugar
function playRealAudio(type) {
  return new Promise((resolve, reject) => {
    const src = realAudioFiles[type];
    if (!src) { reject(); return; }

    const audio = new Audio(src);
    audio.addEventListener('error', reject);      // arquivo não encontrado, formato inválido etc.
    audio.play()
      .then(resolve)
      .catch(reject); // navegador recusou tocar (também cai no fallback sintetizado)
  });
}

// AudioContext é o "estúdio de som" do navegador — criado só quando
// o usuário clicar pela primeira vez (alguns navegadores bloqueiam
// áudio automático até haver uma interação do usuário).
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Toca um "clique" curto: cria um oscilador (gera a onda sonora),
// liga a um "gain" (controla o volume) e faz o volume cair rápido
// até quase zero — é essa queda rápida que soa como um clique,
// em vez de uma nota longa e musical.
function playClick({ frequency, duration, waveType, volume = 0.3, delay = 0 }) {
  const ctx = getAudioContext();
  const startTime = ctx.currentTime + delay;

  const osc = ctx.createOscillator();   // gera a onda sonora
  const gain = ctx.createGain();        // controla o volume ao longo do tempo

  osc.type = waveType;                            // formato da onda: 'sine', 'triangle' ou 'square'
  osc.frequency.setValueAtTime(frequency, startTime); // "altura" do som (grave ou agudo)

  gain.gain.setValueAtTime(volume, startTime);
  // exponentialRamp faz o volume cair suavemente até quase zero — sem esse decaimento,
  // o som pareceria um "bip" contínuo em vez de um clique
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);        // conecta o oscilador ao controle de volume
  gain.connect(ctx.destination); // conecta o controle de volume à saída de áudio (alto-falante)

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// Cada tipo de switch tem uma "receita" de som diferente,
// pensada pra imitar a textura descrita no site:
const soundRecipes = {
  // Linear: um único clique grave e curto, sem "degrau" — igual ao percurso do switch
  linear: () => {
    playClick({ frequency: 180, duration: 0.05, waveType: 'sine', volume: 0.35 });
  },
  // Tátil: dois cliques próximos (o "degrau" no meio do percurso + o fundo de curso)
  tactile: () => {
    playClick({ frequency: 260, duration: 0.04, waveType: 'triangle', volume: 0.3 });
    playClick({ frequency: 200, duration: 0.05, waveType: 'triangle', volume: 0.2, delay: 0.05 });
  },
  // Clicky: o clique principal + um segundo som mais agudo e curto por cima,
  // simulando o mecanismo de clique dentro do switch
  clicky: () => {
    playClick({ frequency: 300, duration: 0.03, waveType: 'square', volume: 0.28 });
    playClick({ frequency: 900, duration: 0.02, waveType: 'square', volume: 0.15, delay: 0.01 });
  }
};

// ======================================================
// LIGA OS BOTÕES "▶ Tocar som" DA PÁGINA AOS SONS ACIMA
// ======================================================

document.querySelectorAll('.play-btn').forEach(button => {
  const type = button.dataset.sound; // lê o atributo data-sound="linear|tactile|clicky" do HTML
  const card = button.closest('.sound-card');
  const waveform = card ? card.querySelector('.waveform-mini') : null;

  // Cria as barrinhas do waveform em miniatura (visual, decorativo) uma única vez
  if (waveform && waveform.children.length === 0) {
    for (let i = 0; i < 14; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = (10 + Math.random() * 30) + 'px';
      bar.style.animationDelay = (Math.random() * 0.4) + 's';
      waveform.appendChild(bar);
    }
  }

  button.addEventListener('click', () => {
    // efeito visual: as barrinhas "dançam" por um instante enquanto o som toca
    const animateWaveform = () => {
      if (waveform) {
        waveform.classList.add('playing');
        setTimeout(() => waveform.classList.remove('playing'), 500);
      }
    };

    // Tenta o áudio real primeiro. Se der certo, ótimo — anima o waveform e acabou.
    // Se der errado (arquivo não existe ainda, por exemplo), cai no som sintetizado.
    playRealAudio(type)
      .then(animateWaveform)
      .catch(() => {
        const recipe = soundRecipes[type];
        if (recipe) recipe();
        animateWaveform();
      });
  });
});
