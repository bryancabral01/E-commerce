fetch("https://dummyjson.com/products")
  .then(res => res.json())
  .then(data => {
    const produtos = data.products;

    const selecionados = produtos; // pega todos os produtos

    const container = document.getElementById("produto-container");
    container.innerHTML = selecionados.map(p => montarCard(p)).join("");

    // Ativa botões de carrinho
    const botoesCarrinho = document.querySelectorAll(".btn-carrinho");
    botoesCarrinho.forEach((botao, index) => {
      botao.addEventListener("click", () => {
        addCarrinho(selecionados[index]);
      });
    });

    // Ativa botões de comprar
    const botoesComprar = document.querySelectorAll(".btn-comprar");
    botoesComprar.forEach((botao, index) => {
      botao.addEventListener("click", () => {
        const produtoSelecionado = selecionados[index];
        addCarrinho(produtoSelecionado);
        window.location.href = "shopping.html";
      });
    });
  })
  .catch(error => {
    console.error("Erro ao carregar produtos", error);
    document.getElementById("produto-container").innerHTML =
      "<p>Erro ao carregar produtos</p>";
  });

function montarCard(produto) {
  return `
    <div class="card">
      <img src="${produto.thumbnail}" alt="${produto.title}">
      <h2>${produto.title}</h2>
      <p>${produto.description}</p>
      <div class="price">Preço: R$ ${produto.price}</div>
      <div class="rating">Ranking: ${produto.rating}</div>
      <div class="botoes">
        <button class="btn btn-success btn-comprar">Comprar</button>
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
        <button class="btn btn-success btn-comprar">Comprar</button>
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

