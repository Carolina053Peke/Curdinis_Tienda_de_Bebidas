class Cart {
  constructor(cartName, subtotal, IVA, total) {
    this.cartName = cartName;
    this.subtotal = subtotal;
    this.IVA = IVA;
    this.total = total;
    this.items = [];
    this.init = (function () {
      if (sessionStorage.getItem(cartName) == null) {
        sessionStorage.setItem(cartName, "");
      }
      if (sessionStorage.getItem(cartName + "_total") == null) {
        sessionStorage.setItem(cartName + "_total", 0);
      }
    })();
  }
  addToCart(item) {
    let stored = sessionStorage.getItem(this.cartName);
    let existingItems = [];

    if (stored && stored.length > 0) {
      try {
        existingItems = JSON.parse(stored);
      } catch (e) {
        console.error("Carrito corrupto al agregar:", stored);
      }
    }

    let found = existingItems.find((prod) => prod.id === item.id);
    if (found) {
      found.quantity = (found.quantity || 1) + 1;
    } else {
      item.quantity = 1;
      existingItems.push(item);
    }

    this.items = existingItems;
    sessionStorage.setItem(this.cartName, JSON.stringify(this.items));
  }
  removeItem(id) {
    let cartItems = "";
    let cartObj = [];
    if (sessionStorage.getItem(this.cartName).length > 0) {
      let cartItems = sessionStorage.getItem(this.cartName);
      let cartObj = JSON.parse(cartItems);

      const index = cartObj
        .map((e) => {
          return e.id;
        })
        .indexOf(id);
      if (index > -1) {
        cartObj.splice(index, 1);
      }
      this.items = cartObj;
      let jsonStr = JSON.stringify(this.items);
      sessionStorage.setItem(this.cartName, jsonStr);
    }
  }
  calculateCart() {
    let stored = sessionStorage.getItem(this.cartName);
    let cartItems = [];

    if (stored && stored.length > 0) {
      try {
        cartItems = JSON.parse(stored);
      } catch (e) {
        console.error("Datos corruptos en el carrito:", stored);
      }
    }

    this.items = cartItems;
    let preTotal = 0;

    this.items.forEach(item => {
      const quantity = item.quantity || 1;
      const price = parseFloat(item.price) || 0;
      preTotal += price * quantity;
    });

    this.subtotal = preTotal;
    this.IVA = parseFloat((this.subtotal * 0.21).toFixed(2));
    this.total = parseFloat((this.subtotal + this.IVA).toFixed(2));
  }
}
//Inicializo el carrito
let carrito = new Cart("cartGenki", 0, 0, 0);

// Comportamiento seccion Carrito
let cart = document.querySelector(".shopping-cart-container");

document.querySelector("#cart-btn").onclick = () => {
  cart.classList.toggle("active");
  navbar.classList.remove("active");

  removeChildren({ parentId: "cart-list", childName: "box" });
  cartLoad();
  renderResumen();
};

// Comportamiento NavBar
let navbar = document.querySelector(".header .navbar");

document.querySelector("#menu-btn").onclick = () => {
  navbar.classList.toggle("active");
  cart.classList.remove("active");
};

window.onscroll = () => {
  navbar.classList.remove("active");
};
// Cerrar el carrito al hacer clic fuera de él
document.querySelectorAll(".navbar a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelector(".shopping-cart-container").classList.remove("active");
    navbar.classList.remove("active");
  });
});

document.querySelector(".home").onmousemove = (e) => {
  let x = (window.innerWidth - e.pageX * 2) / 90;
  let y = (window.innerHeight - e.pageY * 2) / 90;

  document.querySelector(
    ".home .home-parallax-img"
  ).style.transform = `translateX(${y}px) translateY(${x}px)`;
};

document.querySelector(".home").onmouseleave = () => {
  document.querySelector(
    ".home .home-parallax-img"
  ).style.transform = `translateX(0px) translateY(0px)`;
};

