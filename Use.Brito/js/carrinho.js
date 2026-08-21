const cartItems = document.querySelector('.cart-items');
const cartCount = document.querySelector('#cart-count');
const subtotal = document.querySelector('#subtotal');
const total = document.querySelector('#total');
const bagCount = document.querySelector('.bag-button span');
const checkoutButton = document.querySelector('.checkout-button');
const whatsappNumber = '5521992751307';
const cartStorageKey = 'useBritoCart';
const orderReferenceKey = 'useBritoOrderReference';

const getStoredCart = () => JSON.parse(localStorage.getItem(cartStorageKey) || 'null');
const saveStoredCart = (items) => localStorage.setItem(cartStorageKey, JSON.stringify(items));

const formatCurrency = (value) => value.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const getOrderReference = () => {
  let reference = localStorage.getItem(orderReferenceKey);

  if (!reference) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
    reference = `UB-${code}`;
    localStorage.setItem(orderReferenceKey, reference);
  }

  return reference;
};

const renderStoredCart = (items) => {
  cartItems.innerHTML = items.map((item) => `
    <article class="cart-item" data-id="${item.id}" data-price="${item.price}">
      <div class="cart-product-image"><img src="${item.image}" alt="${item.alt}"></div>
      <div class="cart-product-details">
        <div class="cart-product-heading"><div><p class="cart-label">${item.category}</p><h2>${item.name}</h2><p class="cart-description">Tamanho ${item.size}</p></div><strong class="item-price">${formatCurrency(item.price)}</strong></div>
        <div class="cart-item-controls"><label for="size-${item.id}">Tamanho <select id="size-${item.id}"><option${item.size === 'P' ? ' selected' : ''}>P</option><option${item.size === 'M' ? ' selected' : ''}>M</option><option${item.size === 'G' ? ' selected' : ''}>G</option></select></label><label for="quantity-${item.id}">Quantidade <input class="quantity-input" id="quantity-${item.id}" type="number" value="${item.quantity}" min="1"></label><button class="remove-button" type="button">Remover</button></div>
      </div>
    </article>`).join('') + '<a class="continue-shopping" href="index.html#colecao">← Continuar comprando</a>';
};

const updateCart = () => {
  const items = [...document.querySelectorAll('.cart-item')];
  const quantity = items.reduce((sum, item) => {
    const input = item.querySelector('.quantity-input');
    return sum + Number(input.value);
  }, 0);
  const value = items.reduce((sum, item) => {
    const input = item.querySelector('.quantity-input');
    return sum + Number(item.dataset.price) * Number(input.value);
  }, 0);

  cartCount.textContent = `${String(quantity).padStart(2, '0')} ${quantity === 1 ? 'produto' : 'produtos'}`;
  bagCount.textContent = quantity;
  subtotal.textContent = formatCurrency(value);
  total.textContent = formatCurrency(value);
  saveStoredCart(items.map((item) => ({
    id: item.dataset.id,
    name: item.querySelector('.cart-product-heading h2').textContent.trim(),
    category: item.querySelector('.cart-label').textContent.trim(),
    price: Number(item.dataset.price),
    image: item.querySelector('img').src,
    alt: item.querySelector('img').alt,
    size: item.querySelector('select').value,
    quantity: Number(item.querySelector('.quantity-input').value)
  })));

  if (items.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart"><h2>Sua sacola está vazia.</h2><p>Escolha uma peça para começar sua seleção.</p><a class="button button-dark" href="index.html#colecao">Ver coleção <span>↗</span></a></div>';
    cartCount.textContent = '00 produtos';
  }
};

cartItems.addEventListener('click', (event) => {
  if (!event.target.closest('.remove-button')) return;

  event.target.closest('.cart-item').remove();
  updateCart();
});

cartItems.addEventListener('input', (event) => {
  if (!event.target.matches('.quantity-input')) return;

  if (event.target.value < 1) event.target.value = 1;
  updateCart();
});

const storedCart = getStoredCart();
if (storedCart) {
  renderStoredCart(storedCart);
}

checkoutButton.addEventListener('click', () => {
  const items = [...document.querySelectorAll('.cart-item')];

  if (items.length === 0) {
    window.alert('Sua sacola está vazia. Adicione uma peça antes de continuar.');
    return;
  }

  const products = items.map((item) => {
    const name = item.querySelector('.cart-product-heading h2').textContent.trim();
    const size = item.querySelector('select').value;
    const quantity = Number(item.querySelector('.quantity-input').value);
    const price = Number(item.dataset.price) * quantity;
    return `* ${quantity}× ${name} — Tam. ${size} — ${formatCurrency(price)}`;
  }).join('\n');

  const message = [
    'Olá, Use.Brito! Gostaria de solicitar atendimento sobre as peças abaixo:',
    '',
    products,
    '',
    `Subtotal da seleção: ${total.textContent.trim()}`,
    `Referência: ${getOrderReference()}`,
    '',
    'Fico no aguardo para confirmar disponibilidade e entrega.'
  ].join('\n');

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
});

updateCart();