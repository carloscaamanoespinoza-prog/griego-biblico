/**
 * VISTA: LECCIÓN
 * Renderiza una lección individual con visor y ejercicios
 */

const VistaLeccion = (() => {
  'use strict';

  let visor = null;

  /**
   * Renderiza la vista de una lección
   */
  async function renderizar(parametros) {
    const contenedor = document.getElementById('vista-contenedor');
    const leccionId = parametros.id;

    contenedor.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Cargando lección...</p></div>';

    try {
      // Cargar la lección
      const leccion = await cargarLeccion(leccionId);

      if (!leccion) {
        throw new Error(`Lección no encontrada: ${leccionId}`);
      }

      // Validar prerequisitos
      // TEMPORALMENTE DESHABILITADO PARA EXPLORACIÓN
      // if (!Progreso.verificarPrerequisitos(leccion.prerequisitos)) {
      //   throw new Error(
      //     'No has completado las lecciones requisito para acceder a esta lección. ' +
      //     'Por favor, completa las lecciones anteriores primero.'
      //   );
      // }

      // Crear visor y renderizar
      visor = new VisorLeccion(leccion, contenedor);
      visor.renderizar();

      // Actualizar navegación
      Navegacion.marcarRutaActiva(`#/leccion/${leccionId}`);

    } catch (error) {
      Utils.error('Error en VistaLeccion:', error);
      contenedor.innerHTML = `
        <div style="max-width: 800px; margin: 2rem auto;">
          <div class="alerta error">
            <h3>Error al cargar la lección</h3>
            <p>${error.message}</p>
            <button class="boton primario" onclick="Router.atras()" style="margin-top: 1rem;">
              Volver Atrás
            </button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Carga una lección desde el archivo JSON
   * Deduce el nivel y nivel del ID de la lección
   */
  async function cargarLeccion(leccionId) {
    try {
      // Deducir nivel del ID (ej: n1-l01 -> nivel-1, leccion 1)
      const match = leccionId.match(/^n(\d+)-l(\d+)$/);
      if (!match) {
        throw new Error(`Formato de ID de lección inválido: ${leccionId}`);
      }

      const numeroNivel = match[1];
      const nivelId = `nivel-${numeroNivel}`;
      const ruta = `datos/${nivelId}/${leccionId}.json`;

      const leccion = await Utils.cargarJSON(ruta);

      return leccion;
    } catch (error) {
      Utils.error(`Error al cargar lección ${leccionId}:`, error);
      throw error;
    }
  }

  // Escuchar eventos de lecciones completadas
  Eventos.escuchar('leccion:completada', (datos) => {
    // La lección maneja la navegación, así que aquí solo registramos
    Utils.log('Lección completada:', datos);
  });

  // API pública
  return { renderizar };
})();
