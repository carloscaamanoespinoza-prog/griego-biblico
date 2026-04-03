/**
 * BUS DE EVENTOS GLOBAL
 * Sistema de mensajería entre componentes
 */

const Eventos = (() => {
  'use strict';

  const listeners = {};

  /**
   * Emite un evento
   * @param {string} nombre - Nombre del evento
   * @param {any} datos - Datos del evento
   */
  function emitir(nombre, datos) {
    if (!listeners[nombre]) {
      return;
    }

    listeners[nombre].forEach(callback => {
      try {
        callback(datos);
      } catch (error) {
        Utils.error(`Error en listener de evento '${nombre}':`, error);
      }
    });
  }

  /**
   * Escucha un evento
   * @param {string} nombre
   * @param {Function} callback
   * @returns {Function} - Función para desuscribirse
   */
  function escuchar(nombre, callback) {
    if (!listeners[nombre]) {
      listeners[nombre] = [];
    }

    listeners[nombre].push(callback);

    // Retornar función para desuscribirse
    return () => {
      if (listeners[nombre]) {
        listeners[nombre] = listeners[nombre].filter(cb => cb !== callback);
      }
    };
  }

  /**
   * Escucha un evento una sola vez
   * @param {string} nombre
   * @param {Function} callback
   * @returns {Function} - Función para cancelar
   */
  function escucharUnaVez(nombre, callback) {
    const desuscribir = escuchar(nombre, (datos) => {
      callback(datos);
      desuscribir();
    });

    return desuscribir;
  }

  /**
   * Deja de escuchar un evento
   * @param {string} nombre
   * @param {Function} callback
   */
  function dejar(nombre, callback) {
    if (listeners[nombre]) {
      listeners[nombre] = listeners[nombre].filter(cb => cb !== callback);
    }
  }

  /**
   * Obtiene lista de listeners (para debugging)
   * @returns {Object}
   */
  function obtenerListeners() {
    const lista = {};
    for (const evento in listeners) {
      lista[evento] = listeners[evento].length;
    }
    return lista;
  }

  // API pública
  return {
    emitir,
    escuchar,
    escucharUnaVez,
    dejar,
    obtenerListeners
  };
})();
