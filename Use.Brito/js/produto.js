const products = {
  aurora: {
    name: 'Camisa Aurora',
    category: 'Camisas / Novo',
    price: 'R$ 289',
    description: 'Leve, natural e fácil de combinar. A Aurora tem corte essencial e linho que acompanha o movimento do dia.',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1000&q=85',
    alt: 'Camisa de linho off-white'
  },
  reta: {
    name: 'Calça Reta',
    category: 'Alfaiataria',
    price: 'R$ 349',
    description: 'Uma silhueta limpa para todos os momentos. Algodão estruturado, cintura confortável e caimento preciso.',
    image: 'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?auto=format&fit=crop&w=1000&q=85',
    alt: 'Calça reta de alfaiataria bege'
  },
  norte: {
    name: 'Jaqueta Norte',
    category: 'Casacos / Best-seller',
    price: 'R$ 599',
    description: 'Textura marcante e presença sem esforço. Couro macio em uma jaqueta para usar por muitos anos.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
    alt: 'Jaqueta de couro marrom escuro'
  }
};

const productKey = new URLSearchParams(window.location.search).get('produto');
const product = products[productKey];
const detail = document.querySelector('#product-detail');
const notFound = document.querySelector('#product-not-found');
const addToCartButton = document.querySelector('#add-to-cart');
const bagCount = document.querySelector('.bag-button span');
const cartStorageKey = 'useBritoCart';

const getCart = () => {
  try {
    const storedCart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    return Array.isArray(storedCart) ? storedCart : [];
  } catch {
    localStorage.removeItem(cartStorageKey);
    return [];
  }
};
const saveCart = (cart) => localStorage.setItem(cartStorageKey, JSON.stringify(cart));

if (!product) {
  detail.hidden = true;
  notFound.hidden = false;
} else {
  document.title = `${product.name} | Use Brito`;
  document.querySelector('#product-image').src = product.image;
  document.querySelector('#product-image').alt = product.alt;
  document.querySelector('#product-name').textContent = product.name;
  document.querySelector('#product-category').textContent = product.category;
  document.querySelector('#product-price').textContent = product.price;
  document.querySelector('#product-description').textContent = product.description;
  document.querySelector('#breadcrumb-name').textContent = product.name;

  const updateBagCount = () => {
    bagCount.textContent = getCart().reduce((sum, item) => sum + item.quantity, 0);
  };

  const quantityOutput = document.querySelector('#product-quantity');
  let selectedQuantity = 1;

  document.querySelector('#decrease-quantity').addEventListener('click', () => {
    selectedQuantity = Math.max(1, selectedQuantity - 1);
    quantityOutput.value = selectedQuantity;
    quantityOutput.textContent = selectedQuantity;
  });

  document.querySelector('#increase-quantity').addEventListener('click', () => {
    selectedQuantity += 1;
    quantityOutput.value = selectedQuantity;
    quantityOutput.textContent = selectedQuantity;
  });

  addToCartButton.addEventListener('click', () => {
    const selectedSize = document.querySelector('.product-option.selected').textContent.trim();
    const cart = getCart();
    const existingItem = cart.find((item) => item.id === productKey && item.size === selectedSize);

    if (existingItem) {
      existingItem.quantity += selectedQuantity;
    } else {
      cart.push({
        id: productKey,
        name: product.name,
        category: product.category.split(' / ')[0],
        price: Number(product.price.replace(/[^0-9]/g, '')),
        image: product.image,
        alt: product.alt,
        size: selectedSize,
        quantity: selectedQuantity
      });
    }

    saveCart(cart);
    updateBagCount();
    addToCartButton.innerHTML = 'Adicionado à sacola <span>✓</span>';
    addToCartButton.classList.add('added-to-cart');
    window.setTimeout(() => {
      addToCartButton.innerHTML = 'Adicionar à sacola <span>↗</span>';
      addToCartButton.classList.remove('added-to-cart');
    }, 1800);
  });

  updateBagCount();
}

document.querySelectorAll('.product-option').forEach((option) => {
  option.addEventListener('click', () => {
    document.querySelector('.product-option.selected').classList.remove('selected');
    option.classList.add('selected');
  });
});
