async function carregarDestaques() {
  const container = document.getElementById("produtos-container");
  if (!container) return; // evita rodar em páginas sem esse container

  container.innerHTML = "<p>Carregando...</p>";

  try {
    const res = await fetch("https://dummyjson.com/products?limit=100");
    const data = await res.json();
    const produtos = data.products;

    // Embaralha os produtos para escolher aleatórios
    const destaque = produtos.sort(() => Math.random() - 0.5).slice(0, 8);

    container.innerHTML = destaque.map(p => montarCard(p)).join("");

    ativarFuncoesBotoes(destaque);

  } catch (erro) {
    container.innerHTML = "<p>Erro ao carregar produtos em destaque.</p>";
    console.error(erro);
  }
}

function ativarFuncoesBotoes(lista) {
  const botoesCarrinho = document.querySelectorAll(".btn-carrinho");
  botoesCarrinho.forEach((botao, index) => {
    botao.addEventListener("click", () => {
      addCarrinho(lista[index]);
    });
  });

  const botoesComprar = document.querySelectorAll(".btn-comprar");
  botoesComprar.forEach((botao, index) => {
    botao.addEventListener("click", () => {
      addCarrinho(lista[index]);
      window.location.href = "shopping.html";
    });
  });
}

// chama automaticamente na página inicial
carregarDestaques();


function montarCard(produto) {
  return `
    <div class="card">
      <img src="${produto.thumbnail}" alt="${produto.title}">
      <h2>${produto.title}</h2>
      <p>${produto.description}</p>
      <div class="price">Price: R$ ${produto.price}</div>
      <div class="rating">Ranking: ${produto.rating}</div>
      <div class="botoes">
        <button class="btn btn-success btn-comprar">Buy</button>
        <button class="btn btn-outline-primary btn-carrinho">
          <span class="material-symbols-outlined">add_shopping_cart</span>
        </button>
      </div>
    </div>
  `;
}

function addCarrinho(produto) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push(produto);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  alert(`${produto.title} adicionado ao carrinho!`);
}

// ---- Página shopping.html ---- //
// ---- Adiciona botão remover ---- //
const carrinhoContainer = document.getElementById("carrinho-container");

