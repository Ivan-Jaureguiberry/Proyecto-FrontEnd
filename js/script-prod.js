const hamburguesa = document.getElementById("hamburguesa");
const menu = document.querySelector(".menu")

hamburguesa.addEventListener("click", ()=>{
    menu.classList.toggle("activo");
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const carritoIcono = document.getElementById("carritoIcono");
const carritoMenu = document.getElementById("carritoMenu");

carritoIcono.addEventListener("click", () => {
    carritoMenu.classList.toggle("activo");
    menu.classList.remove("activo");
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const botones = document.querySelectorAll(".boton-dos");

const versionStock = "v2";

if (localStorage.getItem("versionStock") !== versionStock) {
    localStorage.removeItem("stockProductos");
    localStorage.setItem("versionStock", versionStock);
}

let stockProductos = JSON.parse(localStorage.getItem("stockProductos")) || {};
const productos = document.querySelectorAll(".publicacion");

productos.forEach(productoDiv => {
    const nombre = productoDiv.querySelector("h3").textContent;
    const h4 = productoDiv.querySelector("h4");
    const stockTexto = productoDiv.querySelector(".stock");

    console.log("PRODUCTO:", nombre);
    console.log("H4:", h4);
    console.log("DATA STOCK:", h4?.dataset.stock);
    console.log("STOCK GUARDADO:", stockProductos[nombre]);

    if (stockProductos[nombre] === undefined || stockProductos[nombre] === null) {
        stockProductos[nombre] = parseInt(h4.dataset.stock);
    }

    h4.dataset.stock = stockProductos[nombre];

    if (stockTexto) {
        stockTexto.textContent = "Stock disponible: " + stockProductos[nombre];
    }
});

guardarStock();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const tbody = document.querySelector("#tablaCarrito tbody");
const totalTexto = document.getElementById("total");
const contadorCarrito = document.getElementById("contadorCarrito");
const btnVaciar = document.getElementById("vaciarCarrito");
const btnPagar = document.getElementById("pagarCarrito");

let carrito = [];

const carritoGuardado = localStorage.getItem("carrito");

if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    actualizarTabla();
}

btnVaciar.addEventListener("click", () => {
    carrito.forEach(producto => {
        stockProductos[producto.nombre] += producto.cantidad;
    });

    guardarStock();

    carrito = [];
    guardarCarrito();
    actualizarTabla();

    productos.forEach(prod => {
        const nombre = prod.querySelector("h3").textContent;
        actualizarStockVisual(nombre);
    });

    mostrarConfirmacion ("Carrito vaciado con éxito 🎉");
});

btnPagar.addEventListener("click", () => {
    guardarStock();
    
    carrito = [];
    guardarCarrito();
    actualizarTabla();

    productos.forEach(prod => {
        const nombre = prod.querySelector("h3").textContent;
        actualizarStockVisual(nombre);
    });

    mostrarConfirmacion ("Compra realizada con éxito 🎉");
});

botones.forEach((boton) => {
    boton.addEventListener("click", () => {
        const productoDiv = boton.parentElement.parentElement;
        const nombre = productoDiv.querySelector("h3").textContent;    
        const h4 = productoDiv.querySelector("h4");
        const stockTexto = productoDiv.querySelector(".stock");
        
        let stock = parseInt(h4.dataset.stock);

        if (stock <= 0) {
            mostrarConfirmacion("Sin stock ❌");
            return;
        }
        
        const precioTexto = h4.textContent;
        const precio = parseFloat(precioTexto.replace("Precio: $", "").replace(".", "").replace(",", "."));
        
        const existente = carrito.find(p => p.nombre === nombre);

        if (existente) {
            existente.cantidad++;
        }
        else {
            carrito.push({
                nombre: nombre,
                precio: precio,
                cantidad: 1
            });
        }

        stockProductos[nombre]--;
        guardarStock();

        h4.dataset.stock = stockProductos[nombre];
        stockTexto.textContent = "Stock disponible: " + stockProductos[nombre];

        boton.classList.add("animar");
        setTimeout(() => boton.classList.remove("animar"), 200);

        guardarCarrito();
        actualizarTabla();
    });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener("click", (e) => {
    const clickDentroMenu = carritoMenu.contains(e.target);
    const clickEnIcono = carritoIcono.contains(e.target);
    const clickEnEliminar = e.target.classList.contains("eliminar");
    const clickEnAgregar = e.target.classList.contains("boton-dos");
    const clickEnMenos = e.target.classList.contains("menos");
    const clickEnMas = e.target.classList.contains("mas");

    if (!clickDentroMenu && !clickEnIcono && !clickEnAgregar && !clickEnEliminar && !clickEnMenos && !clickEnMas) {
        carritoMenu.classList.remove("activo");
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function formatearPrecio(numero) {
    let numStr = numero.toFixed(2);

    let partes = numStr.split(".");

    let entero = partes[0];
    let decimales = partes[1];

    let resultado = "";
    let contador = 0;

    for (let i = entero.length - 1; i >= 0; i--) {
        resultado = entero[i] + resultado;
        contador++;

        if (contador === 3 && i !== 0) {
            resultado = "." + resultado;
            contador = 0;
        }
    }

    return resultado + "," + decimales;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function actualizarTabla() {
    const btnPagar = document.getElementById("pagarCarrito");
    const btnVaciar = document.getElementById("vaciarCarrito");

    tbody.innerHTML = "";

    let total = 0;

    carrito.forEach((producto, index) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>
                <div class="contenedor-cantidad">
                    <button class="menos">-</button>
                    x${producto.cantidad}
                    <button class="mas">+</button>
                </div>
            </td>
            <td>$${formatearPrecio(producto.precio * producto.cantidad)}</td>
            <td><button class = "eliminar">X</button></td>
        `;

        const btnMas = fila.querySelector(".mas");
        const btnMenos = fila.querySelector(".menos");

        btnMas.addEventListener("click", () => {
            if (stockProductos[producto.nombre] > 0) {
                producto.cantidad++;
                
                stockProductos[producto.nombre]--;
                guardarStock();

                actualizarStockVisual(producto.nombre);
            }
            else {
                mostrarConfirmacion("No hay más stock");
            }

            guardarCarrito();
            actualizarTabla();
        });

        btnMenos.addEventListener("click", () => {
            if (producto.cantidad > 1) {
                producto.cantidad--;

                stockProductos[producto.nombre]++;
            }
            else {
                stockProductos[producto.nombre]++;
                carrito = carrito.filter(p => p.nombre !== producto.nombre);
            }
            guardarStock();
            guardarCarrito();

            actualizarStockVisual(producto.nombre);
            actualizarTabla();
        });

        const btnEliminar = fila.querySelector(".eliminar");

        btnEliminar.addEventListener("click", () => {
            stockProductos[producto.nombre] += producto.cantidad;
            guardarStock();

            carrito.splice(index, 1);

            actualizarStockVisual(producto.nombre);

            guardarCarrito();
            actualizarTabla();

            mostrarConfirmacion("Producto eliminado con éxito 🎉");
        });

        tbody.appendChild(fila);

        total += producto.precio * producto.cantidad;
    });

    totalTexto.textContent = "Total: $" + formatearPrecio(total);
    const cantidadTotal = carrito.reduce((total, producto) => {
        return total + producto.cantidad;
    }, 0);

    contadorCarrito.textContent = cantidadTotal;

    btnPagar.disabled = cantidadTotal === 0;
    btnVaciar.disabled = cantidadTotal === 0;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function mostrarConfirmacion (mensaje) {
    document.querySelectorAll(".confirmacion").forEach(n => n.remove());

    const notificacion = document.createElement("div");
    notificacion.classList.add("confirmacion");
    notificacion.textContent = mensaje;

    document.body.appendChild(notificacion);

    setTimeout (() => {
        notificacion.classList.add("mostrar");
    }, 10);

    setTimeout(() => {
        notificacion.classList.remove("mostrar");

        setTimeout(() => {
            notificacion.remove();
        }, 400);
    }, 2500);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function actualizarStockVisual(nombreProducto) {
    const productos = document.querySelectorAll(".publicacion");

    productos.forEach(prod => {
        const nombre = prod.querySelector("h3").textContent;

        if (nombre === nombreProducto) {
            const h4 = prod.querySelector("h4");
            const stockTexto = prod.querySelector(".stock");

            h4.dataset.stock = stockProductos[nombreProducto];
            stockTexto.textContent = "Stock disponible: " + stockProductos[nombreProducto];
        }
    });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function guardarStock() {
    localStorage.setItem("stockProductos", JSON.stringify(stockProductos));
}