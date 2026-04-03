/**
 * NAVEGACIÓN
 * Gestiona el sidebar y la barra superior
 */

const Navegacion = (() => {
  'use strict';

  /**
   * Inicializa la navegación
   */
  function inicializar() {
    setupBotones();
    cargarNiveles();
    actualizarProgreso();
  }

  /**
   * Configura botones de la navegación
   */
  function setupBotones() {
    const botonMenu = document.getElementById('boton-menu-movil');
    const sidebar = document.getElementById('sidebar');

    if (botonMenu) {
      botonMenu.addEventListener('click', () => {
        sidebar.classList.toggle('abierto');
      });
    }

    // Cerrar sidebar al hacer click en un enlace
    document.querySelectorAll('.sidebar a').forEach(enlace => {
      enlace.addEventListener('click', () => {
        sidebar.classList.remove('abierto');
      });
    });
  }

  /**
   * Carga los niveles en el sidebar
   */
  async function cargarNiveles() {
    try {
      const curriculo = await Utils.cargarJSON('datos/curriculo.json');
      const progreso = Progreso.obtenerProgreso();

      curriculo.niveles.forEach(nivel => {
        actualizarItemNivel(nivel, progreso);
      });
    } catch (error) {
      Utils.error('Error al cargar niveles:', error);
    }
  }

  /**
   * Actualiza un item de nivel en el sidebar
   */
  function actualizarItemNivel(nivel, progreso) {
    const itemNav = document.querySelector(`[data-nivel="${nivel.id}"]`);
    if (!itemNav) return;

    const submenu = document.getElementById(`submenu-${nivel.id}`);
    const badge = itemNav.querySelector('.badge');

    // Determinar si está desbloqueado
    const bloqueado = nivel.prerequisito &&
                     (!progreso.progreso[nivel.prerequisito] ||
                      progreso.progreso[nivel.prerequisito].estado !== 'completado');

    if (bloqueado) {
      itemNav.classList.add('bloqueado');
      if (badge) badge.textContent = '🔒';
    } else {
      itemNav.classList.remove('bloqueado');

      // Calcular porcentaje
      const nivelProgreso = progreso.progreso[nivel.id];
      let porcentaje = 0;
      if (nivelProgreso) {
        const completadas = Object.values(nivelProgreso.lecciones)
          .filter(l => l.estado === 'completada').length;
        porcentaje = Math.round((completadas / nivel.totalLecciones) * 100);
      }

      if (badge) badge.textContent = `${porcentaje}%`;
    }

    // Cargar lecciones del nivel
    cargarLeccionesNivel(nivel, submenu, bloqueado);

    // Expandir/contraer submenu
    const enlaceNivel = itemNav.querySelector('a');
    if (enlaceNivel) {
      enlaceNivel.addEventListener('click', (e) => {
        e.preventDefault();
        submenu.classList.toggle('abierto');
      });
    }
  }

  /**
   * Carga las lecciones de un nivel en el submenu
   */
  async function cargarLeccionesNivel(nivel, submenu, nivelBloqueado) {
    const progreso = Progreso.obtenerProgreso();

    nivel.lecciones.forEach((leccionId, index) => {
      const estadoLeccion = progreso.progreso[nivel.id]?.lecciones[leccionId];
      const estado = estadoLeccion?.estado || 'bloqueada';
      const icono = estado === 'completada' ? '✓' :
                   (estado === 'en-progreso' ? '→' : '🔒');

      const li = document.createElement('li');
      li.innerHTML = `
        <a href="#/leccion/${leccionId}" class="leccion-link">
          <span class="icono-estado ${estado}">${icono}</span>
          <span>Lección ${index + 1}</span>
        </a>
      `;

      // Disabled si el nivel está bloqueado
      if (nivelBloqueado) {
        li.classList.add('bloqueado');
        const enlace = li.querySelector('a');
        enlace.style.pointerEvents = 'none';
        enlace.style.opacity = '0.5';
      }

      submenu.appendChild(li);
    });
  }

  /**
   * Actualiza puntos y racha en la barra superior
   */
  function actualizarProgreso() {
    const progreso = Progreso.obtenerProgreso();

    const puntos = document.getElementById('puntos-texto');
    const racha = document.getElementById('racha-texto');

    if (puntos) puntos.textContent = progreso.usuario.puntosTotales;
    if (racha) racha.textContent = progreso.usuario.rachaActual;
  }

  /**
   * Actualiza el estado de una lección en el sidebar
   */
  function actualizarLeccion(nivelId, leccionId, estado) {
    const enlaceLeccion = document.querySelector(`a[href="#/leccion/${leccionId}"]`);
    if (!enlaceLeccion) return;

    const padre = enlaceLeccion.parentElement;
    const icono = padre.querySelector('.icono-estado');

    // Remover clases anteriores
    padre.classList.remove('completada', 'en-progreso', 'bloqueada');
    padre.classList.add(estado);

    // Actualizar icono
    const iconos = {
      'completada': '✓',
      'en-progreso': '→',
      'bloqueada': '🔒'
    };

    if (icono) icono.textContent = iconos[estado] || '?';
  }

  /**
   * Marca una ruta como activa en la navegación
   */
  function marcarRutaActiva(ruta) {
    // Remover clase activo de todos los enlaces
    document.querySelectorAll('.sidebar a').forEach(enlace => {
      enlace.parentElement.classList.remove('activo');
    });

    // Agregar clase activo al enlace actual
    const enlaceActivo = document.querySelector(`.sidebar a[href="${ruta}"]`);
    if (enlaceActivo) {
      enlaceActivo.parentElement.classList.add('activo');
    }
  }

  // Escuchar eventos
  Eventos.escuchar('leccion:guardada', () => actualizarProgreso());
  Eventos.escuchar('ruta:cambiada', (datos) => {
    marcarRutaActiva(`#${datos.patron}`);
  });

  // API pública
  return {
    inicializar,
    actualizarProgreso,
    actualizarLeccion,
    marcarRutaActiva
  };
})();
