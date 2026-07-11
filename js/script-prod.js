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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const botones = document.querySelectorAll(".boton-dos");
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
    carrito = [];
    guardarCarrito();
    actualizarTabla();
    mostrarConfirmacion ("Carrito vaciado con éxito 🎉");
});

btnPagar.addEventListener("click", () => {
    mostrarConfirmacion ("Compra realizada con éxito 🎉");

    carrito = [];
    guardarCarrito();
    actualizarTabla();
});

botones.forEach((boton) => {
    boton.addEventListener("click", () => {
        const productoDiv = boton.parentElement.parentElement;

        const nombre = productoDiv.querySelector("h3").textContent;
        const precioTexto = productoDiv.querySelector("h4").textContent;

        const precio = parseFloat(precioTexto.replace("Precio: $", "").replace(".", "").replace(",", "."));

        const producto = {
            nombre: nombre,
            precio: precio
        };

        carrito.push(producto);

        boton.classList.add("animar");

        setTimeout(() => {
            boton.classList.remove("animar");
        }, 200);

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

    if (!clickDentroMenu && !clickEnIcono && !clickEnAgregar && !clickEnEliminar) {
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
            <td>$${formatearPrecio(producto.precio)}</td>
            <td><button class = "eliminar">X</button></td>
        `;

        const btnEliminar = fila.querySelector(".eliminar");

        btnEliminar.addEventListener("click", () => {
            carrito.splice(index, 1);
            guardarCarrito();
            actualizarTabla();
            mostrarConfirmacion("Producto eliminado con éxito 🎉");
        });

        tbody.appendChild(fila);

        total += producto.precio;
    });

    totalTexto.textContent = "Total: $" + formatearPrecio(total);
    contadorCarrito.textContent = carrito.length;

    btnPagar.disabled = carrito.length === 0;
    btnVaciar.disabled = carrito.length === 0;
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