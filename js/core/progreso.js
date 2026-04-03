/**
 * GESTOR DE PROGRESO
 * Persistencia en localStorage del progreso del usuario
 */

const Progreso = (() => {
  'use strict';

  const CLAVE_STORAGE = 'griego-biblico-progreso';
  const VERSION_SCHEMA = '1.0';
  const EXPIRACION_SESION = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

  // Estructura por defecto
  const ESTRUCTURA_DEFECTO = {
    version: VERSION_SCHEMA,
    usuario: {
      id: Utils.generarId(),
      inicioEstudio: new Date().toISOString(),
      ultimaActividad: new Date().toISOString(),
      rachaActual: 0,
      rachaMaxima: 0,
      ultimoDiaActividad: null,
      puntosTotales: 0
    },
    progreso: {}, // { 'nivel-1': { estado: 'en-progreso', lecciones: {} } }
    vocabulario: {
      aprendidas: [],
      enRepaso: [],
      proximaRepaso: {} // { 'palabra': '2026-04-05T10:00:00Z' }
    },
    estadisticas: {
      ejerciciosCompletados: 0,
      respuestasCorrectas: 0,
      tiempoTotalSegundos: 0,
      historicoSemanal: [0, 0, 0, 0, 0, 0, 0] // Últimos 7 días
    },
    preferencias: {
      modoOscuro: false,
      transliteracion: true,
      mostrarParsing: true,
      velocidadAudio: 1.0,
      notificaciones: true
    }
  };

  /**
   * Inicializa el progreso si no existe
   */
  function inicializar() {
    try {
      const datosActuales = localStorage.getItem(CLAVE_STORAGE);

      if (!datosActuales) {
        // Primera vez: crear estructura
        const nuevoProgreso = Utils.clonar(ESTRUCTURA_DEFECTO);
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevoProgreso));
        Utils.log('Progreso inicializado por primera vez');
        return true;
      }

      // Validar schema
      const datos = JSON.parse(datosActuales);
      if (datos.version !== VERSION_SCHEMA) {
        Utils.log('Versión de schema diferente, migrando...');
        migrarSchema(datos);
      }

      return true;
    } catch (error) {
      Utils.error('Error al inicializar progreso:', error);
      return false;
    }
  }

  /**
   * Obtiene el progreso actual
   * @returns {Object}
   */
  function obtenerProgreso() {
    try {
      const datos = localStorage.getItem(CLAVE_STORAGE);
      if (!datos) {
        inicializar();
        return JSON.parse(localStorage.getItem(CLAVE_STORAGE));
      }
      return JSON.parse(datos);
    } catch (error) {
      Utils.error('Error al obtener progreso:', error);
      return Utils.clonar(ESTRUCTURA_DEFECTO);
    }
  }

  /**
   * Guarda el progreso completo
   * @param {Object} datos
   * @returns {boolean}
   */
  function guardarProgreso(datos) {
    try {
      // Actualizar timestamp de última actividad
      datos.usuario.ultimaActividad = new Date().toISOString();

      // Actualizar racha
      actualizarRacha(datos);

      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos));
      Eventos.emitir('progreso:guardado', datos);
      return true;
    } catch (error) {
      Utils.error('Error al guardar progreso:', error);
      return false;
    }
  }

  /**
   * Guarda el progreso de una lección específica
   * @param {string} nivelId - Ej: 'nivel-1'
   * @param {string} leccionId - Ej: 'n1-l01'
   * @param {Object} datos - { estado, puntajeObtenido, intentos, etc. }
   */
  function guardarProgresoLeccion(nivelId, leccionId, datos) {
    try {
      const progreso = obtenerProgreso();

      if (!progreso.progreso[nivelId]) {
        progreso.progreso[nivelId] = {
          estado: 'en-progreso',
          porcentaje: 0,
          lecciones: {}
        };
      }

      progreso.progreso[nivelId].lecciones[leccionId] = {
        estado: datos.estado || 'en-progreso',
        fechaCompletada: datos.fechaCompletada || null,
        fechaInicio: datos.fechaInicio || new Date().toISOString(),
        intentos: datos.intentos || 1,
        puntajeObtenido: datos.puntajeObtenido || 0,
        puntajeMaximo: datos.puntajeMaximo || 100,
        tiempoInvertido: datos.tiempoInvertido || 0
      };

      guardarProgreso(progreso);
      Eventos.emitir('leccion:guardada', { nivelId, leccionId, ...datos });
      return true;
    } catch (error) {
      Utils.error('Error al guardar progreso de lección:', error);
      return false;
    }
  }

  /**
   * Marca una lección como completada
   * @param {string} nivelId
   * @param {string} leccionId
   * @param {number} puntaje
   */
  function marcarLeccionCompleta(nivelId, leccionId, puntaje) {
    return guardarProgresoLeccion(nivelId, leccionId, {
      estado: 'completada',
      fechaCompletada: new Date().toISOString(),
      puntajeObtenido: puntaje,
      puntajeMaximo: 100
    });
  }

  /**
   * Obtiene el estado de una lección específica
   * @param {string} nivelId
   * @param {string} leccionId
   * @returns {Object}
   */
  function obtenerEstadoLeccion(nivelId, leccionId) {
    const progreso = obtenerProgreso();
    if (progreso.progreso[nivelId] && progreso.progreso[nivelId].lecciones[leccionId]) {
      return progreso.progreso[nivelId].lecciones[leccionId];
    }
    return {
      estado: 'bloqueada',
      puntajeObtenido: 0,
      puntajeMaximo: 100,
      intentos: 0,
      tiempoInvertido: 0
    };
  }

  /**
   * Calcula estadísticas generales
   * @returns {Object}
   */
  function obtenerEstadisticas() {
    const progreso = obtenerProgreso();
    return {
      usuario: progreso.usuario,
      estadisticas: progreso.estadisticas,
      totalLeccionesCompletadas: contarLeccionesCompletadas(progreso),
      puntajePromedio: calcularPuntajePromedio(progreso)
    };
  }

  /**
   * Agrega un ejercicio completado a estadísticas
   * @param {boolean} correcto
   * @param {number} puntaje
   */
  function registrarEjercicio(correcto, puntaje) {
    try {
      const progreso = obtenerProgreso();
      progreso.estadisticas.ejerciciosCompletados++;

      if (correcto) {
        progreso.estadisticas.respuestasCorrectas++;
        progreso.usuario.puntosTotales += puntaje;
      }

      guardarProgreso(progreso);
      Eventos.emitir('ejercicio:registrado', { correcto, puntaje });
      return true;
    } catch (error) {
      Utils.error('Error al registrar ejercicio:', error);
      return false;
    }
  }

  /**
   * Actualiza la racha diaria
   * @param {Object} progreso
   */
  function actualizarRacha(progreso) {
    const hoy = new Date().toDateString();
    const ultimoDia = progreso.usuario.ultimoDiaActividad
      ? new Date(progreso.usuario.ultimoDiaActividad).toDateString()
      : null;

    if (ultimoDia !== hoy) {
      if (ultimoDia) {
        // Verificar si fue ayer
        const ayer = new Date(Date.now() - 86400000).toDateString();
        if (ultimoDia === ayer) {
          progreso.usuario.rachaActual++;
        } else {
          // Se rompió la racha
          progreso.usuario.rachaActual = 1;
        }
      } else {
        progreso.usuario.rachaActual = 1;
      }

      if (progreso.usuario.rachaActual > progreso.usuario.rachaMaxima) {
        progreso.usuario.rachaMaxima = progreso.usuario.rachaActual;
      }

      progreso.usuario.ultimoDiaActividad = new Date().toISOString();
    }
  }

  /**
   * Exporta el progreso como JSON para descargar
   * @returns {Blob}
   */
  function exportarProgreso() {
    try {
      const progreso = obtenerProgreso();
      const json = JSON.stringify(progreso, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `griego-progreso-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      Utils.error('Error al exportar progreso:', error);
      return false;
    }
  }

  /**
   * Importa progreso desde un archivo JSON
   * @param {File} archivo
   * @returns {Promise<boolean>}
   */
  function importarProgreso(archivo) {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (evento) => {
        try {
          const datos = JSON.parse(evento.target.result);
          localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos));
          Eventos.emitir('progreso:importado', datos);
          resolve(true);
        } catch (error) {
          Utils.error('Error al importar progreso:', error);
          resolve(false);
        }
      };

      reader.readAsText(archivo);
    });
  }

  /**
   * Limpia todo el progreso (reset)
   */
  function limpiarProgreso() {
    if (confirm('¿Estás seguro de que quieres borrar todo tu progreso? Esta acción no se puede deshacer.')) {
      localStorage.removeItem(CLAVE_STORAGE);
      inicializar();
      Eventos.emitir('progreso:limpiado');
      location.reload();
    }
  }

  // Funciones privadas

  function contarLeccionesCompletadas(progreso) {
    let total = 0;
    for (const nivel in progreso.progreso) {
      for (const leccion in progreso.progreso[nivel].lecciones) {
        if (progreso.progreso[nivel].lecciones[leccion].estado === 'completada') {
          total++;
        }
      }
    }
    return total;
  }

  function calcularPuntajePromedio(progreso) {
    let totalPuntaje = 0;
    let totalLecciones = 0;

    for (const nivel in progreso.progreso) {
      for (const leccion in progreso.progreso[nivel].lecciones) {
        const lec = progreso.progreso[nivel].lecciones[leccion];
        totalPuntaje += lec.puntajeObtenido || 0;
        totalLecciones++;
      }
    }

    return totalLecciones > 0 ? Math.round(totalPuntaje / totalLecciones) : 0;
  }

  function migrarSchema(datosAntiguos) {
    // Aquí se manejarían migraciones futuras si cambia el schema
    // Por ahora, es un placeholder
  }

  // API pública
  return {
    inicializar,
    obtenerProgreso,
    guardarProgreso,
    guardarProgresoLeccion,
    marcarLeccionCompleta,
    obtenerEstadoLeccion,
    obtenerEstadisticas,
    registrarEjercicio,
    exportarProgreso,
    importarProgreso,
    limpiarProgreso
  };
})();
