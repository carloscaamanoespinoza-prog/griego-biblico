/**
 * VISTA: NIVEL
 * Muestra todas las lecciones de un nivel
 */

const VistaNivel = (() => {
  'use strict';

  let nivel = null;
  let progreso = null;

  /**
   * Renderiza la vista del nivel
   */
  async function renderizar(parametros) {
    const contenedor = document.getElementById('vista-contenedor');
    const nivelId = parametros.id;

    contenedor.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Cargando...</p></div>';

    try {
      // Cargar curriculo para obtener datos del nivel
      const curriculo = await Utils.cargarJSON('datos/curriculo.json');
      nivel = curriculo.niveles.find(n => n.id === nivelId);

      if (!nivel) {
        throw new Error(`Nivel no encontrado: ${nivelId}`);
      }

      progreso = Progreso.obtenerProgreso();

      let html = await generarHTML();
      contenedor.innerHTML = html;
      setupEventListeners();

    } catch (error) {
      Utils.error('Error en VistaNivel:', error);
      contenedor.innerHTML = `
        <div class="alerta error">
          <h3>Error al cargar el nivel</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  /**
   * Genera el HTML de la vista
   */
  async function generarHTML() {
    const tarjetas = await generarTarjetasLecciones();
    let html = `
      <div style="max-width: 1000px; margin: 0 auto;">
        <div style="margin-bottom: 2rem;">
          <button class="boton fantasma" onclick="Router.atras()" style="margin-bottom: 1rem;">
            ← Volver
          </button>
          <h1 style="color: var(--color-nivel-${nivel.numero}); margin-bottom: 0.5rem;">
            ${nivel.icono} Nivel ${nivel.numero}: ${nivel.titulo}
          </h1>
          <p style="color: var(--color-texto-suave); font-size: 1rem; margin: 0;">
            ${nivel.descripcion}
          </p>
        </div>

        <div class="grid-lecciones">
          ${tarjetas}
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Genera tarjetas de lecciones
   */
  async function generarTarjetasLecciones() {
    const promesas = nivel.lecciones.map((leccionId, index) => {
      return generarTarjetaLeccion(leccionId, index + 1);
    });
    const tarjetas = await Promise.all(promesas);
    return tarjetas.join('');
  }

  /**
   * Genera una tarjeta de lección
   */
  async function generarTarjetaLeccion(leccionId, numero) {
    try {
      const leccion = await Utils.cargarJSON(`datos/${nivel.id}/${leccionId}.json`);
      const estadoLeccion = progreso.progreso[nivel.id]?.lecciones[leccionId];
      const estado = estadoLeccion?.estado || 'bloqueada';
      const puntaje = estadoLeccion?.puntajeObtenido || 0;

      const icono = estado === 'completada' ? '✓' :
                   (estado === 'en-progreso' ? '→' : '🔒');

      const claseBloqueada = estado === 'bloqueada' ? 'bloqueada' : '';
      const claseCompletada = estado === 'completada' ? 'completada' : '';

      return `
        <div class="tarjeta-leccion ${claseBloqueada} ${claseCompletada}" data-leccion-id="${leccionId}">
          <div class="numero">${numero}</div>
          <h3 style="margin-bottom: 0.5rem;">${leccion.titulo}</h3>
          <p style="color: var(--color-texto-suave); font-size: 0.9rem; margin-bottom: 1rem;">
            ${leccion.subtitulo}
          </p>
          <div class="barra-progreso-leccion">
            <div class="progreso" style="width: ${estado === 'completada' ? 100 : 0}%; background-color: var(--color-nivel-${nivel.numero});"></div>
          </div>
          <div class="puntaje">
            ${estado === 'bloqueada' ? '🔒 Bloqueada' : `${leccion.duracionEstimada || 25} minutos • ${puntaje}%`}
          </div>
          <div class="icono-estado ${estado}">
            ${icono}
          </div>
        </div>
      `;
    } catch (error) {
      Utils.error(`Error al cargar lección ${leccionId}:`, error);
      return `
        <div class="tarjeta-leccion bloqueada">
          <div class="numero">${numero}</div>
          <p style="color: var(--color-texto-suave);">Error al cargar lección</p>
        </div>
      `;
    }
  }

  /**
   * Configura event listeners
   */
  async function setupEventListeners() {
    // Esperar a que se rendericen las tarjetas
    await new Promise(resolve => setTimeout(resolve, 100));

    document.querySelectorAll('.tarjeta-leccion:not(.bloqueada)').forEach(tarjeta => {
      tarjeta.addEventListener('click', () => {
        const leccionId = tarjeta.getAttribute('data-leccion-id');
        Router.navegar(`#/leccion/${leccionId}`);
      });

      // Cambiar cursor
      tarjeta.style.cursor = 'pointer';
    });
  }

  // API pública
  return { renderizar };
})();
