document.addEventListener('DOMContentLoaded', function () {

    const API_URL = 'https://crealuapi-production.up.railway.app';
    const numeroWhatsapp = '56988581495';
    const productosContainer = document.getElementById('productos-container');
    const filterButtonsContainer = document.querySelector('.filter-buttons');
    const navbar = document.getElementById('mainNavbar');
    const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));

    async function cargarDatos() {
        productosContainer.innerHTML = '<div class="loading"></div>';

        try {
            const [responseProductos, responseCategorias] = await Promise.all([
                fetch(`${API_URL}/productos`),
                fetch(`${API_URL}/categorias`)
            ]);

            if (!responseProductos.ok || !responseCategorias.ok) {
                throw new Error('Error al comunicar con la API.');
            }

            const productos = await responseProductos.json();
            const categorias = await responseCategorias.json();

            if (productos.length === 0) {
                productosContainer.innerHTML = `<p class="text-center col-12">
                    ¡Pronto tendremos nuevos productos! Vuelve a visitarnos.
                </p>`;
                generarBotonesFiltro([]);
                return;
            }

            const mapaCategorias = new Map(categorias.map(cat => [cat._id.$oid || cat._id, cat.nombre]));
            const productosCompletos = productos.map(producto => ({
                ...producto,
                id: producto._id.$oid || producto._id,
                categoria: mapaCategorias.get(producto.categoriaId?.$oid) || 'Sin Categoría',
                imagen: producto.imagenUrl || `https://placehold.co/400x400/F7C8D6/4A4A4A?text=${encodeURIComponent(producto.nombre)}`
            }));

            generarBotonesFiltro(categorias, productosCompletos);
            renderizarProductos('Todos', productosCompletos);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            productosContainer.innerHTML = `<p class="text-center col-12">
                Error al cargar los productos. Revisa que la API esté funcionando.
            </p>`;
        }
    }

    function generarBotonesFiltro(categorias, productos) {
        let botonesHTML = '<button class="btn active" data-filter="Todos">Todos</button>';
        categorias.forEach(cat => {
            botonesHTML += `<button class="btn" data-filter="${cat.nombre}">${cat.nombre}</button>`;
        });
        filterButtonsContainer.innerHTML = botonesHTML;

        document.querySelectorAll('.filter-buttons .btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.filter-buttons .btn.active').classList.remove('active');
                button.classList.add('active');
                const filtro = button.getAttribute('data-filter');
                renderizarProductos(filtro, productos);
            });
        });
    }

    function renderizarProductos(filtro = 'Todos', productos = []) {
        const productosFiltrados = productos.filter(p => filtro === 'Todos' || p.categoria === filtro);
        productosContainer.innerHTML = ''; // Limpia el contenedor antes de añadir nuevos productos

        if (productosFiltrados.length === 0) {
            productosContainer.innerHTML = '<p class="text-center col-12">No hay productos en esta categoría.</p>';
            return;
        }

        productosFiltrados.forEach(producto => {
            const cardHTML = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="product-card card-enter">
                        <div class="product-image">
                            <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/400x400/ccc/fff?text=Imagen+no+disponible';">
                        </div>
                        <div class="card-body">
                            <span class="category-badge">${producto.categoria}</span>
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text">${producto.descripcion}</p>
                            <p class="product-price"><strong>$${producto.precio.toLocaleString()}</strong></p>
                            <a href="https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${encodeURIComponent(`¡Hola! Estoy interesado/a en el producto: ${producto.nombre}`)}" class="btn btn-whatsapp" target="_blank">
                                <i class="fab fa-whatsapp"></i> Comprar por WhatsApp
                            </a>
                            <button class="btn btn-add-cart mt-2" data-product-id="${producto.id}" data-product-name="${producto.nombre}" data-product-price="${producto.precio}" data-product-image="${producto.imagen}">
                                <i class="fas fa-shopping-cart"></i> Añadir al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productosContainer.innerHTML += cardHTML;
        });

        document.querySelectorAll('.btn-add-cart').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-product-id');
                const nombre = button.getAttribute('data-product-name');
                const precio = parseFloat(button.getAttribute('data-product-price'));
                const imagen = button.getAttribute('data-product-image');
                agregarAlCarrito(id, imagen, nombre, precio);
            });
        });
    }


    function guardarCarrito(carrito) {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        renderizarCarrito();
    }

    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    }

    function agregarAlCarrito(id, imagen, nombre, precio) {
        let carrito = obtenerCarrito();
        const productoExistente = carrito.find(item => item.id === id);

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({ id, imagen, nombre, precio, cantidad: 1 });
        }

        guardarCarrito(carrito);
        cartOffcanvas.show();
    }

    function eliminarDelCarrito(id) {
        let carrito = obtenerCarrito();
        carrito = carrito.filter(item => item.id !== id);
        guardarCarrito(carrito);
    }

    function finalizarCompra() {
        let carrito = obtenerCarrito();
        if (carrito.length === 0) {
            alert('Tu carrito está vacío. ¡Añade productos para comprar!');
            return;
        }
        const mensaje = carrito.map(item => `* ${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}`).join('\n');
        const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
        const mensajeFinal = encodeURIComponent(`¡Hola! Quisiera finalizar mi compra.\n\nDetalle del pedido:\n${mensaje}\n\nTotal: $${total.toLocaleString()}`);
        const whatsappLink = `https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${mensajeFinal}`;

        window.open(whatsappLink, '_blank');
        localStorage.removeItem('carrito');
        guardarCarrito([]);
    }

    function actualizarContadorCarrito() {
        const carrito = obtenerCarrito();
        const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const contadorBadge = document.getElementById('cart-badge');
        if (contadorBadge) {
            contadorBadge.textContent = totalProductos;
        }
    }

    function renderizarCarrito() {
        const carritoContainer = document.getElementById('cart-body');
        const carrito = obtenerCarrito();

        if (!carritoContainer) {
            console.error('No se encontró el contenedor del carrito con ID "cart-body".');
            return;
        }

        if (carrito.length === 0) {
            carritoContainer.innerHTML = '<p class="text-center mt-3">¡Tu carrito está vacío! 🛒</p>';
            return;
        }

        const carritoHTML = carrito.map(item => `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
                <div class="cart-item-details">
                    <h6>${item.nombre}</h6>
                    <p>Cantidad: ${item.cantidad}</p>
                    <p class="cart-item-price">$${(item.precio * item.cantidad).toLocaleString()}</p>
                </div>
                <button class="btn-remove" data-product-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

        carritoContainer.innerHTML = `
            <div class="cart-items-list">
                ${carritoHTML}
            </div>
            <div class="cart-summary">
                <hr>
                <h5>Total: $${total.toLocaleString()}</h5>
                <button class="btn-checkout" id="finalizarCompraBtn">
                    <i class="fab fa-whatsapp"></i> Finalizar Compra Por WhatsApp
                </button>
            </div>
        `;
        
        document.querySelectorAll('.btn-remove').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-product-id');
                eliminarDelCarrito(id);
            });
        });

        document.getElementById('finalizarCompraBtn').addEventListener('click', finalizarCompra);
    }

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

    const floatingCartBtn = document.getElementById('floatingCartBtn');
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', renderizarCarrito);
    }

    cargarDatos();
    actualizarContadorCarrito();
});