// Funciones onLoad
window.onload = function () {
  loadProducts(data);

  // Cargar categorías únicas
  let unicos = [...new Set(data.map((item) => item.category))];

  unicos.forEach((element, index) => {
    let div = document.createElement("div");
    div.setAttribute("class", "box");
    div.innerHTML = `
      <img src="image/cat-${index + 1}.png" alt="${element}">
      <h3>${element}</h3>
    `;
    document.getElementById("categories").appendChild(div);
  });

  // Evento click para agregar productos al carrito
  $("#product-list").on("click", ".btn", function () {
    let clicked = $(this).closest(".box");
    let id = parseInt(clicked.attr("id"));
    if (isNaN(id)) return;

    let producto = data.find((element) => element.id === id);
    if (!producto) {
      console.warn("Producto no encontrado con id:", id);
      return;
    }

    const selected = {
      id: producto.id,
      name: producto.name,
      price: Number(producto.price),
      quantity: 1,
      image: producto.image,
      category: producto.category  // 👈 Agregalo así
    };

    carrito.addToCart(selected);
    cartLoad();             // Carga visual del carrito
    updateCartCount();      // Actualiza el icono del carrito
  });

  updateCartCount(); // Al cargar, mostrar cantidad actual
};


// FIN Funciones onLoad

// Filtros de producto
document.querySelector("#categories").onmouseover = () => {
  let contenedor = document.querySelectorAll("#categories .box");
  var cat = "";
  for (let i = 0, len = contenedor.length; i < len; i++) {
    contenedor[i].onclick = () => {
      cat = contenedor[i].childNodes[3].innerHTML;
      if (cat != "Todos") {
        let filtro = data.filter((prod) => prod.category == cat);
        removeChildren({ parentId: "product-list", childName: "box" });
        loadProducts(filtro);
      } else {
        removeChildren({ parentId: "product-list", childName: "box" });
        loadProducts(data);
      }
    };
  }
};

// ⬆️ Podés ponerla cerca de otras funciones generales

function getIconForCategory(category) {
  switch (category) {
    case 'Cervezas': return '🍺';
    case 'Vinos': return '🍷';
    case 'Aperitivos': return '🥃';
    case 'Sin Alcohol': return '🥤';
    default: return '🧃';
  }
}


//Envio de msj de whatsapp
document.querySelector('#place-order').onmouseover = () => {
  const nombre = document.getElementById('nombre')?.value || "(sin nombre)";
  const direccion = document.getElementById('direccion')?.value || "(sin dirección)";
  let message = `Hola! Te paso mi pedido:%0A`;
  message += `👤 Nombre: ${nombre}%0A📍 Dirección: ${direccion}%0A%0A`;

  const orderObj = JSON.parse(sessionStorage.getItem(carrito.cartName)) || [];

  orderObj.forEach((element) => {
    let qty = element.quantity || 1;
    let subtotal = Number(element.price) * qty;
    message += `${getIconForCategory(element.category)} ${element.name}%0A  Cantidad: x${qty}%0A  Subtotal: $${subtotal}%0A%0A`;
  });

  let wappLink = `https://api.whatsapp.com/send?phone=541141755248&text=${message}`;
  document.querySelector('#place-order').setAttribute('href', wappLink);
};


// Funcion eliminar del carrito
$(".products-container .box-container").on(
  "mouseover",
  ".fas.fa-times",
  function () {
    const card = document.querySelectorAll(
      ".products-container .box-container .box"
    );
    for (let i = 0, len = card.length; i < len; i++) {
      card[i].onclick = function () {
        let index = data.find(e => e.name == card[i].querySelector("h3").innerText).id;
        carrito.removeItem(index);

        card[i].parentNode.removeChild(card[i]);
        renderResumen();
      };
    }
  }
);

// Actualiza el contador del carrito al cargar la página
function updateCartCount() {
let stored = sessionStorage.getItem(carrito.cartName);
let cart = [];
if (stored && stored.length > 0) {
  try {
    cart = JSON.parse(stored);
  } catch (e) {
    console.error("Carrito corrupto en sessionStorage:", stored);
  }
}

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.getElementById("cart-count").innerText = totalItems;
}

// Funcion llenar carrito
function cartLoad() {
  const container = document.querySelector(".products-container .box-container");
  container.innerHTML = "";

  let stored = sessionStorage.getItem(carrito.cartName);
  let cartObj = [];

  if (stored && stored.length > 0) {
    try {
      cartObj = JSON.parse(stored);
    } catch (e) {
      console.error("Error al leer carrito:", stored);
    }
  }

  cartObj.forEach((element, index) => {
    let quantity = element.quantity || 1;
    let div = document.createElement("div");
    div.setAttribute("class", "box");

    div.innerHTML = `
      <i class="fas fa-times" onclick="removeItem(${index})"></i>
      <img src="image/${element.image}" alt="${element.name}" class="cart-img">
      <div class="content">
        <h3>${element.name}</h3>
        <div class="quantity-control">
          <button class="btn-qty" onclick="changeQuantity(${index}, -1)">−</button>
          <span> x${quantity} </span>
          <button class="btn-qty" onclick="changeQuantity(${index}, 1)">+</button>
        </div>
        <span> Precio: </span>
        <span class="price"> $${(Number(element.price) * quantity).toFixed(2)} </span>
      </div>
    `;

    container.appendChild(div);
  });

  renderResumen();
  updateCartCount();
}


