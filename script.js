/* ============================
   SCRIPT UNIFICADO SEGURO
   Mantém sua lógica original e evita que o JS quebre em páginas sem certos elementos.
   ============================ */

(() => {
  // ----- Helpers -----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ======================================================================
     1) MONTAR CARD (usado em destaque e categorias)
     ====================================================================== */
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

  /* ======================================================================
     2) CARRINHO - add / remover
     ====================================================================== */
  function addCarrinho(produto) {
    if (!produto) return;
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    carrinho.push(produto);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert(`${produto.title} adicionado ao carrinho!`);
  }

  function removerDoCarrinho(index) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    // atualiza a página de shopping sem forçar reload total se preferir usar re-render
    window.location.reload();
  }

  /* ======================================================================
     3) ATIVAR EVENTOS DOS BOTOES (reutilizável)
     - recebe uma lista (array) de produtos que corresponde aos cards gerados
     ====================================================================== */
  function ativarFuncoesBotoes(lista) {
    if (!lista || !Array.isArray(lista)) return;

    const botoesCarrinho = $$(".btn-carrinho");
    botoesCarrinho.forEach((botao, index) => {
      // remove listeners duplicados (seguro quando re-renderiza)
      botao.replaceWith(botao.cloneNode(true));
    });

    // re-query após clone removido
    const botoesCarrinho2 = $$(".btn-carrinho");
    botoesCarrinho2.forEach((botao, index) => {
      botao.addEventListener("click", () => {
        // protege caso index >= lista.length
        if (lista[index]) addCarrinho(lista[index]);
        else console.warn("Produto não encontrado para o índice:", index);
      });
    });

    const botoesComprar = $$(".btn-comprar");
    botoesComprar.forEach((botao, index) => {
      botao.replaceWith(botao.cloneNode(true));
    });
    const botoesComprar2 = $$(".btn-comprar");
    botoesComprar2.forEach((botao, index) => {
      botao.addEventListener("click", () => {
        abrirQR();
      });
    });
  }

  /* ======================================================================
     4) DESTAQUES (index)
     ====================================================================== */
  async function carregarDestaques() {
    const container = document.getElementById("produtos-container"); // seu id original
    if (!container) return; // não está na página -> não faz nada

    container.innerHTML = "<p>Carregando...</p>";
    try {
      const res = await fetch("https://dummyjson.com/products?limit=100");
      const data = await res.json();
      const produtos = data.products || [];

      // escolhe aleatórios
      const destaque = produtos.sort(() => Math.random() - 0.5).slice(0, 8);
      container.innerHTML = destaque.map(p => montarCard(p)).join("");
      ativarFuncoesBotoes(destaque);

    } catch (erro) {
      container.innerHTML = "<p>Erro ao carregar produtos em destaque.</p>";
      console.error(erro);
    }
  }

  /* ======================================================================
     5) CATEGORIAS (página que lista categorias)
     ====================================================================== */
  const categorias = {
    "fragrances": "Fragrances",
    "beauty": "Cosmetics",
    "home-decoration": "Home Decoration",
    "groceries": "Food and Drinks"
  };

  async function carregarCategorias() {
    const listaCategorias = document.getElementById("lista-categorias");
    if (!listaCategorias) return;

    for (const categoria in categorias) {
      const bloco = document.createElement("div");
      bloco.classList.add("categoria-bloco");
      bloco.innerHTML = `<h2 class="titulo-categoria">${categorias[categoria]}</h2>`;

      const area = document.createElement("div");
      area.classList.add("area-produtos");
      bloco.appendChild(area);
      listaCategorias.appendChild(bloco);

      try {
        const res = await fetch(`https://dummyjson.com/products/category/${categoria}`);
        const data = await res.json();
        const produtos = data.products || [];
        area.innerHTML = produtos.map(prod => montarCard(prod)).join("");
        // Ativa botões com a lista daquela categoria
        ativarFuncoesBotoes(produtos);
      } catch (err) {
        console.error("Erro ao carregar categoria", categoria, err);
        area.innerHTML = "<p>Erro ao carregar produtos desta categoria.</p>";
      }
    }
  }

  /* ======================================================================
     6) SHOPPING (listar itens do carrinho) - executa apenas em shopping.html
     ====================================================================== */
  function renderizarCarrinhoPagina() {
    const carrinhoContainer = document.getElementById("carrinho-container");
    if (!carrinhoContainer) return;

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    let total = 0;

    carrinhoContainer.innerHTML = carrinho.map((item, index) => {
  total += item.price || (parseFloat(item.preco) || 0) || 0;
  return `
    <div class="card">
      <img src="${item.thumbnail || item.image || ''}" alt="${item.title || item.nome || ''}">
      <h2>${item.title || item.nome || 'Produto'}</h2>
      <p>${item.description || ''}</p>
      <div class="price">Preço: R$ ${(item.price || item.preco || 0).toFixed ? (item.price || item.preco).toFixed(2) : item.price || item.preco}</div>

      <div class="botoes">
        <button class="btn btn-success btn-comprar-carrinho" data-index="${index}">
          Buy
        </button>

        <button class="btn btn-outline-danger btn-remover" data-index="${index}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  `;
}).join("");

// botão remover
$$(".btn-remover").forEach(btn => {
  btn.addEventListener("click", () => {
    const idx = parseInt(btn.getAttribute("data-index"), 10);
    removerDoCarrinho(idx);
  });
});

// botão comprar
const botoesComprarCarrinho = $$(".btn-comprar-carrinho");
botoesComprarCarrinho.forEach(btn => {
  btn.addEventListener("click", () => {
    abrirQR();
  });
});



    // ativa botões remover
    $$(".btn-remover").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        removerDoCarrinho(idx);
      });
    });

    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.textContent = `Total: R$ ${total.toFixed(2)}`;
  }

  /* ======================================================================
     7) SLIDESHOW - só quando existir .slide
     ====================================================================== */
  function initSlideshow() {
    const slides = $$(".slide");
    if (!slides || slides.length === 0) return;

    let idx = 0;
    slides[idx].classList.add("active");
    setInterval(() => {
      slides[idx].classList.remove("active");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("active");
    }, 3000);
  }

  /* ======================================================================
     8) PESQUISA / AUTOCOMPLETE - só se existir o formulário
     ====================================================================== */
  function initPesquisa() {
    const form = document.querySelector('form[role="search"]');
    const input = document.querySelector('input[type="search"]');

    // se não existir input ou form, ignora
    if (!form || !input) return;

    // container custom de sugestões (se já não existir)
    let sugestoes = document.querySelector(".sugestoes-container");
    if (!sugestoes) {
      sugestoes = document.createElement("div");
      sugestoes.classList.add("sugestoes-container");
      document.body.appendChild(sugestoes);
    }

    let produtosGlobais = [];
    setTimeout(() => {
      const container = document.getElementById("produto-container") || document.getElementById("produtos-container") || document.getElementById("lista-categorias");
      if (container) {
        produtosGlobais = Array.from(container.querySelectorAll(".card h2")).map(el => el.textContent);
      }
    }, 800);

    function posicionarSugestoes() {
      const rect = input.getBoundingClientRect();
      sugestoes.style.position = "absolute";
      sugestoes.style.top = rect.bottom + window.scrollY + "px";
      sugestoes.style.left = rect.left + "px";
      sugestoes.style.width = rect.width + "px";
    }
    window.addEventListener("scroll", () => posicionarSugestoes());

    input.addEventListener("input", () => {
      const filtro = input.value.toLowerCase();
      sugestoes.innerHTML = "";
      if (filtro.length === 0) return;
      const resultados = produtosGlobais.filter(p => p.toLowerCase().startsWith(filtro)).slice(0, 5);
      resultados.forEach(produto => {
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

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      filtrarCards(input.value);
      sugestoes.innerHTML = "";
    });
  }

  function filtrarCards(texto) {
    const filtro = texto.toLowerCase();
    $$(".card").forEach(card => {
      const conteudo = card.textContent.toLowerCase();
      card.style.display = conteudo.includes(filtro) ? "block" : "none";
    });
  }

  /* ======================================================================
     9) MAPA (contato.html)
     ====================================================================== */
  function initMapa() {
    const mapEl = document.getElementById("map");
    const btn = document.getElementById("btnLocalizar");
    const resultado = document.getElementById("resultado");
    if (!mapEl) return;

    const lojaCoords = [-30.000147, -51.200794];
    const map = L.map("map").setView(lojaCoords, 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker(lojaCoords).addTo(map).bindPopup("🏪 Nossa loja está aqui!").openPopup();

    if (btn) {
      btn.addEventListener("click", () => {
        if (!navigator.geolocation) {
          if (resultado) resultado.innerHTML = "❌ Geolocation is not supported in this browser.";
          return;
        }
        if (resultado) resultado.innerHTML = "🔍 Looking for your location...";
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const userCoords = [lat, lon];

          if (resultado) {
            const distancia = getDistanceFromLatLonInKm(lat, lon, lojaCoords[0], lojaCoords[1]);
            resultado.innerHTML = `
              📍 <strong>Location found!</strong><br>
              🧭 Latitude: ${lat.toFixed(6)}<br>
              🧭 Longitude: ${lon.toFixed(6)}<br>
              📏 Distance to the store: <strong>${distancia.toFixed(2)} km</strong>
            `;
          }

          L.marker(userCoords).addTo(map).bindPopup("📍 Você está aqui!").openPopup();
          L.polyline([lojaCoords, userCoords], { color: "blue" }).addTo(map);
          const bounds = L.latLngBounds([lojaCoords, userCoords]);
          map.fitBounds(bounds);
        }, (error) => {
          if (resultado) {
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
        });
      });
    }
  }

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
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

  /* ======================================================================
     10) Inicializações (chama apenas o que existe)
     ====================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    // Mantém sua lógica original ativa
    carregarDestaques().catch(()=>{}); // se não estiver na página, retorna
    carregarCategorias().catch(()=>{});

    // Shopping: renderiza carrinho (se estiver na página)
    renderizarCarrinhoPagina();

    // Slideshow / Pesquisa / Mapa
    initSlideshow();
    initPesquisa();
    initMapa();
  });

  function abrirQR() {
    const qr = document.getElementById("qr-container");
    if (qr) qr.style.display = "block";
  }

  function fecharQR() {
    const qr = document.getElementById("qr-container");
    if (qr) qr.style.display = "none";
  }

  document.addEventListener("click", (e) => {
    if (e.target.id === "fecharQR") fecharQR();
  });
})();
