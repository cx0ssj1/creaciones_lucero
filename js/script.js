// 🔗 Cambia esto por la URL de tu API en Railway/Render
const API_BASE = "https://crealuapi-production.up.railway.app";

// =============== CATEGORÍAS ==================
async function getCategorias() {
    const res = await fetch(`${API_BASE}/categorias`);
    const data = await res.json();
    console.log("📂 Categorías:", data);
    return data;
}

async function createCategoria(nombre, descripcion = "") {
    const res = await fetch(`${API_BASE}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion })
    });
    const data = await res.json();
    console.log("✅ Categoría creada:", data);
    return data;
}

async function updateCategoria(id, nombre, descripcion = "") {
    const res = await fetch(`${API_BASE}/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion })
    });
    const data = await res.json();
    console.log("✏️ Categoría actualizada:", data);
    return data;
}

async function deleteCategoria(id) {
    const res = await fetch(`${API_BASE}/categorias/${id}`, {
        method: "DELETE"
    });
    const data = await res.json();
    console.log("🗑️ Categoría eliminada:", data);
    return data;
}

// =============== PRODUCTOS ==================
async function getProductos() {
    const res = await fetch(`${API_BASE}/productos`);
    const data = await res.json();
    console.log("📦 Productos:", data);
    return data;
}

async function createProducto(nombre, descripcion, cantidad, categoriaId) {
    const res = await fetch(`${API_BASE}/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, cantidad, categoriaId })
    });
    const data = await res.json();
    console.log("✅ Producto creado:", data);
    return data;
}

async function updateProducto(id, nombre, descripcion, cantidad, categoriaId) {
    const res = await fetch(`${API_BASE}/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, cantidad, categoriaId })
    });
    const data = await res.json();
    console.log("✏️ Producto actualizado:", data);
    return data;
}

async function deleteProducto(id) {
    const res = await fetch(`${API_BASE}/productos/${id}`, {
        method: "DELETE"
    });
    const data = await res.json();
    console.log("🗑️ Producto eliminado:", data);
    return data;
}

// =============== VENTAS ==================
async function getVentas() {
    const res = await fetch(`${API_BASE}/ventas`);
    const data = await res.json();
    console.log("💰 Ventas:", data);
    return data;
}

async function createVenta(productos, total, cliente = null) {
    const res = await fetch(`${API_BASE}/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productos, total, cliente })
    });
    const data = await res.json();
    console.log("✅ Venta creada:", data);
    return data;
}

async function deleteVenta(id) {
    const res = await fetch(`${API_BASE}/ventas/${id}`, {
        method: "DELETE"
    });
    const data = await res.json();
    console.log("🗑️ Venta eliminada:", data);
    return data;
}

// =============== EJEMPLO DE USO ==================
// Se ejecuta cuando la página carga
document.addEventListener("DOMContentLoaded", async () => {
    const categorias = await getCategorias();
    const productos = await getProductos();
    const ventas = await getVentas();

    // Ejemplo: mostrar productos en un div con id "productos"
    const productosDiv = document.getElementById("productos");
    if (productosDiv) {
        productosDiv.innerHTML = productos.map(p => `
            <div class="producto">
                <h3>${p.nombre}</h3>
                <p>${p.descripcion}</p>
                <span>Cantidad: ${p.cantidad}</span>
            </div>
        `).join("");
    }
});
