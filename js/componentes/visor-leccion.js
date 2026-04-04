/**
 * VISOR DE LECCIÓN
 * Renderiza una lección completa desde JSON
 */

class VisorLeccion {
  constructor(leccion, contenedor) {
    this.leccion = leccion;
    this.contenedor = contenedor;
    this.seccionActual = 0;
    this.ejerciciosCompletados = [];
    this.inicio = Date.now();
  }

  /**
   * Renderiza la lección completa
   */
  renderizar() {
    let html = this.renderizarEncabezado();
    html += this.renderizarBarraProgreso();
    html += this.renderizarSeccionActual();

    this.contenedor.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Renderiza encabezado de la lección
   */
  renderizarEncabezado() {
    const nivelColor = `var(--color-nivel-${this.leccion.nivel})`;

    return `
      <div class="visor-leccion">
        <div class="encabezado-leccion">
          <span class="badge nivel-${this.leccion.nivel}">
            Nivel ${this.leccion.nivel}
          </span>
          <h1>${this.leccion.titulo}</h1>
          <p class="subtitulo">${this.leccion.subtitulo}</p>
        </div>
    `;
  }

  /**
   * Renderiza barra de progreso
   */
  renderizarBarraProgreso() {
    const totalSecciones = this.leccion.secciones.length + (this.leccion.ejercicios?.length || 0);
    const completadas = this.seccionActual;
    const porcentaje = Math.round((completadas / totalSecciones) * 100);

    let html = `
      <div class="barra-progreso-leccion">
        <div class="label">
          <span>Progreso de la lección</span>
          <span>${porcentaje}%</span>
        </div>
        <div class="contenedor">
          <div class="relleno" style="width: ${porcentaje}%"></div>
        </div>
        <div class="secciones-progreso">
    `;

    // Segmentos de progreso
    const totalElementos = this.leccion.secciones.length + (this.leccion.ejercicios?.length || 0);
    for (let i = 0; i < totalElementos; i++) {
      const clase = i < this.seccionActual ? 'completado' : (i === this.seccionActual ? 'actual' : '');
      html += `<div class="segmento ${clase}"></div>`;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Renderiza la sección actual
   */
  renderizarSeccionActual() {
    let html = '<div class="secciones">';

    // Determinar si estamos en una sección o un ejercicio
    if (this.seccionActual < this.leccion.secciones.length) {
      // Mostramos una sección
      const seccion = this.leccion.secciones[this.seccionActual];
      html += this.renderizarSeccion(seccion);
    } else {
      // Mostramos un ejercicio
      const indiceEjercicio = this.seccionActual - this.leccion.secciones.length;
      const ejercicio = this.leccion.ejercicios[indiceEjercicio];
      html += this.renderizarEjercicio(ejercicio);
    }

    html += '</div>';

    // Botones de navegación
    html += this.renderizarBotones();

    return html;
  }

  /**
   * Renderiza una sección de contenido
   */
  renderizarSeccion(seccion) {
    let html = `<div class="seccion ${seccion.tipo}">`;

    if (seccion.tipo === 'explicacion') {
      html += this.renderizarExplicacion(seccion);
    } else if (seccion.tipo === 'tabla-interactiva') {
      html += this.renderizarTabla(seccion);
    }

    html += '</div>';
    return html;
  }

  /**
   * Renderiza sección tipo explicación
   */
  renderizarExplicacion(seccion) {
    let html = `<h2>${seccion.titulo}</h2>`;

    if (seccion.descripcion) {
      html += `<p style="color: var(--color-texto-suave); margin-bottom: 1.5rem;">${seccion.descripcion}</p>`;
    }

    seccion.contenido.forEach(elemento => {
      if (elemento.tipo === 'parrafo') {
        html += `<p>${elemento.texto}</p>`;
      } else if (elemento.tipo === 'cita') {
        html += `
          <div class="cita">
            <div class="texto-griego" style="font-family: var(--fuente-griega);">
              ${elemento.texto}
            </div>
            <div class="traduccion"><em>${elemento.traduccion}</em></div>
            <div class="referencia"><strong>${elemento.referencia}</strong></div>
          </div>
        `;
      } else if (elemento.tipo === 'nota') {
        html += `
          <div class="nota">
            <div class="titulo">💡 ${elemento.titulo}</div>
            <div class="contenido">${elemento.texto}</div>
          </div>
        `;
      } else if (elemento.tipo === 'titulo-seccion') {
        html += `<h${elemento.nivel}>${elemento.texto}</h${elemento.nivel}>`;
      } else if (elemento.tipo === 'lista') {
        html += '<ul>';
        elemento.items.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += '</ul>';
      }
    });

    return html;
  }

  /**
   * Renderiza tabla interactiva
   */
  renderizarTabla(seccion) {
    let html = `
      <h2>${seccion.titulo}</h2>
    `;

    if (seccion.descripcion) {
      html += `<p style="color: var(--color-texto-suave); margin-bottom: 1rem;">${seccion.descripcion}</p>`;
    }

    html += '<div style="overflow-x: auto;"><table class="tabla">';

    // Encabezado
    html += '<thead><tr>';
    seccion.datos.columnas.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    seccion.datos.filas.forEach(fila => {
      html += '<tr>';
      fila.forEach((celda, index) => {
        const esGriego = seccion.datos.columnas[index]?.toLowerCase().includes('mayúscula') ||
                        seccion.datos.columnas[index]?.toLowerCase().includes('minúscula') ||
                        seccion.datos.columnas[index]?.toLowerCase().includes('griego');

        if (esGriego) {
          html += `<td class="celda-griega" style="font-family: var(--fuente-griega); font-size: 1.1em; font-weight: 600;">${celda}</td>`;
        } else {
          html += `<td>${celda}</td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody>';

    html += '</table></div>';

    return html;
  }

  /**
   * Renderiza un ejercicio
   */
  renderizarEjercicio(ejercicio) {
    let html = '';

    // Crear el contenedor para el ejercicio
    html += `<div id="contenedor-ejercicio-${ejercicio.id}"></div>`;

    // Script para inicializar el ejercicio después de renderizar
    setTimeout(() => {
      this.inicializarEjercicio(ejercicio);
    }, 0);

    return html;
  }

  /**
   * Inicializa un ejercicio en el DOM
   */
  inicializarEjercicio(ejercicio) {
    const contenedor = document.getElementById(`contenedor-ejercicio-${ejercicio.id}`);
    if (!contenedor) return;

    let instancia;

    if (ejercicio.tipo === 'seleccion') {
      instancia = new EjercicioSeleccion(ejercicio, contenedor);
    } else if (ejercicio.tipo === 'completar') {
      instancia = new EjercicioCompletar(ejercicio, contenedor);
    } else {
      console.error(`Tipo de ejercicio desconocido: ${ejercicio.tipo}`);
      return;
    }

    instancia.renderizar();
  }

  /**
   * Renderiza botones de navegación
   */
  renderizarBotones() {
    const totalElementos = this.leccion.secciones.length + this.leccion.ejercicios.length;
    const hayAnterior = this.seccionActual > 0;
    const haySiguiente = this.seccionActual < totalElementos - 1;

    let html = '<div class="navagacion-leccion">';

    if (hayAnterior) {
      html += `
        <button class="boton fantasma boton-atras" id="btn-atras">
          ← Anterior
        </button>
      `;
    } else {
      html += '<div></div>';
    }

    if (haySiguiente) {
      html += `
        <button class="boton primario boton-siguiente" id="btn-siguiente">
          Siguiente →
        </button>
      `;
    } else {
      html += `
        <button class="boton exito boton-completar" id="btn-completar">
          ✓ Completar Lección
        </button>
      `;
    }

    html += '</div></div>';

    return html;
  }

  /**
   * Adjunta event listeners a botones
   */
  attachEventListeners() {
    const btnAtras = document.getElementById('btn-atras');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnCompletar = document.getElementById('btn-completar');

    if (btnAtras) {
      btnAtras.addEventListener('click', () => this.irAtras());
    }

    if (btnSiguiente) {
      btnSiguiente.addEventListener('click', () => this.irSiguiente());
    }

    if (btnCompletar) {
      btnCompletar.addEventListener('click', () => this.completarLeccion());
    }
  }

  /**
   * Navega a la sección anterior
   */
  irAtras() {
    if (this.seccionActual > 0) {
      this.seccionActual--;
      this.renderizar();
      window.scrollTo(0, 0);
    }
  }

  /**
   * Navega a la siguiente sección
   */
  irSiguiente() {
    const totalElementos = this.leccion.secciones.length + this.leccion.ejercicios.length;
    if (this.seccionActual < totalElementos - 1) {
      this.seccionActual++;
      this.renderizar();
      window.scrollTo(0, 0);
    }
  }

  /**
   * Completa la lección
   */
  completarLeccion() {
    const tiempo = Math.round((Date.now() - this.inicio) / 1000);
    const puntaje = 90; // Simplificado para MVP

    Progreso.marcarLeccionCompleta(
      `nivel-${this.leccion.nivel}`,
      this.leccion.id,
      puntaje
    );

    Eventos.emitir('leccion:completada', {
      leccionId: this.leccion.id,
      puntaje,
      tiempo,
      siguienteLeccion: this.leccion.siguienteLeccion
    });

    alert('¡Felicidades! Completaste la lección.');
    Router.navegar(`#/nivel/nivel-${this.leccion.nivel}`);
  }
}