if (carrinhoContainer) {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  let total = 0;

  carrinhoContainer.innerHTML = carrinho.map((item, index) => {
    total += item.price;
    return `
      <div class="card">
        <img src="${item.thumbnail}" alt="${item.title}">
        <h2>${item.title}</h2>
        <p>${item.description}</p>
        <div class="price">Preço: R$ ${item.price.toFixed(2)}</div>
        <button class="btn btn-success btn-comprar">Buy</button>
        <button class="btn-remover" data-index="${index}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;
  }).join("");

  const botoesRemover = document.querySelectorAll(".btn-remover");
  botoesRemover.forEach(botao => {
    botao.addEventListener("click", () => {
      const index = botao.getAttribute("data-index");
      removerDoCarrinho(index);
    });
  });

  document.getElementById("total").textContent = `Total: R$ ${total.toFixed(2)}`;
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  window.location.reload();
}

// Adicionando slide que percorre img's automaticamente //

let index = 0;
const slides = document.querySelectorAll(".slide");

function showNextSlide() {
  slides[index].classList.remove("active");
  index = (index + 1) % slides.length;
  slides[index].classList.add("active");
}

setInterval(showNextSlide, 3000); // troca a cada 3 segundos //


// adicionando função ao botão de pesquisa //
// ---------------- PESQUISA COM AUTOCOMPLETE BONITO ---------------- //
const form = document.querySelector('form[role="search"]');
const input = document.querySelector('input[type="search"]');

// Cria container para as sugestões, fora do fluxo do header
const sugestoes = document.createElement("div");
sugestoes.classList.add("sugestoes-container");
document.body.appendChild(sugestoes);

let produtosGlobais = [];

// Captura os produtos já carregados (espera 1s pelo fetch principal)
setTimeout(() => {
  const container = document.getElementById("produto-container");
  if (container && container.children.length > 0) {
    const produtos = Array.from(container.querySelectorAll(".card h2")).map(
      el => el.textContent
    );
    produtosGlobais = produtos;
  }
}, 1000);

// Posiciona a lista de sugestões logo abaixo do campo de busca
function posicionarSugestoes() {
  const rect = input.getBoundingClientRect();
  sugestoes.style.position = "absolute";
  sugestoes.style.top = rect.bottom + window.scrollY + "px";
  sugestoes.style.left = rect.left + "px";
  sugestoes.style.width = rect.width + "px";
}

// Atualiza posição ao rolar a página
window.addEventListener("scroll", posicionarSugestoes);

// Ao digitar no campo
input.addEventListener("input", () => {
  const filtro = input.value.toLowerCase();
  sugestoes.innerHTML = "";
  if (filtro.length === 0) return;

  const resultados = produtosGlobais.filter(p =>
    p.toLowerCase().startsWith(filtro)
  );

  resultados.slice(0, 5).forEach(produto => {
    const item = document.createElement("div");
    item.textContent = produto;
    item.classList.add("sugestao-item");

    item.addEventListener("click", () => {
      input.value = produto;
      sugestoes.innerHTML = "";
      filtrarCards(produto);
    });

    sugestoes.appendChild(item);
  });

  posicionarSugestoes();
});

// Quando enviar o formulário
form.addEventListener("submit", e => {
  e.preventDefault();
  filtrarCards(input.value);
  sugestoes.innerHTML = "";
});

// Função que filtra os cards
function filtrarCards(texto) {
  const filtro = texto.toLowerCase();
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    const conteudo = card.textContent.toLowerCase();
    card.style.display = conteudo.includes(filtro) ? "block" : "none";
  });
}

// Adicionando mapa //
const btn = document.getElementById("btnLocalizar");
const resultado = document.getElementById("resultado");

// coordenadas fixas da loja
const lojaCoords = [-30.000147, -51.200794];

// cria o mapa no footer (único mapa)
const map = L.map("map").setView(lojaCoords, 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// marcador fixo da loja
const lojaMarker = L.marker(lojaCoords).addTo(map)
  .bindPopup("🏪 Nossa loja está aqui!")
  .openPopup();

// botão de localização
btn.addEventListener("click", () => {
  if (navigator.geolocation) {
    resultado.innerHTML = "🔍 Looking for your location...";
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    resultado.innerHTML = "❌ Geolocation is not supported in this browser.";
  }
});

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const userCoords = [lat, lon];

  // calcula distância
  const distancia = getDistanceFromLatLonInKm(lat, lon, lojaCoords[0], lojaCoords[1]);

  resultado.innerHTML = `
    📍 <strong>Location found!</strong><br>
    🧭 Latitude: ${lat.toFixed(6)}<br>
    🧭 Longitude: ${lon.toFixed(6)}<br>
    📏 Distance to the store: <strong>${distancia.toFixed(2)} km</strong>
  `;

  // remove linha anterior se existir
  map.eachLayer(layer => {
    if (layer instanceof L.Polyline) map.removeLayer(layer);
  });

  // marcador do usuário
  L.marker(userCoords).addTo(map)
    .bindPopup("📍 Você está aqui!").openPopup();

  // linha azul entre loja e usuário
  L.polyline([lojaCoords, userCoords], { color: "blue" }).addTo(map);

  // ajusta o zoom pra ver os dois
  const bounds = L.latLngBounds([lojaCoords, userCoords]);
  map.fitBounds(bounds);
}

// função pra calcular distância (km)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // raio da Terra em km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      resultado.innerHTML = "🚫 Permissão negada pelo usuário.";
      break;
    case error.POSITION_UNAVAILABLE:
      resultado.innerHTML = "⚠️ Localização indisponível.";
      break;
    case error.TIMEOUT:
      resultado.innerHTML = "⏱️ Tempo esgotado.";
      break;
    default:
      resultado.innerHTML = "❓ Erro desconhecido.";
  }
}

// Lista das categorias que você quer usar
const categorias = {
  "fragrances": "Frangances",
  "beauty": "Cosmétics",
  "home-decoration": "Home Decoration",
  "groceries": "Food and Drinks"
};

// Onde todas as categorias vão aparecer
const listaCategorias = document.getElementById("lista-categorias");

// Função que monta o card do produto (igual a sua)
function montarCard(produto) {
  return `
    <div class="card">
      <img src="${produto.thumbnail}" alt="${produto.title}">
      <h2>${produto.title}</h2>
      <p>${produto.description}</p>
      <div class="price">Price: R$ ${produto.price}</div>
      <div class="rating">Ranking: ${produto.rating}</div>
      <div class="botoes">
        <button class="btn btn-success btn-comprar">Buy</button>
        <button class="btn btn-outline-primary btn-carrinho">
          <span class="material-symbols-outlined">add_shopping_cart</span>
        </button>
      </div>
    </div>
  `;
}

// Função principal para criar cada categoria na tela
async function carregarCategorias() {
  for (const categoria in categorias) {

    // Cria bloco da categoria
    const bloco = document.createElement("div");
    bloco.classList.add("categoria-bloco");

    // Título da categoria
    bloco.innerHTML = `<h2 class="titulo-categoria">${categorias[categoria]}</h2>`;

    // Div onde ficam os produtos
    const area = document.createElement("div");
    area.classList.add("area-produtos");

    bloco.appendChild(area);
    listaCategorias.appendChild(bloco);

    // Busca os produtos da categoria
    const res = await fetch(`https://dummyjson.com/products/category/${categoria}`);
    const data = await res.json();

    // Adiciona os cards do produto
    area.innerHTML = data.products.map(produto => montarCard(produto)).join("");
  }
}

// Chama a função que monta tudo
carregarCategorias();



