/**
 * APLICACIÓN PRINCIPAL
 * Punto de entrada que inicializa todo el sistema
 */

const App = (() => {
  'use strict';

  const DEBUG = false; // Cambiar a true para logs detallados

  /**
   * Inicializa la aplicación
   */
  async function inicializar() {
    // Force redeploy to clear cache
    console.log('Inicializando Griego Bíblico...');

    try {
      // 1. Inicializar progreso (localStorage)
      Progreso.inicializar();
      console.log('✓ Progreso inicializado');

      // 2. Registrar rutas
      registrarRutas();
      console.log('✓ Rutas registradas');

      // 3. Inicializar router
      Router.iniciar();
      console.log('✓ Router iniciado');

      // 4. Inicializar navegación
      Navegacion.inicializar();
      console.log('✓ Navegación inicializada');

      // 5. Procesar ruta inicial
      procesarRutaInicial();
      console.log('✓ Aplicación lista');

      // Escuchar cambios de estado
      setupEventListeners();

    } catch (error) {
      console.error('Error al inicializar aplicación:', error);
      mostrarErrorFatal(error);
    }
  }

  /**
   * Registra todas las rutas de la aplicación
   */
  function registrarRutas() {
    // Página de inicio / dashboard
    Router.registrar('/', (parametros) => {
      Estado.despachar('CAMBIAR_VISTA', { vista: 'inicio' });
      VistaInicio.renderizar();
    });

    // Página de un nivel
    Router.registrar('/nivel/:id', (parametros) => {
      Estado.despachar('CAMBIAR_VISTA', { vista: 'nivel' });
      Estado.despachar('ESTABLECER_NIVEL', { nivelId: parametros.id });
      VistaNivel.renderizar(parametros);
    });

    // Página de una lección
    Router.registrar('/leccion/:id', (parametros) => {
      Estado.despachar('CAMBIAR_VISTA', { vista: 'leccion' });
      Estado.despachar('ESTABLECER_LECCION', { leccionId: parametros.id });
      VistaLeccion.renderizar(parametros);
    });

    // Página de vocabulario (futuro)
    Router.registrar('/vocabulario', (parametros) => {
      Estado.despachar('CAMBIAR_VISTA', { vista: 'vocabulario' });
      mostrarEnConstruccion('Vocabulario');
    });

    // Página de mi progreso (futuro)
    Router.registrar('/mi-progreso', (parametros) => {
      Estado.despachar('CAMBIAR_VISTA', { vista: 'progreso' });
      mostrarEnConstruccion('Mi Progreso');
    });

    // Página de textos (futuro)
    Router.registrar('/textos/:id', (parametros) => {
      Estado.despachar('CAMBIAR_VISTA', { vista: 'textos' });
      mostrarEnConstruccion('Análisis de Textos');
    });
  }

  /**
   * Procesa la ruta inicial (qué mostrar al cargar)
   */
  function procesarRutaInicial() {
    const hash = window.location.hash;

    if (!hash || hash === '#' || hash === '#/') {
      // No hay hash o es la raíz, ir a inicio
      Router.navegar('#/');
    } else {
      // Hay una ruta específica, dejar que Router la procese
      window.dispatchEvent(new Event('hashchange'));
    }
  }

  /**
   * Configura event listeners globales
   */
  function setupEventListeners() {
    // Actualizar racha cuando cambia la actividad
    Eventos.escuchar('ejercicio:completado', () => {
      Navegacion.actualizarProgreso();
    });

    Eventos.escuchar('leccion:guardada', () => {
      Navegacion.actualizarProgreso();
    });

    // Manejo de errores global
    window.addEventListener('error', (evento) => {
      console.error('Error global:', evento.error);
      Estado.despachar('AGREGAR_ERROR', {
        mensaje: evento.error?.message || 'Error desconocido',
        codigo: 'error-global'
      });
    });

    // Prevenir cierre accidental
    window.addEventListener('beforeunload', (evento) => {
      // Solo advertir si hay lección en progreso
      if (Estado.obtener('vistaActual') === 'leccion') {
        evento.preventDefault();
        evento.returnValue = '';
      }
    });
  }

  /**
   * Muestra una página en construcción (para futuras características)
   */
  function mostrarEnConstruccion(nombre) {
    const contenedor = document.getElementById('vista-contenedor');
    contenedor.innerHTML = `
      <div style="text-align: center; padding: 3rem; max-width: 600px; margin: 0 auto;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🚧</div>
        <h1 style="color: var(--color-primario); margin-bottom: 1rem;">${nombre}</h1>
        <p style="color: var(--color-texto-suave); margin-bottom: 2rem;">
          Esta sección está en construcción. Volverá pronto con nuevas funcionalidades.
        </p>
        <button class="boton primario" onclick="Router.navegar('#/')">
          Volver a Inicio
        </button>
      </div>
    `;
  }

  /**
   * Muestra un error fatal que impide que la app funcione
   */
  function mostrarErrorFatal(error) {
    document.getElementById('app').innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: var(--color-fondo);
        padding: 2rem;
      ">
        <div style="
          max-width: 600px;
          background-color: white;
          padding: 3rem;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          text-align: center;
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">💥</div>
          <h1 style="color: var(--color-error); margin-bottom: 1rem;">Error al Inicializar</h1>
          <p style="color: var(--color-texto-suave); margin-bottom: 1rem;">
            La aplicación no se pudo inicializar correctamente.
          </p>
          <code style="
            background-color: var(--color-borde-suave);
            padding: 1rem;
            border-radius: 4px;
            display: block;
            margin-bottom: 2rem;
            text-align: left;
            overflow-x: auto;
            font-size: 0.9rem;
          ">${error.message || 'Error desconocido'}</code>
          <button
            class="boton primario"
            onclick="location.reload()"
            style="width: 100%;"
          >
            Recargar Página
          </button>
        </div>
      </div>
    `;
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }

  // API pública (para debugging)
  return {
    obtenerEstado: () => Estado.obtenerEstado(),
    obtenerProgreso: () => Progreso.obtenerProgreso(),
    obtenerRutas: () => Router.obtenerRutas()
  };
})();
