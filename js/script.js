// Carga de JSON Productos
let data = [];
$.getJSON("/data/productos.json", (datos) => {
  datos.forEach((element) => {
    data.push(element);
  });
});

// Definición Clase para carrito y sus metodos
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
    if (
      this.items.length == 0 &&
      sessionStorage.getItem(this.cartName).length > 2
    ) {
      let cartItems = sessionStorage.getItem(this.cartName);
      let cartObj = JSON.parse(cartItems);
      this.items.push(cartObj);
      this.items.push(item);
      let jsonStr = JSON.stringify(this.items);
      sessionStorage.setItem(this.cartName, jsonStr);
    } else {
      this.items.push(item);
      let jsonStr = JSON.stringify(this.items);
      sessionStorage.setItem(this.cartName, jsonStr);
    }
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
    if (sessionStorage.getItem(this.cartName).length > 2) {
      let cartItems = sessionStorage.getItem(this.cartName);
      let cartObj = JSON.parse(cartItems);
      this.items = cartObj;

      let preTotal = 0;
      if (this.items.length > 0) {
        for (let i = 0, _len = this.items.length; i < _len; i++) {
          preTotal += this.items[i].price * this.items[i].qty;
        }
        this.subtotal = preTotal;
        this.IVA = preTotal * 0.21;
        this.total = preTotal + preTotal * 0.21;
      }
    } else {
        this.subtotal = 0;
        this.IVA = 0;
        this.total = 0;
    }
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

  let unicos = [...new Set(data.map((item) => item.category))];

  unicos.forEach((element, index) => {
    let div = document.createElement("div");
    div.setAttribute("class", "box");

    div.innerHTML = `
            <img src="image/cat-${index + 1}.png" alt="">
            <h3>${element}</h3>
    `;
    document.getElementById("categories").appendChild(div);
  });

  // Funcion agregar al carrito onLoad
  $("#product-list div div.content a").on("click", function () {
    let clicked = $(this).closest(".box");
    let id = parseInt(clicked.attr("id"));
    let selected = (({ id, name, qty = 1, price }) => ({
      id,
      name,
      qty,
      price,
    }))(data.filter((element) => element.id == id)[0]);
    carrito.addToCart(selected);
  });
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

//Envio de Form
$("#send-form").click((e) => {
  e.preventDefault();

  const postURL = "https://jsonplaceholder.typicode.com/posts";
  let salida = [];
  let formulario = document.querySelectorAll("#contact-form .data");

  formulario.forEach((element) => {
    let actual = { [element.name]: element.value };
    salida.push(actual);
  });

  $.post(postURL, salida, (res, estado) => {
    if (estado === "success") {
      console.log(salida);
      console.log(res);
      $("#contact-form").append(`<p id="form-success">Formulario Enviado!</p>`);
    }
  });
});

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

// Enviar pedido Whatsapp
document.querySelector('#place-order').onmouseover = () => {
    let message = "Hola! Te paso mi pedido: ";
    orderObj = JSON.parse(sessionStorage.getItem(carrito.cartName))
    orderObj.forEach((element) => {
        message += ("Producto: " + element.name + " Cantidad: x10 " + "Precio: " + element.price + ". ")
    })
    let wappLink = `https://api.whatsapp.com/send?phone=1122334455&text=${message}`
    document.querySelector('#place-order').setAttribute('href', wappLink)
}

// Funcion llenar carrito
function cartLoad() {
  if (sessionStorage.getItem(carrito.cartName).length > 0) {
    let cartItems = sessionStorage.getItem(carrito.cartName);
    let cartObj = JSON.parse(cartItems);

    cartObj.forEach((element) => {
      let div = document.createElement("div");
      div.setAttribute("class", "box");

      div.innerHTML = `
        <i class="fas fa-times"></i>
        <img src="image/menu-4.png" alt="">
        <div class="content">
        <h3>${element.name}</h3>
        <span> Cantidad : x10</span>
        <br>
        <span> Precio : </span>
        <span class="price"> $${element.price} </span>
        </div>
        `;
      document
        .querySelector(".products-container .box-container")
        .appendChild(div);
    });
  }
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
            <img src="image/food-${element.image}.png" alt="">
        </div>
        <div class="content">
            <h3>${element.name}</h3>
            <div class="stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
                <span> (x10) </span>
            </div>
            <div class="price">$${element.price}</div>
            <a class="btn">agregar</a>
        </div>
    `;
    document.getElementById("product-list").appendChild(div);
  });
}
