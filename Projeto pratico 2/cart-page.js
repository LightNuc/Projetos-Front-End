// ======================================================
// CART-PAGE.JS — desenha a lista de itens do carrinho,
// os botões de quantidade e o resumo com o total.
// Depende de shop.js (getCart, changeQty, removeFromCart,
// cartTotal, formatPrice) já estar carregado antes.
// ======================================================

const emptyEl = document.getElementById('cartEmpty');
const contentEl = document.getElementById('cartContent');
const listEl = document.getElementById('cartList');
const subtotalEl = document.getElementById('cartSubtotal');
const totalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutMsgEl = document.getElementById('checkoutMessage');

// Desenha (ou redesenha) o carrinho inteiro na tela, a partir do que está salvo
function renderCart() {
  const cart = getCart();

  if (cart.length === 0) {
    emptyEl.hidden = false;
    contentEl.hidden = true;
    return;
  }

  emptyEl.hidden = true;
  contentEl.hidden = false;

  // Reconstrói a lista de itens do zero a cada mudança — mais simples
  // que tentar atualizar só a parte que mudou, e o carrinho nunca tem
  // itens suficientes pra isso pesar no desempenho.
  listEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div>
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-unit-price">${formatPrice(item.price)} cada</span>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-action="decrease" aria-label="Diminuir quantidade">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" data-action="increase" aria-label="Aumentar quantidade">+</button>
      </div>
      <div class="cart-item-line-total">${formatPrice(item.price * item.qty)}</div>
      <button class="cart-item-remove" aria-label="Remover item">✕</button>
    </div>
  `).join('');

  const total = cartTotal(cart);
  subtotalEl.textContent = formatPrice(total);
  totalEl.textContent = formatPrice(total); // sem frete/desconto neste exemplo, subtotal = total
}

// Delegação de eventos: um único listener no container inteiro,
// em vez de um listener por botão (que teria que ser recriado a
// cada renderCart()). Descobre o que foi clicado olhando o evento.
listEl.addEventListener('click', (e) => {
  const itemEl = e.target.closest('.cart-item');
  if (!itemEl) return;
  const id = itemEl.dataset.id;

  if (e.target.matches('[data-action="increase"]')) {
    changeQty(id, 1);
  } else if (e.target.matches('[data-action="decrease"]')) {
    changeQty(id, -1);
  } else if (e.target.matches('.cart-item-remove')) {
    removeFromCart(id);
  } else {
    return; // clique em outro lugar do card, não faz nada
  }

  renderCart(); // redesenha com os números atualizados
});

// "Finalizar pedido" — fecha o carrinho como um pedido fictício
// (gera um número, guarda os itens) e manda pra página de confirmação.
checkoutBtn.addEventListener('click', () => {
  const order = placeOrder();
  if (!order) return; // carrinho vazio, não devia nem conseguir clicar aqui
  window.location.href = 'order-confirmation.html';
});

renderCart();
