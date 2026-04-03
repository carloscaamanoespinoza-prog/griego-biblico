/**
 * VISTA: INICIO / DASHBOARD
 */

const VistaInicio = (() => {
  'use strict';

  let curriculo = null;
  let progreso = null;

  /**
   * Renderiza la vista de inicio
   */
  async function renderizar() {
    const contenedor = document.getElementById('vista-contenedor');
    contenedor.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Cargando...</p></div>';

    try {
      // Cargar datos necesarios
      curriculo = await Utils.cargarJSON('datos/curriculo.json');
      progreso = Progreso.obtenerProgreso();

      let html = generarHTML();
      contenedor.innerHTML = html;
      setupEventListeners();

    } catch (error) {
      Utils.error('Error en VistaInicio:', error);
      contenedor.innerHTML = `
        <div class="alerta error">
          <h3>Error al cargar</h3>
          <p>No se pudo cargar el contenido del curso. Por favor, recarga la página.</p>
        </div>
      `;
    }
  }

  /**
   * Genera el HTML de la vista
   */
  function generarHTML() {
    let html = `
      <div style="max-width: 1000px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h1 style="font-size: 2.5rem; color: var(--color-primario); margin-bottom: 0.5rem;">
            α Griego Bíblico Koiné
          </h1>
          <p style="color: var(--color-texto-suave); font-size: 1.1rem;">
            Curso interactivo de autoinstrucción para hispanohablantes
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
          ${generarTarjetasEstadisticas()}
        </div>

        <h2 style="margin-top: 3rem; margin-bottom: 1.5rem; color: var(--color-primario);">Mis Cursos</h2>
        <div class="grid-lecciones">
          ${generarTarjetasNiveles()}
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Genera tarjetas de estadísticas
   */
  function generarTarjetasEstadisticas() {
    const stats = Progreso.obtenerEstadisticas();

    return `
      <div class="tarjeta">
        <div style="color: var(--color-primario); font-size: 2rem; margin-bottom: 0.5rem;">📚</div>
        <h3 style="margin: 0 0 0.5rem 0;">Lecciones Completadas</h3>
        <p style="margin: 0; font-size: 1.5rem; font-weight: bold; color: var(--color-nivel-1);">
          ${stats.totalLeccionesCompletadas}/44
        </p>
      </div>

      <div class="tarjeta">
        <div style="color: var(--color-secundario); font-size: 2rem; margin-bottom: 0.5rem;">⭐</div>
        <h3 style="margin: 0 0 0.5rem 0;">Puntos Totales</h3>
        <p style="margin: 0; font-size: 1.5rem; font-weight: bold; color: var(--color-secundario);">
          ${stats.usuario.puntosTotales}
        </p>
      </div>

      <div class="tarjeta">
        <div style="color: #f97316; font-size: 2rem; margin-bottom: 0.5rem;">🔥</div>
        <h3 style="margin: 0 0 0.5rem 0;">Racha Actual</h3>
        <p style="margin: 0; font-size: 1.5rem; font-weight: bold; color: #f97316;">
          ${stats.usuario.rachaActual} días
        </p>
      </div>

      <div class="tarjeta">
        <div style="color: var(--color-acento); font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
        <h3 style="margin: 0 0 0.5rem 0;">Puntaje Promedio</h3>
        <p style="margin: 0; font-size: 1.5rem; font-weight: bold; color: var(--color-acento);">
          ${stats.puntajePromedio}%
        </p>
      </div>
    `;
  }

  /**
   * Genera tarjetas de los niveles
   */
  function generarTarjetasNiveles() {
    return curriculo.niveles.map(nivel => {
      const nivelProgreso = progreso.progreso[nivel.id];
      const bloqueado = nivel.prerequisito &&
                       (!progreso.progreso[nivel.prerequisito] ||
                        progreso.progreso[nivel.prerequisito].estado !== 'completado');

      let completadas = 0;
      if (nivelProgreso) {
        completadas = Object.values(nivelProgreso.lecciones)
          .filter(l => l.estado === 'completada').length;
      }

      const porcentaje = Math.round((completadas / nivel.totalLecciones) * 100);

      const claseBloqueo = bloqueado ? 'bloqueada' : '';
      const estadoCompletado = completadas === nivel.totalLecciones ? 'completada' : '';

      return `
        <div class="tarjeta-leccion ${claseBloqueo} ${estadoCompletado}">
          <div class="numero">${nivel.numero}</div>
          <h3 style="margin-bottom: 0.5rem;">${nivel.titulo}</h3>
          <p style="color: var(--color-texto-suave); font-size: 0.9rem; margin-bottom: 1rem;">
            ${nivel.descripcion}
          </p>
          <div class="barra-progreso-leccion">
            <div class="progreso" style="width: ${porcentaje}%; background-color: var(--color-nivel-${nivel.numero});"></div>
          </div>
          <div class="puntaje">
            ${bloqueado ? '🔒 Bloqueado' : `${completadas}/${nivel.totalLecciones} lecciones • ${porcentaje}%`}
          </div>
          <div class="icono-estado ${bloqueado ? 'bloqueada' : (completadas === nivel.totalLecciones ? 'completada' : 'en-progreso')}">
            ${bloqueado ? '🔒' : (completadas === nivel.totalLecciones ? '✓' : '→')}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Configura event listeners
   */
  function setupEventListeners() {
    // Click en tarjeta de nivel
    document.querySelectorAll('.tarjeta-leccion:not(.bloqueada)').forEach(tarjeta => {
      tarjeta.addEventListener('click', () => {
        const indice = Array.from(document.querySelectorAll('.tarjeta-leccion:not(.bloqueada)')).indexOf(tarjeta);
        const nivelId = curriculo.niveles[indice].id;
        Router.navegar(`#/nivel/${nivelId}`);
      });
    });
  }

  // API pública
  return { renderizar };
})();
