/**
 * ROUTER
 * Enrutador hash-based para navegación SPA
 */

const Router = (() => {
  'use strict';

  const rutas = new Map();
  let rutaActual = null;

  /**
   * Registra una ruta
   * @param {string} patron - Ej: '/', '/nivel/:id', '/leccion/:id'
   * @param {Function} handler - Función que maneja la ruta
   */
  function registrar(patron, handler) {
    rutas.set(patron, handler);
  }

  /**
   * Inicia el router y escucha cambios de hash
   */
  function iniciar() {
    // Manejar cambio de hash
    window.addEventListener('hashchange', procesarRuta);

    // Procesar ruta inicial
    procesarRuta();
  }

  /**
   * Procesa la ruta actual
   * @private
   */
  function procesarRuta() {
    const hash = window.location.hash.substring(1) || '/';
    const rutaYParametros = extraerParametros(hash);

    if (!rutaYParametros) {
      navegar('/');
      return;
    }

    const { patron, parametros } = rutaYParametros;

    // Buscar handler para esta ruta
    const handler = rutas.get(patron);

    if (!handler) {
      Utils.error(`Ruta no encontrada: ${patron}`);
      navegar('/');
      return;
    }

    // Actualizar estado
    Estado.despachar('CAMBIAR_VISTA', {
      vista: patron,
      parametros
    });

    // Ejecutar handler
    try {
      handler(parametros);
      rutaActual = patron;
      Eventos.emitir('ruta:cambiada', { patron, parametros });
    } catch (error) {
      Utils.error(`Error al ejecutar handler de ruta '${patron}':`, error);
      Estado.despachar('AGREGAR_ERROR', {
        mensaje: 'Error al cargar la página',
        codigo: 'error-ruta'
      });
    }
  }

  /**
   * Navega a una ruta
   * @param {string} ruta - Ej: '#/nivel/nivel-1'
   */
  function navegar(ruta) {
    if (!ruta.startsWith('#')) {
      ruta = '#' + ruta;
    }
    window.location.hash = ruta;
  }

  /**
   * Navega hacia atrás
   */
  function atras() {
    window.history.back();
  }

  /**
   * Obtiene la ruta actual
   * @returns {string}
   */
  function obtenerRutaActual() {
    return rutaActual || '/';
  }

  /**
   * Extrae ruta y parámetros del hash
   * @private
   * @param {string} hash - Hash sin el #
   * @returns {Object|null} - { patron, parametros } o null
   */
  function extraerParametros(hash) {
    // Rutas a probar en orden de especificidad
    const patrones = [
      { patron: '/leccion/:id', regex: /^\/leccion\/(.+)$/ },
      { patron: '/nivel/:id', regex: /^\/nivel\/(.+)$/ },
      { patron: '/textos/:id', regex: /^\/textos\/(.+)$/ },
      { patron: '/vocabulario', regex: /^\/vocabulario$/ },
      { patron: '/mi-progreso', regex: /^\/mi-progreso$/ },
      { patron: '/', regex: /^(\/)?$/ }
    ];

    for (const { patron, regex } of patrones) {
      const match = hash.match(regex);
      if (match) {
        const parametros = {};
        if (match[1]) {
          if (patron.includes(':id')) {
            parametros.id = match[1];
          }
        }
        return { patron, parametros };
      }
    }

    return null;
  }

  /**
   * Obtiene lista de rutas registradas
   * @returns {Array}
   */
  function obtenerRutas() {
    return Array.from(rutas.keys());
  }

  /**
   * Limpia todas las rutas (útil para reset)
   */
  function limpiar() {
    rutas.clear();
  }

  // API pública
  return {
    registrar,
    iniciar,
    navegar,
    atras,
    obtenerRutaActual,
    obtenerRutas,
    limpiar
  };
})();
