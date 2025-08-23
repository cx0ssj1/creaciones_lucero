document.addEventListener('DOMContentLoaded', function () {
    // --- CONFIGURACIÓN --- //
    const API_URL = 'https://crealuapi-production.up.railway.app'; // tu API
    const numeroWhatsapp = '56988581495';

    // --- ELEMENTOS DEL DOM --- //
    const productosContainer = document.getElementById('productos-container');
    const filterButtonsContainer = document.querySelector('.filter-buttons');
    const navbar = document.getElementById('mainNavbar'); // <nav id="mainNavbar">

    // --- FUNCIÓN PRINCIPAL --- //
    async function cargarDatos() {
        productosContainer.innerHTML = '<div class="loading"></div>'; // animación de carga

        try {
            // Pedimos productos y categorías al mismo tiempo
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

            // Relacionamos productos con nombres de categoría
            const mapaCategorias = new Map(categorias.map(cat => [cat._id, cat.nombre]));
            const productosCompletos = productos.map(producto => ({
                ...producto,
                categoria: mapaCategorias.get(producto.categoriaId?.$oid) || 'Sin Categoría',
                imagen: producto.imagenUrl || `https://placehold.co/400x400/F7C8D6/4A4A4A?text=${encodeURIComponent(producto.nombre)}`
            }));

            // Generamos filtros y render inicial
            generarBotonesFiltro(categorias, productosCompletos);
            renderizarProductos('Todos', productosCompletos);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            productosContainer.innerHTML = `<p class="text-center col-12">
                Error al cargar los productos. Revisa que la API esté funcionando.
            </p>`;
        }
    }

    // --- BOTONES DE FILTRO --- //
    function generarBotonesFiltro(categorias, productos) {
        let botonesHTML = '<button class="btn active" data-filter="Todos">Todos</button>';
        categorias.forEach(cat => {
            botonesHTML += `<button class="btn" data-filter="${cat.nombre}">${cat.nombre}</button>`;
        });
        filterButtonsContainer.innerHTML = botonesHTML;

        // Eventos click
        document.querySelectorAll('.filter-buttons .btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelector('.filter-buttons .btn.active').classList.remove('active');
                button.classList.add('active');
                const filtro = button.getAttribute('data-filter');
                renderizarProductos(filtro, productos);
            });
        });
    }

    // --- RENDER PRODUCTOS --- //
    // En tu archivo 'script.js'

    // --- RENDER PRODUCTOS --- //
    function renderizarProductos(filtro = 'Todos', productos = []) {
        // 1. Filtra los productos
        const productosFiltrados = productos.filter(p => filtro === 'Todos' || p.categoria === filtro);

        // 2. Si no hay productos, muestra un mensaje
        if (productosFiltrados.length === 0) {
            productosContainer.innerHTML = '<p class="text-center col-12">No hay productos en esta categoría.</p>';
            return;
        }

        // 3. Usa .map() y .join() para generar todo el HTML
        const productosHTML = productosFiltrados.map(producto => {
            // Prepara los datos del producto
            const mensaje = encodeURIComponent(`¡Hola! Estoy interesado/a en el producto: ${producto.nombre}`);
            const whatsappLink = `https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${mensaje}`;
            const imageUrl = producto.imagen || `https://placehold.co/400x400/F7C8D6/4A4A4A?text=${encodeURIComponent(producto.nombre)}`;

            // Escapa las comillas para evitar errores en el onclick
            const nombreLimpio = producto.nombre.replace(/'/g, "\\'").replace(/"/g, '\\"');
            const descripcionLimpia = producto.descripcion.replace(/'/g, "\\'").replace(/"/g, '\\"');

            // Retorna la tarjeta de producto como una cadena de texto
            return `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="product-card card-enter">
                        <div class="product-image">
                            <img src="${imageUrl}" alt="${producto.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/400x400/ccc/fff?text=Imagen+no+disponible';">
                        </div>
                        <div class="card-body">
                            <span class="category-badge">${producto.categoria}</span>
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text">${producto.descripcion}</p>
                            <p class="product-price"><strong>$${producto.precio?.toLocaleString() || '0'}</strong></p>
                            <a href="${whatsappLink}" class="btn btn-whatsapp" target="_blank">
                                <i class="fab fa-whatsapp"></i> Comprar por WhatsApp
                            </a>
                        </div>
                    </div>
                </div>`;
        }).join(''); // Une todas las tarjetas en una sola cadena

        // 4. Inserta el HTML en el contenedor
        productosContainer.innerHTML = productosHTML;
    }

    // --- EFECTOS VISUALES --- //
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

    // --- INICIO --- //
    cargarDatos();
});