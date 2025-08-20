document.addEventListener('DOMContentLoaded', function () {
    // --- CONFIGURACIÓN ---
    // ¡CORREGIDO! Esta es la URL pública de tu API desplegada en Railway.
    const API_URL = 'https://crealuapi-production.up.railway.app'; 
    const numeroWhatsapp = '56988581495'; 

    // --- ELEMENTOS DEL DOM ---
    const productosContainer = document.getElementById('productos-container');
    const filterButtonsContainer = document.querySelector('.filter-buttons');
    const navbar = document.getElementById('mainNavbar'); // Asegúrate de que tu <nav> tenga id="mainNavbar"

    // --- FUNCIÓN PRINCIPAL PARA CARGAR DATOS ---
// En tu script.js
    async function cargarDatos() {
        // Muestra un indicador de carga mientras se obtienen los datos
        productosContainer.innerHTML = '<div class="loading"></div>'; 

        try {
             // 1. Hacemos las dos peticiones a la API al mismo tiempo para más eficiencia
            const [responseProductos, responseCategorias] = await Promise.all([
                fetch(`${API_URL}/productos`),
                fetch(`${API_URL}/categorias`)
            ]);

             // Verificamos si las respuestas de la API son correctas
            if (!responseProductos.ok || !responseCategorias.ok) {
                throw new Error('Error al comunicar con la API.');
            }

            const productos = await responseProductos.json();
            const categorias = await responseCategorias.json();

            console.log("Datos recibidos de /productos:", productos);

             // Si no hay productos, mostramos un mensaje y detenemos la ejecución.
            if (productos.length === 0) {
                productosContainer.innerHTML = `<p class="text-center col-12">¡Pronto tendremos nuevos productos! Vuelve a visitarnos.</p>`;
                generarBotonesFiltro([]);
                return;
            }

             // 2. Creamos un mapa para buscar nombres de categoría por su ID fácilmente
            const mapaCategorias = new Map(categorias.map(cat => [cat._id, cat.nombre]));

            // 3. Unimos los productos con los nombres de sus categorías
            const productosCompletos = productos.map(producto => ({
                ...producto,
                categoria: mapaCategorias.get(producto.categoriaId?.$oid || producto.categoriaId) || 'Sin Categoría',
                imagen: producto.imagen || `https://placehold.co/400x400/F7C8D6/4A4A4A?text=${encodeURIComponent(producto.nombre)}`
            }));

            console.log("Productos con nombres de categoría (listos para mostrar):", productosCompletos);

            // 4. Generamos los botones de filtro y renderizamos los productos iniciales
            generarBotonesFiltro(categorias, productosCompletos);
            renderizarProductos('Todos', productosCompletos);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            productosContainer.innerHTML = `<p class="text-center col-12">Error al cargar los productos. Revisa que la API esté funcionando.</p>`;
        }
    }

    // --- FUNCIONES PARA RENDERIZAR EL CONTENIDO ---

    // Genera los botones de filtro a partir de las categorías de la API
    function generarBotonesFiltro(categorias, productos) {
        let botonesHTML = '<button class="btn active" data-filter="Todos">Todos</button>';
        categorias.forEach(cat => {
            botonesHTML += `<button class="btn" data-filter="${cat.nombre}">${cat.nombre}</button>`;
        });
        filterButtonsContainer.innerHTML = botonesHTML;

        // Volvemos a asignar los eventos a los nuevos botones
        document.querySelectorAll('.filter-buttons .btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.filter-buttons .btn.active').classList.remove('active');
                button.classList.add('active');
                const filtro = button.getAttribute('data-filter');
                renderizarProductos(filtro, productos);
            });
        });
    }

    // Muestra los productos en la página con una animación
    // --- FUNCIONES PARA RENDERIZAR EL CONTENIDO ---
    // En tu archivo 'script.js'
    function renderizarProductos(filtro = 'Todos', productos = []) {
        productosContainer.innerHTML = '';
        const productosFiltrados = productos.filter(p => filtro === 'Todos' || p.categoria === filtro);

        if (productosFiltrados.length === 0) {
            productosContainer.innerHTML = '<p class="text-center col-12">No hay productos en esta categoría.</p>';
            return;
        }

        productosFiltrados.forEach(producto => {
            const cardElement = document.createElement('div');
            cardElement.className = 'col-lg-4 col-md-6 mb-4'; // Añade 'mb-4' para el espaciado entre filas
            cardElement.innerHTML = crearProductCard(producto);
            productosContainer.appendChild(cardElement);
        });
    }

    // Crea el HTML de una tarjeta de producto
    function crearProductCard(producto) {
        const mensaje = encodeURIComponent(`¡Hola! Estoy interesado/a en el producto: ${producto.nombre}`);
        const whatsappLink = `https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${mensaje}`;
        const imageUrl = producto.imagen || `https://placehold.co/400x400/F7C8D6/4A4A4A?text=${encodeURIComponent(producto.nombre)}`;

        // Maneja las comillas simples y dobles en el nombre y la descripción para evitar errores de sintaxis
        const nombreLimpio = producto.nombre.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const descripcionLimpia = producto.descripcion.replace(/'/g, "\\'").replace(/"/g, '\\"');

        return `
            <div class="product-card card-enter">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${producto.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/400x400/ccc/fff?text=Imagen+no+disponible';">
                    <div class="product-overlay">
                        <button class="preview-btn" onclick="mostrarModal('${nombreLimpio}', '${descripcionLimpia}', '${imageUrl}')">
                            <i class="fas fa-eye me-2"></i>Vista previa
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <span class="category-badge">${producto.categoria}</span>
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <a href="${whatsappLink}" class="btn btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i> Comprar por WhatsApp
                    </a>
                </div>
            </div>
        `;
    }

    // --- EFECTOS VISUALES Y OTROS (Tu código original) ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50 && navbar) {
            navbar.classList.add('scrolled');
        } else if (navbar) {
            navbar.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- INICIALIZACIÓN ---
    cargarDatos();
});

// Función global para el modal (debe estar fuera del DOMContentLoaded)
function mostrarModal(nombre, descripcion, imagen) {
    // Aquí puedes implementar una librería de modales como SweetAlert2 o un modal de Bootstrap
    alert(`Vista Previa:\n\nProducto: ${nombre}\nDescripción: ${descripcion}`);
}
