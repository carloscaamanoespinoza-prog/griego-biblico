/**
 * EJERCICIO: IDENTIFICAR LETRA GRIEGA
 * Bidireccional y aleatorio
 * - A veces: muestra letra griega → selecciona nombre
 * - A veces: muestra nombre → selecciona letra griega
 * - Cubre las 24 letras del alfabeto
 */

class EjercicioIdentificarLetra extends EjercicioBase {
  static ALFABETO = [
    { letra: 'α', mayuscula: 'Α', nombre: 'alfa' },
    { letra: 'β', mayuscula: 'Β', nombre: 'beta' },
    { letra: 'γ', mayuscula: 'Γ', nombre: 'gamma' },
    { letra: 'δ', mayuscula: 'Δ', nombre: 'delta' },
    { letra: 'ε', mayuscula: 'Ε', nombre: 'épsilon' },
    { letra: 'ζ', mayuscula: 'Ζ', nombre: 'zeta' },
    { letra: 'η', mayuscula: 'Η', nombre: 'eta' },
    { letra: 'θ', mayuscula: 'Θ', nombre: 'theta' },
    { letra: 'ι', mayuscula: 'Ι', nombre: 'iota' },
    { letra: 'κ', mayuscula: 'Κ', nombre: 'kapa' },
    { letra: 'λ', mayuscula: 'Λ', nombre: 'lambda' },
    { letra: 'μ', mayuscula: 'Μ', nombre: 'mu' },
    { letra: 'ν', mayuscula: 'Ν', nombre: 'nu' },
    { letra: 'ξ', mayuscula: 'Ξ', nombre: 'xi' },
    { letra: 'ο', mayuscula: 'Ο', nombre: 'ómicron' },
    { letra: 'π', mayuscula: 'Π', nombre: 'pi' },
    { letra: 'ρ', mayuscula: 'Ρ', nombre: 'ro' },
    { letra: 'σ', mayuscula: 'Σ', nombre: 'sigma' },
    { letra: 'τ', mayuscula: 'Τ', nombre: 'tau' },
    { letra: 'υ', mayuscula: 'Υ', nombre: 'úpsilon' },
    { letra: 'φ', mayuscula: 'Φ', nombre: 'fi' },
    { letra: 'χ', mayuscula: 'Χ', nombre: 'ji' },
    { letra: 'ψ', mayuscula: 'Ψ', nombre: 'psi' },
    { letra: 'ω', mayuscula: 'Ω', nombre: 'omega' }
  ];

  constructor(datos, contenedor) {
    super(datos, contenedor);
    this.preguntaActual = 0;
    this.numPreguntas = datos.numPreguntas || 8;
    this._generarPregunta();
  }

  /**
   * Genera una pregunta aleatoria
   */
  _generarPregunta() {
    const alfabeto = EjercicioIdentificarLetra.ALFABETO;

    // Elegir letra aleatoria
    const idxLetra = Math.floor(Math.random() * alfabeto.length);
    this._letraActual = alfabeto[idxLetra];

    // Elegir modo (50/50)
    this._modoNombreALetra = Math.random() < 0.5;

    // Elegir 3 distractores aleatorios (distintos a la correcta)
    const otros = alfabeto.filter((_, i) => i !== idxLetra);
    const distractores = this._shuffle(otros).slice(0, 3);

    if (this._modoNombreALetra) {
      // Modo B: Muestra nombre → selecciona letra griega
      this._estimulo = this._letraActual.nombre;
      this._respuestaCorrecta = this._letraActual.letra;
      const opciones = [this._letraActual.letra, ...distractores.map(d => d.letra)];
      this._opciones = this._shuffle(opciones);
      this._esLetraEnOpciones = true; // Las opciones son letras griegas (font grande)
    } else {
      // Modo A: Muestra letra griega → selecciona nombre
      this._estimulo = this._letraActual.letra;
      this._respuestaCorrecta = this._letraActual.nombre;
      const opciones = [this._letraActual.nombre, ...distractores.map(d => d.nombre)];
      this._opciones = this._shuffle(opciones);
      this._esLetraEnOpciones = false; // Las opciones son nombres
    }
  }

  /**
   * Fisher-Yates shuffle
   */
  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  renderizarCuerpo() {
    // Clase CSS para el estimulo dependiendo del modo
    const claseEstimulo = this._modoNombreALetra ? 'estimulo-nombre' : 'estimulo-letra';

    // Tamaño del estimulo: más grande si es letra
    const estiloEstimulo = this._modoNombreALetra
      ? 'font-size: 2rem; font-weight: 600;'
      : 'font-family: var(--fuente-griega); font-size: 5rem;';

    let html = `
      <div class="ejercicio-seleccion">
        <div class="estimulo ${claseEstimulo}" style="${estiloEstimulo}">${this._estimulo}</div>
        <div class="opciones">
    `;

    this._opciones.forEach((opcion, index) => {
      const idOpcion = `opcion-${this.datos.id}-${index}`;
      let estiloOpcion = '';

      // Si las opciones son letras griegas, hacerlas más grandes
      if (this._esLetraEnOpciones) {
        estiloOpcion = 'style="font-family: var(--fuente-griega); font-size: 1.8rem;"';
      }

      html += `
        <label class="opcion">
          <input
            type="radio"
            name="respuesta-${this.datos.id}"
            value="${opcion}"
            id="${idOpcion}"
          />
          <span class="label" ${estiloOpcion}>${opcion}</span>
        </label>
      `;
    });

    html += `</div></div>`;

    // Mostrar progreso
    html += `
      <div style="margin-top: 1rem; text-align: center; color: var(--color-texto-suave);">
        Pregunta ${this.preguntaActual + 1} de ${this.numPreguntas}
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
    return respuesta === this._respuestaCorrecta;
  }

  obtenerExplicacion() {
    const { letra, nombre } = this._letraActual;
    return `✓ Correcto. La letra <strong style="font-family: var(--fuente-griega); font-size: 1.5em;">${letra}</strong> se llama <strong>${nombre}</strong>.`;
  }

  mostrarResultado(esCorrecta) {
    super.mostrarResultado(esCorrecta);

    if (esCorrecta && this.preguntaActual < this.numPreguntas - 1) {
      // Hay más preguntas
      setTimeout(() => {
        this.preguntaActual++;
        this._generarPregunta();
        this.renderizar();
      }, 2000);
    }
  }
}
