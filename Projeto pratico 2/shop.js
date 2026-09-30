// ======================================================
// SHOP.JS — lógica compartilhada de carrinho e login.
// Este arquivo é incluído em TODAS as páginas do site,
// porque o contador do carrinho e o estado de login
// (nome de quem entrou) precisam aparecer na barra do topo
// em qualquer lugar, não só na página de carrinho/login.
//
// IMPORTANTE: este site não tem servidor por trás. Tudo
// aqui é guardado no localStorage do próprio navegador —
// ou seja, é só pra demonstração, não é um sistema de
// login ou pagamento de verdade.
// ======================================================

const CART_KEY = 'thock-cart';
const USER_KEY = 'thock-user';

// ---------- CARRINHO ----------

// Lê o carrinho salvo no navegador. Se não existir nada ainda, devolve uma lista vazia.
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return []; // se o dado salvo estiver corrompido por algum motivo, começa do zero
  }
}

// Salva o carrinho inteiro de volta no navegador
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge(); // toda vez que o carrinho muda, atualiza a bolinha de contagem na nav
}

// Adiciona um item ao carrinho. Se o item (mesmo id) já existir, só aumenta a quantidade.
function addToCart(id, name, price) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart(cart);
}

// Muda a quantidade de um item (positivo pra aumentar, negativo pra diminuir).
// Se a quantidade chegar a zero, remove o item da lista.
function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  const updated = item.qty > 0 ? cart : cart.filter(i => i.id !== id);
  saveCart(updated);
}

// Remove um item inteiro do carrinho, não importa a quantidade
function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

// Soma o preço x quantidade de todos os itens do carrinho
function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// Formata um número como reais, ex: 899 -> "R$ 899,00"
function formatPrice(value) {
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

// Atualiza a bolinha de número no ícone do carrinho, na barra do topo.
// Chamado sempre que o carrinho muda, e também uma vez ao carregar qualquer página.
function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return; // esta página pode não ter o ícone de carrinho (ex: se algo mudar no futuro)
  const totalItems = getCart().reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalItems;
  badge.setAttribute('data-count', totalItems); // usado pelo CSS pra esconder a bolinha quando é 0
}

// ---------- LOGIN (estado simples, sem servidor) ----------

// Lê o usuário "logado" salvo no navegador, ou null se ninguém entrou
function getLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (e) {
    return null;
  }
}

// Salva o usuário como "logado" (usado depois de um login/cadastro de mentira)
function setLoggedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  updateAccountNav();
}

// Remove o login (usado pelo botão "Sair")
function logout() {
  localStorage.removeItem(USER_KEY);
  updateAccountNav();
}

// Atualiza o link "Entrar" da nav: vira o nome da pessoa + "Sair" quando já logada
function updateAccountNav() {
  const link = document.querySelector('.nav-account-link');
  if (!link) return;

  const user = getLoggedUser();
  if (user && user.name) {
    const firstName = user.name.trim().split(' ')[0];
    link.textContent = firstName + ' · Sair';
    link.href = '#';
    link.onclick = (e) => { e.preventDefault(); logout(); };
  } else {
    link.textContent = 'Entrar';
    link.href = 'login.html';
    link.onclick = null;
  }
}

// ---------- LIGA OS BOTÕES "ADICIONAR AO CARRINHO" DE QUALQUER PÁGINA ----------

document.querySelectorAll('.add-to-cart-btn').forEach(button => {
  button.addEventListener('click', () => {
    const { id, name, price } = button.dataset; // lê data-id, data-name, data-price do HTML
    addToCart(id, name, Number(price));

    // feedback rápido: o botão muda de texto e cor por 1.2s, depois volta ao normal
    const originalText = button.textContent;
    button.textContent = 'Adicionado ✓';
    button.classList.add('added');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('added');
    }, 1200);
  });
});

// Roda assim que a página carrega, em qualquer página que inclua este arquivo
updateCartBadge();
updateAccountNav();

// ======================================================
// MENU MOBILE — abre/fecha o painel de navegação no celular
// ======================================================

const navToggle = document.getElementById('navToggle');
const navPanel = document.getElementById('navPanel');

if (navToggle && navPanel) {
  navToggle.addEventListener('click', () => {
    const isOpen = navPanel.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Fecha o painel automaticamente ao clicar em qualquer link dentro dele —
  // sem isso, a pessoa clicaria num link e o menu continuaria aberto por cima da página
  navPanel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navPanel.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ======================================================
// PEDIDO — transforma o carrinho atual num "pedido" fictício,
// guarda ele separado (pra página de confirmação conseguir
// mostrar depois) e esvazia o carrinho.
// ======================================================

const LAST_ORDER_KEY = 'thock-last-order';

// Gera um número de pedido de mentira, tipo "THK-482913"
function generateOrderNumber() {
  const n = Math.floor(100000 + Math.random() * 900000); // sempre 6 dígitos
  return 'THK-' + n;
}

// Fecha o pedido: copia o carrinho atual pra um "último pedido" salvo à parte,
// e esvazia o carrinho. Devolve o pedido criado (ou null se o carrinho já estava vazio).
function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) return null;

  const order = {
    number: generateOrderNumber(),
    items: cart,
    total: cartTotal(cart),
    date: new Date().toISOString(),
  };

  localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  saveCart([]); // esvazia o carrinho, já que o pedido foi "fechado"
  return order;
}

// Lê o último pedido salvo (usado pela página order-confirmation.html)
function getLastOrder() {
  try {
    return JSON.parse(localStorage.getItem(LAST_ORDER_KEY));
  } catch (e) {
    return null;
  }
}

// ======================================================
// NEWSLETTER — formulário no rodapé, presente em todas as páginas.
// Sem servidor de verdade: só guarda o e-mail no navegador,
// pra lembrar que a pessoa já "se inscreveu" da próxima vez.
// ======================================================

const NEWSLETTER_KEY = 'thock-newsletter-email';
const NEWSLETTER_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return; // esta página pode não ter o rodapé com newsletter (não deveria acontecer, mas por segurança)

  const emailInput = document.getElementById('newsletterEmail');
  const button = form.querySelector('button');
  const msgEl = document.getElementById('newsletterMessage');

  // Se esse navegador já "inscreveu" um e-mail antes, mostra isso em vez do formulário vazio
  const savedEmail = localStorage.getItem(NEWSLETTER_KEY);
  if (savedEmail) {
    markAsSubscribed(savedEmail);
  }

  function markAsSubscribed(email) {
    emailInput.value = email;
    emailInput.disabled = true;
    button.disabled = true;
    button.textContent = 'Inscrito ✓';
    msgEl.classList.remove('error');
    msgEl.textContent = 'Você já está na lista.';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!NEWSLETTER_EMAIL_REGEX.test(email)) {
      msgEl.classList.add('error');
      msgEl.textContent = 'Digite um e-mail válido.';
      return;
    }

    localStorage.setItem(NEWSLETTER_KEY, email);
    markAsSubscribed(email);
    msgEl.textContent = 'Inscrito! (demonstração — nenhum e-mail é enviado de verdade)';
  });
}

initNewsletter();
