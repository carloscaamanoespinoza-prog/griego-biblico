/**
 * CLASE BASE PARA EJERCICIOS
 * Define la interfaz común para todos los tipos de ejercicios
 */

class EjercicioBase {
  constructor(datos, contenedor) {
    this.datos = datos;
    this.contenedor = contenedor;
    this.intentos = 0;
    this.completado = false;
    this.respuestaUsuario = null;
    this.inicio = Date.now();
  }

  /**
   * Renderiza el ejercicio
   */
  renderizar() {
    const html = `
      <div class="ejercicio" id="ejercicio-${this.datos.id}">
        <div class="encabezado-ejercicio">
          <h3>${this.datos.titulo}</h3>
          <div class="puntaje">${this.datos.puntajeTotal || 0} puntos</div>
        </div>

        <div class="instrucciones">${this.datos.instrucciones}</div>

        <div class="cuerpo-ejercicio" id="cuerpo-${this.datos.id}">
          ${this.renderizarCuerpo()}
        </div>

        <div class="acciones">
          <button class="boton primario" id="verificar-${this.datos.id}">
            Verificar Respuesta
          </button>
          <button class="boton fantasma pequeño" id="pista-${this.datos.id}">
            Pista (${3 - this.intentos})
          </button>
        </div>

        <div id="resultado-${this.datos.id}"></div>
      </div>
    `;

    this.contenedor.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Renderiza el cuerpo del ejercicio (sobrescribir en subclases)
   */
  renderizarCuerpo() {
    throw new Error('renderizarCuerpo() debe ser implementado por subclases');
  }

  /**
   * Adjunta event listeners
   */
  attachEventListeners() {
    const btnVerificar = document.getElementById(`verificar-${this.datos.id}`);
    const btnPista = document.getElementById(`pista-${this.datos.id}`);

    if (btnVerificar) {
      btnVerificar.addEventListener('click', () => this.verificar());
    }

    if (btnPista) {
      btnPista.addEventListener('click', () => this.mostrarPista());
    }
  }

  /**
   * Obtiene la respuesta del usuario (sobrescribir en subclases)
   */
  obtenerRespuesta() {
    throw new Error('obtenerRespuesta() debe ser implementado por subclases');
  }

  /**
   * Verifica la respuesta
   */
  verificar() {
    this.intentos++;
    this.respuestaUsuario = this.obtenerRespuesta();

    if (!this.respuestaUsuario) {
      this.mostrarError('Por favor, proporciona una respuesta antes de verificar.');
      return;
    }

    const esCorrecta = this.validarRespuesta(this.respuestaUsuario);
    this.mostrarResultado(esCorrecta);

    if (esCorrecta) {
      this.completado = true;
      this.registrarComplecion();
    } else if (this.intentos >= 3) {
      this.mostrarRespuestaCorrecta();
    }
  }

  /**
   * Valida la respuesta (sobrescribir en subclases)
   */
  validarRespuesta(respuesta) {
    throw new Error('validarRespuesta() debe ser implementado por subclases');
  }

  /**
   * Muestra el resultado
   */
  mostrarResultado(esCorrecta) {
    const contenedor = document.getElementById(`resultado-${this.datos.id}`);
    const clase = esCorrecta ? 'correcto' : 'incorrecto';
    const mensaje = esCorrecta ? '✓ ¡Correcto!' : '✗ Incorrecto';

    contenedor.innerHTML = `
      <div class="resultado ${clase}">
        <div class="icono"></div>
        <h4>${mensaje}</h4>
        <div class="explicacion">${this.obtenerExplicacion()}</div>
      </div>
    `;

    if (esCorrecta) {
      setTimeout(() => {
        this.mostrarBotonSiguiente();
      }, 1000);
    }
  }

  /**
   * Obtiene la explicación de la respuesta (sobrescribir si es necesario)
   */
  obtenerExplicacion() {
    // Buscar la pregunta actual
    const pregunta = this.datos.preguntas[0]; // Simplificado para esta versión
    return pregunta ? pregunta.explicacion : '';
  }

  /**
   * Muestra la respuesta correcta después de 3 intentos
   */
  mostrarRespuestaCorrecta() {
    const contenedor = document.getElementById(`resultado-${this.datos.id}`);
    contenedor.innerHTML += `
      <div class="alerta advertencia">
        <h4 class="titulo">Respuesta Correcta</h4>
        <p class="descripcion">${this.datos.preguntas[0].respuestaCorrecta}</p>
      </div>
    `;
  }

  /**
   * Muestra una pista
   */
  mostrarPista() {
    if (this.intentos >= 3) {
      return;
    }

    const mensaje = `Intento ${this.intentos + 1} de 3. Piensa bien tu respuesta.`;
    alert(mensaje);
  }

  /**
   * Muestra un error
   */
  mostrarError(mensaje) {
    const contenedor = document.getElementById(`resultado-${this.datos.id}`);
    contenedor.innerHTML = `
      <div class="alerta error">
        <div class="titulo">Error</div>
        <p class="descripcion">${mensaje}</p>
      </div>
    `;
  }

  /**
   * Muestra el botón siguiente
   */
  mostrarBotonSiguiente() {
    const contenedor = document.getElementById(`resultado-${this.datos.id}`);
    const html = contenedor.innerHTML;

    contenedor.innerHTML = html + `
      <button class="boton exito bloque" onclick="location.hash='#/'">
        Siguiente Lección →
      </button>
    `;
  }

  /**
   * Registra la compleción del ejercicio
   */
  registrarComplecion() {
    const tiempo = Math.round((Date.now() - this.inicio) / 1000);
    const puntaje = this.datos.puntajeTotal || 100;

    Progreso.registrarEjercicio(true, puntaje);
    Eventos.emitir('ejercicio:completado', {
      id: this.datos.id,
      puntaje,
      intentos: this.intentos,
      tiempo
    });
  }
}
