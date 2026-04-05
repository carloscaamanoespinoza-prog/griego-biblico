/**
 * EJERCICIO TIPO TRADUCCIÓN (OPCIÓN MÚLTIPLE)
 * Muestra una palabra/frase griega y 3 opciones de traducción al español
 */

class EjercicioTraduccion extends EjercicioBase {
  constructor(datos, contenedor) {
    super(datos, contenedor);
    this.preguntaActual = 0;
  }

  renderizarCuerpo() {
    const pregunta = this.datos.preguntas[this.preguntaActual];
    let html = '';

    // Estímulo (texto griego)
    if (pregunta.estimulo) {
      html += `
        <div class="ejercicio-traduccion">
          <div class="estimulo-griego">${pregunta.estimulo}</div>
      `;
    } else {
      html += '<div class="ejercicio-traduccion">';
    }

    // Instrucción
    html += '<div class="instruccion-traduccion">¿Cuál es la traducción correcta?</div>';

    // Opciones
    html += '<div class="opciones-traduccion">';
    pregunta.opciones.forEach((opcion, index) => {
      const idOpcion = `opcion-${this.datos.id}-${index}`;
      html += `
        <label class="opcion-traduccion">
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

    // Manejo de respuestas alternativas (separadas por "/")
    if (pregunta.respuestaCorrecta.includes('/')) {
      const alternativas = pregunta.respuestaCorrecta
        .split('/')
        .map(alt => alt.trim().toLowerCase());
      return alternativas.includes(respuesta.toLowerCase());
    }

    return respuesta.toLowerCase() === pregunta.respuestaCorrecta.toLowerCase();
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
