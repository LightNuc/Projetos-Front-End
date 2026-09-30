// ======================================================
// TRILHOS LATERAIS — preenche as duas faixas vazias (esquerda e direita)
// com vários "mini-teclados", cada um com 12 teclinhas que piscam sozinhas.
// Usado em TODAS as páginas do site (extraído do main.js, que agora só
// cuida da demo interativa de teclas que existe apenas na home).
// ======================================================

// Monta um mini-teclado: uma <div class="mini-kb"> com 12 <span class="mini-key"> dentro.
// Cada teclado sai com um tamanho, opacidade e timing de teclas levemente diferentes —
// isso é o que evita que o olho reconheça "ah, é sempre o mesmo grupo de 4 se repetindo".
function buildMiniKeyboard() {
  const kb = document.createElement('div');
  kb.className = 'mini-kb';

  const scale = (0.8 + Math.random() * 0.4).toFixed(2);   // varia entre 80% e 120% do tamanho
  const opacity = (0.3 + Math.random() * 0.3).toFixed(2); // varia entre 0.30 e 0.60 de opacidade
  kb.style.transform = `scale(${scale})`;
  kb.style.opacity = opacity;

  for (let i = 0; i < 12; i++) {
    const key = document.createElement('span');
    key.className = 'mini-key';
    // atraso aleatório (em vez de sempre o mesmo padrão fixo do CSS) —
    // assim nenhum teclado pisca exatamente igual ao outro
    key.style.animationDelay = (Math.random() * 3.6).toFixed(2) + 's';
    kb.appendChild(key);
  }
  return kb;
}

// Preenche um trilho (pelo id da faixa) com N mini-teclados, e depois DUPLICA
// tudo uma vez — é esse truque que faz a rolagem (definida no CSS, translateY(-50%))
// parecer um loop infinito e sem emenda, em vez de "pular" quando reinicia.
function fillRail(trackId, count) {
  const track = document.getElementById(trackId);
  if (!track) return; // se o elemento não existir nesta página, não faz nada

  for (let i = 0; i < count; i++) {
    track.appendChild(buildMiniKeyboard());
  }
  track.innerHTML += track.innerHTML; // duplica o conteúdo atual
}

// 7 teclados únicos por trilho — com essa variedade, o padrão demora
// bastante pra se repetir visualmente
fillRail('railLeft', 7);
fillRail('railRight', 7);
