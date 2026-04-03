/**
 * EJERCICIO TIPO SELECCIÓN MÚLTIPLE
 */

class EjercicioSeleccion extends EjercicioBase {
  constructor(datos, contenedor) {
    super(datos, contenedor);
    this.preguntaActual = 0;
  }

  renderizarCuerpo() {
    const pregunta = this.datos.preguntas[this.preguntaActual];
    let html = '';

    // Si hay un estímulo visual (letra griega, palabra, etc)
    if (pregunta.estimulo) {
      html += `
        <div class="ejercicio-seleccion">
          <div class="estimulo">${pregunta.estimulo}</div>
      `;
    } else {
      html += '<div class="ejercicio-seleccion">';
    }

    // Opciones
    html += '<div class="opciones">';
    pregunta.opciones.forEach((opcion, index) => {
      const idOpcion = `opcion-${this.datos.id}-${index}`;
      html += `
        <label class="opcion">
          <input
            type="radio"
            name="respuesta-${this.datos.id}"
            value="${opcion}"
            id="${idOpcion}"
          />
          <span class="label">${opcion}</span>
        </label>
      `;
    });

    html += '</div></div>';

    // Mostrar progreso
    html += `
      <div style="margin-top: 1rem; text-align: center; color: var(--color-texto-suave);">
        Pregunta ${this.preguntaActual + 1} de ${this.datos.preguntas.length}
      </div>
    `;

    return html;
  }

  obtenerRespuesta() {
    const radio = document.querySelector(
      `input[name="respuesta-${this.datos.id}"]:checked`
    );
    return radio ? radio.value : null;
  }

  validarRespuesta(respuesta) {
    const pregunta = this.datos.preguntas[this.preguntaActual];
    return respuesta === pregunta.respuestaCorrecta;
  }

  obtenerExplicacion() {
    const pregunta = this.datos.preguntas[this.preguntaActual];
    return pregunta.explicacion;
  }

  mostrarResultado(esCorrecta) {
    super.mostrarResultado(esCorrecta);

    if (esCorrecta && this.preguntaActual < this.datos.preguntas.length - 1) {
      // Hay más preguntas
      setTimeout(() => {
        this.preguntaActual++;
        this.renderizar();
      }, 2000);
    }
  }
}
