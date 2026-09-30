// ======================================================
// CONFIRMATION.JS — mostra os detalhes do último pedido
// fechado no carrinho (ou uma mensagem, se não houver nenhum).
// Depende de shop.js (getLastOrder, formatPrice) já carregado antes.
// ======================================================

const order = getLastOrder();

const contentEl = document.getElementById('confirmationContent');
const emptyEl = document.getElementById('confirmationEmpty');

if (!order) {
  // Alguém abriu esta página sem ter acabado de finalizar um pedido de verdade
  emptyEl.hidden = false;
} else {
  contentEl.hidden = false;

  document.getElementById('orderNumber').textContent = 'Pedido ' + order.number;

  const dateFormatted = new Date(order.date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const itemsHtml = order.items.map(item => `
    <div class="confirmation-summary-row">
      <span>${item.qty}× ${item.name}</span>
      <span>${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join('');

  document.getElementById('confirmationSummary').innerHTML = `
    <div class="confirmation-summary-row">
      <span>Data</span>
      <span>${dateFormatted}</span>
    </div>
    ${itemsHtml}
    <div class="confirmation-summary-row total">
      <span>Total</span>
      <span>${formatPrice(order.total)}</span>
    </div>
  `;
}
