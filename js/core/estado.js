/**
 * STORE CENTRAL
 * Patrón Observer: estado global de la aplicación
 */

const Estado = (() => {
  'use strict';

  const suscriptores = {};

  // Estado actual de la aplicación
  let estadoActual = {
    vistaActual: 'inicio',
    nivelActual: null,
    leccionActual: null,
    usuarioId: null,
    cargando: false,
    errores: []
  };

  /**
   * Obtiene copia inmutable del estado actual
   * @returns {Object}
   */
  function obtenerEstado() {
    return Utils.clonar(estadoActual);
  }

  /**
   * Obtiene un valor específico del estado
   * @param {string} clave - Ej: 'vistaActual'
   * @returns {any}
   */
  function obtener(clave) {
    return Utils.clonar(estadoActual[clave]);
  }

  /**
   * Modifica el estado y notifica suscriptores
   * @param {string} accion - Tipo de acción
   * @param {any} datos - Datos de la acción
   */
  function despachar(accion, datos = {}) {
    const estadoAnterior = Utils.clonar(estadoActual);

    switch (accion) {
      case 'CAMBIAR_VISTA':
        estadoActual.vistaActual = datos.vista;
        break;

      case 'ESTABLECER_NIVEL':
        estadoActual.nivelActual = datos.nivelId;
        break;

      case 'ESTABLECER_LECCION':
        estadoActual.leccionActual = datos.leccionId;
        break;

      case 'ESTABLECER_USUARIO':
        estadoActual.usuarioId = datos.usuarioId;
        break;

      case 'ESTABLECER_CARGANDO':
        estadoActual.cargando = datos.cargando;
        break;

      case 'AGREGAR_ERROR':
        estadoActual.errores.push({
          id: Utils.generarId(),
          mensaje: datos.mensaje,
          codigo: datos.codigo,
          timestamp: Date.now()
        });
        break;

      case 'LIMPIAR_ERRORES':
        estadoActual.errores = [];
        break;

      case 'REMOVER_ERROR':
        estadoActual.errores = estadoActual.errores.filter(
          e => e.id !== datos.id
        );
        break;

      default:
        Utils.error(`Acción desconocida: ${accion}`);
        return;
    }

    // Notificar suscriptores
    notificar(accion, estadoAnterior, estadoActual);
  }

  /**
   * Suscribe a cambios de estado
   * @param {string} accion - Tipo de acción a escuchar (o '*' para todas)
   * @param {Function} callback - Función callback
   * @returns {Function} - Función para desuscribirse
   */
  function suscribir(accion, callback) {
    if (!suscriptores[accion]) {
      suscriptores[accion] = [];
    }

    suscriptores[accion].push(callback);

    // Retornar función para desuscribirse
    return () => {
      suscriptores[accion] = suscriptores[accion].filter(cb => cb !== callback);
    };
  }

  /**
   * Desuscribe un callback
   * @param {string} accion
   * @param {Function} callback
   */
  function desuscribir(accion, callback) {
    if (suscriptores[accion]) {
      suscriptores[accion] = suscriptores[accion].filter(cb => cb !== callback);
    }
  }

  /**
   * Notifica a todos los suscriptores
   * @private
   */
  function notificar(accion, estadoAnterior, estadoNuevo) {
    // Notificar suscriptores específicos de la acción
    if (suscriptores[accion]) {
      suscriptores[accion].forEach(callback => {
        try {
          callback(accion, estadoAnterior, estadoNuevo);
        } catch (error) {
          Utils.error(`Error en suscriptor de '${accion}':`, error);
        }
      });
    }

    // Notificar suscriptores a todas las acciones
    if (suscriptores['*']) {
      suscriptores['*'].forEach(callback => {
        try {
          callback(accion, estadoAnterior, estadoNuevo);
        } catch (error) {
          Utils.error(`Error en suscriptor global:`, error);
        }
      });
    }
  }

  /**
   * Obtiene lista de suscriptores (para debugging)
   * @returns {Object}
   */
  function obtenerSuscriptores() {
    const lista = {};
    for (const accion in suscriptores) {
      lista[accion] = suscriptores[accion].length;
    }
    return lista;
  }

  /**
   * Reinicia el estado a valores por defecto
   */
  function reiniciar() {
    estadoActual = {
      vistaActual: 'inicio',
      nivelActual: null,
      leccionActual: null,
      usuarioId: null,
      cargando: false,
      errores: []
    };

    despachar('ESTADO_REINICIADO', {});
  }

  // API pública
  return {
    obtenerEstado,
    obtener,
    despachar,
    suscribir,
    desuscribir,
    obtenerSuscriptores,
    reiniciar
  };
})();
