// console.log("🔍 Iniciando pruebas de carrito...");

// const carritoTest = new Cart("cartTest", 0, 0, 0);
// sessionStorage.clear(); // Limpiamos antes de probar

// // Test 1: Agrega producto
// const producto = { id: 101, name: "Gin Beefeater", price: 22000 };
// carritoTest.addToCart(producto);
// console.assert(carritoTest.items.length === 1, "❌ Test 1: No agregó producto");

// // Test 2: Agrega el mismo producto => aumenta cantidad
// carritoTest.addToCart(producto);
// console.assert(carritoTest.items[0].quantity === 2, "❌ Test 2: No incrementó cantidad");

// // Test 3: Calcular total
// carritoTest.calculateCart();
// console.assert(carritoTest.subtotal === 44000, "❌ Test 3: Subtotal incorrecto");
// console.assert(carritoTest.IVA === 9240, "❌ Test 3: IVA incorrecto");
// console.assert(carritoTest.total === 53240, "❌ Test 3: Total incorrecto");

// // Test 4: Disminuir cantidad
// carritoTest.items[0].quantity = 1;
// carritoTest.calculateCart();
// console.assert(carritoTest.total === 26620, "❌ Test 4: Total después de cambio incorrecto");

// // Test 5: Eliminar producto
// carritoTest.removeItem(101);
// console.assert(carritoTest.items.length === 0, "❌ Test 5: No eliminó producto");

// console.log("✅ Todas las pruebas pasaron correctamente");