function changeQuantity(index, delta) {
  let cart = JSON.parse(sessionStorage.getItem(carrito.cartName));
  cart[index].quantity = (cart[index].quantity || 1) + delta;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  sessionStorage.setItem(carrito.cartName, JSON.stringify(cart));

  cartLoad();              // 🔁 esto refresca el carrito
  carrito.calculateCart(); // ✅ recalcula totales
  renderResumen();         // ✅ muestra los totales actualizados
  updateCartCount();       // 🔁 actualiza el número del ícono carrito
}

function removeItem(index) {
  let cart = JSON.parse(sessionStorage.getItem(carrito.cartName));
  cart.splice(index, 1);
  sessionStorage.setItem(carrito.cartName, JSON.stringify(cart));
  cartLoad();             // actualiza el DOM
  carrito.calculateCart(); // 👈 esto asegura que los totales se recalculen
  renderResumen();         // 👈 y que se muestren correctamente
  updateCartCount(); // 🔄 actualiza el contador del carrito
}

// Funcion recalculo resumen
function renderResumen() {
  carrito.calculateCart();
  document.querySelector(
    ".cart-total .box .subtotal span"
  ).innerHTML = `<span>$${carrito.subtotal}</span>`;

  document.querySelector("#iva span").innerHTML = `<span>$${carrito.IVA.toFixed(
    2
  )}</span>`;

  document.querySelector(
    ".cart-total .box .total span"
  ).innerHTML = `<span>$${carrito.total.toFixed(2)}</span>`;
}

// Funcion vaciar lista
function removeChildren(params) {
  let parentId = params.parentId;
  let childName = params.childName;

  let childNodes = document.getElementById(parentId).childNodes;
  for (let i = childNodes.length - 1; i >= 0; i--) {
    let childNode = childNodes[i];
    if (childNode.className == childName) {
      childNode.parentNode.removeChild(childNode);
    }
  }
}

// Funcion carga de productos
function loadProducts(array) {
  array.forEach((element) => {
    let div = document.createElement("div");
    div.setAttribute("class", "box");
    div.setAttribute("id", element.id);
    div.innerHTML = `
        <div class="image">
        <img src="image/${element.image}" alt="${element.name}">
        </div>
        <div class="content">
            <h3>${element.name}</h3>
            <div class="price">$${element.price}</div>
            <a class="btn">agregar</a>
        </div>
    `;
    document.getElementById("product-list").appendChild(div);
  });
}

function agregarAlCarrito(producto) {
  if (!producto.name || !producto.price || isNaN(producto.price)) {
    console.warn("Producto inválido:", producto);
    return;
  }

  producto.price = Number(producto.price); // 🔁 Asegurar que el precio es número

  let cart = JSON.parse(sessionStorage.getItem(carrito.cartName)) || [];

  let existente = cart.find(item => item.id === producto.id);
  if (existente) {
    existente.quantity = (existente.quantity || 1) + 1;
  } else {
    producto.quantity = 1;
    cart.push(producto);
  }

  sessionStorage.setItem(carrito.cartName, JSON.stringify(cart));
  cartLoad();
  updateCartCount();
}

function enviarPorWhatsApp(event) {
  event.preventDefault();

  const nombre = document.getElementById('nombre')?.value || "";
  const telefono = document.getElementById('telefono')?.value || "";
  const direccion = document.getElementById('direccion')?.value || "";
  const mensaje = document.getElementById('mensaje')?.value || "";

  if (!nombre || !telefono || !mensaje) {
    alert("Por favor completá nombre, teléfono y mensaje.");
    return;
  }

  const texto = `Hola! 👋%0A
🧍 Nombre: ${nombre}%0A
📞 Teléfono: ${telefono}%0A
🏠 Dirección: ${direccion}%0A
📝 Mensaje: ${mensaje}`.trim();

  const url = `https://api.whatsapp.com/send?phone=541141755248&text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");

  // ✅ Limpia los campos
  document.getElementById('nombre').value = '';
  document.getElementById('telefono').value = '';
  document.getElementById('direccion').value = '';
  document.getElementById('mensaje').value = '';
}
