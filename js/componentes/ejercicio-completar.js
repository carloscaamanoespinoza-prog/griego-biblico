/**
 * EJERCICIO TIPO COMPLETAR TEXTO
 */

class EjercicioCompletar extends EjercicioBase {
  constructor(datos, contenedor) {
    super(datos, contenedor);
    this.preguntaActual = 0;
  }

  renderizarCuerpo() {
    const pregunta = this.datos.preguntas[this.preguntaActual];
    let html = '<div class="ejercicio-completar">';

    if (pregunta.estimulo) {
      html += `
        <div style="margin-bottom: 1.5rem;">
          <label style="font-weight: 600; color: var(--color-primario);">
            ${pregunta.estimulo}
          </label>
          <input
            type="text"
            id="respuesta-${this.datos.id}"
            class="respuesta-input"
            placeholder="Tu respuesta aquí"
            style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid var(--color-borde); border-radius: 4px;"
            autofocus
          />
        </div>
      `;
    }

    html += '</div>';

    // Mostrar progreso
    html += `
      <div style="margin-top: 1rem; text-align: center; color: var(--color-texto-suave);">
        Pregunta ${this.preguntaActual + 1} de ${this.datos.preguntas.length}
      </div>
    `;

    return html;
  }

  obtenerRespuesta() {
    const input = document.getElementById(`respuesta-${this.datos.id}`);
    return input ? input.value.trim() : null;
  }

  validarRespuesta(respuesta) {
    const pregunta = this.datos.preguntas[this.preguntaActual];

    // Normalizar ambas respuestas para comparación
    const respuestaNormalizada = Utils.normalizarGriego(respuesta);
    const correctaNormalizada = Utils.normalizarGriego(pregunta.respuestaCorrecta);

    return respuestaNormalizada === correctaNormalizada;
  }

  obtenerExplicacion() {
    const pregunta = this.datos.preguntas[this.preguntaActual];
    return pregunta.explicacion;
  }

  mostrarResultado(esCorrecta) {
    super.mostrarResultado(esCorrecta);

    if (esCorrecta && this.preguntaActual < this.datos.preguntas.length - 1) {
      setTimeout(() => {
        this.preguntaActual++;
        this.renderizar();
      }, 2000);
    }
  }
}
