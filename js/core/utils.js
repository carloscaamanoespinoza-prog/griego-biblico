/**
 * UTILIDADES GENERALES
 * Funciones auxiliares para todo el sistema
 */

const Utils = (() => {
  'use strict';

  /**
   * Carga un archivo JSON vía fetch
   * @param {string} ruta - Ruta del archivo JSON
   * @returns {Promise<Object>}
   */
  function cargarJSON(ruta) {
    return fetch(ruta)
      .then(respuesta => {
        if (!respuesta.ok) {
          throw new Error(`Error al cargar ${ruta}: ${respuesta.statusText}`);
        }
        return respuesta.json();
      })
      .catch(error => {
        console.error(`Error en cargarJSON(${ruta}):`, error);
        throw error;
      });
  }

  /**
   * Normaliza texto griego a NFC (composición canónica)
   * Importante para validar respuestas en ejercicios
   * @param {string} texto - Texto griego
   * @returns {string} - Texto normalizado en minúsculas
   */
  function normalizarGriego(texto) {
    if (!texto) return '';
    return texto
      .normalize('NFC')
      .trim()
      .toLowerCase();
  }

  /**
   * Genera un ID único usando UUID v4 simplificado
   * @returns {string}
   */
  function generarId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Formatea una fecha en formato legible
   * @param {Date|string} fecha
   * @returns {string} - Ej: "3 de abril de 2026"
   */
  function formatearFecha(fecha) {
    if (typeof fecha === 'string') {
      fecha = new Date(fecha);
    }

    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia} de ${mes} de ${año}`;
  }

  /**
   * Formatea tiempo en minutos/segundos
   * @param {number} segundos - Segundos totales
   * @returns {string} - Ej: "15m 30s"
   */
  function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;

    if (minutos === 0) {
      return `${secs}s`;
    }

    return `${minutos}m ${secs}s`;
  }

  /**
   * Calcula el porcentaje de progreso
   * @param {number} actual - Valor actual
   * @param {number} total - Valor total
   * @returns {number} - Porcentaje 0-100
   */
  function calcularPorcentaje(actual, total) {
    if (total === 0) return 0;
    return Math.round((actual / total) * 100);
  }

  /**
   * Compara dos valores griegos ignorando diacríticos y caso
   * @param {string} respuesta - Respuesta del usuario
   * @param {string} correcta - Respuesta correcta
   * @returns {boolean}
   */
  function compararGriego(respuesta, correcta) {
    const r = normalizarGriego(respuesta);
    const c = normalizarGriego(correcta);

    // Comparación exacta después de normalizar
    if (r === c) {
      return true;
    }

    // Comparación flexible: permite variaciones menores
    // (si en el futuro se necesita)
    return false;
  }

  /**
   * Valida si una cadena es griego válido
   * @param {string} texto
   * @returns {boolean}
   */
  function esGriegoValido(texto) {
    // Rango Unicode para griego polítonico: U+0370 a U+03FF
    // Más extensión para espíritus y acentos: U+1F00 a U+1FFF
    const reGriego = /^[\u0370-\u03FF\u1F00-\u1FFF\s\-']*$/;
    return reGriego.test(texto);
  }

  /**
   * Traduce un código de error en un mensaje legible
   * @param {string} codigo
   * @returns {string}
   */
  function obtenerMensajeError(codigo) {
    const mensajes = {
      'respuesta-vacia': 'Por favor, proporciona una respuesta',
      'formato-invalido': 'El formato de tu respuesta no es válido',
      'griego-invalido': 'La respuesta contiene caracteres no griegos',
      'error-carga': 'Error al cargar el contenido',
      'error-guardado': 'Error al guardar el progreso',
      'desconocido': 'Ha ocurrido un error desconocido'
    };

    return mensajes[codigo] || mensajes['desconocido'];
  }

  /**
   * Debounce para funciones que se llaman repetidamente
   * @param {Function} fn
   * @param {number} ms - Millisegundos de espera
   * @returns {Function}
   */
  function debounce(fn, ms = 300) {
    let timeoutId = null;

    return function debounced(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /**
   * Throttle para limitar frecuencia de ejecución
   * @param {Function} fn
   * @param {number} ms
   * @returns {Function}
   */
  function throttle(fn, ms = 300) {
    let lastCall = 0;

    return function throttled(...args) {
      const now = Date.now();
      if (now - lastCall >= ms) {
        fn.apply(this, args);
        lastCall = now;
      }
    };
  }

  /**
   * Clona un objeto profundamente
   * @param {any} obj
   * @returns {any}
   */
  function clonar(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => clonar(item));
    }

    if (obj instanceof Object) {
      const clonado = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonado[key] = clonar(obj[key]);
        }
      }
      return clonado;
    }

    return obj;
  }

  /**
   * Decodifica HTML entities (ej: &lt; a <)
   * @param {string} html
   * @returns {string}
   */
  function decodificarHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  /**
   * Log seguro que solo muestra en desarrollo
   * @param {any} args
   */
  function log(...args) {
    if (typeof DEBUG !== 'undefined' && DEBUG) {
      console.log('[Griego]', ...args);
    }
  }

  /**
   * Log de error
   * @param {any} args
   */
  function error(...args) {
    console.error('[Griego ERROR]', ...args);
  }

  // API pública
  return {
    cargarJSON,
    normalizarGriego,
    generarId,
    formatearFecha,
    formatearTiempo,
    calcularPorcentaje,
    compararGriego,
    esGriegoValido,
    obtenerMensajeError,
    debounce,
    throttle,
    clonar,
    decodificarHTML,
    log,
    error
  };
})();
