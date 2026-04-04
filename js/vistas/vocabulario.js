/**
 * VISTA: VOCABULARIO
 * Tres pestañas: Lista (filtrable), Flashcards (CSS 3D), Práctica (ejercicios)
 */

const VistaVocabulario = (() => {
  'use strict';

  let vocabulario = [];
  let palabrasFiltradas = [];
  let indiceFlashcard = 0;
  let ejercicioActual = null;

  /**
   * Renderiza la vista de vocabulario
   */
  async function renderizar() {
    const contenedor = document.getElementById('vista-contenedor');
    contenedor.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Cargando vocabulario...</p></div>';

    try {
      vocabulario = await Utils.cargarJSON('datos/vocabulario/vocabulario-completo.json');
      palabrasFiltradas = [...vocabulario.palabras];

      const html = `
        <div class="vocabulario-contenedor">
          <div class="encabezado-vocabulario">
            <h1>📚 Vocabulario Griego</h1>
            <p>${vocabulario.total} palabras disponibles</p>
          </div>

          <div class="pestanas-vocabulario">
            <button class="pestana-boton activa" data-pestana="lista">
              <span class="icono">📖</span> Lista
            </button>
            <button class="pestana-boton" data-pestana="flashcards">
              <span class="icono">🎴</span> Flashcards
            </button>
            <button class="pestana-boton" data-pestana="practica">
              <span class="icono">✏️</span> Práctica
            </button>
          </div>

          <div class="contenido-pestanas">
            <div id="pestana-lista" class="pestana activa"></div>
            <div id="pestana-flashcards" class="pestana"></div>
            <div id="pestana-practica" class="pestana"></div>
          </div>
        </div>
      `;

      contenedor.innerHTML = html;
      configurarPestanas();
      renderizarLista();

      Navegacion.marcarRutaActiva('#/vocabulario');
    } catch (error) {
      Utils.error('Error en VistaVocabulario:', error);
      contenedor.innerHTML = `
        <div style="max-width: 800px; margin: 2rem auto;">
          <div class="alerta error">
            <h3>Error al cargar vocabulario</h3>
            <p>${error.message}</p>
          </div>
        </div>
      `;
    }
  }

  /**
   * Configura el comportamiento de las pestañas
   */
  function configurarPestanas() {
    const botones = document.querySelectorAll('.pestana-boton');
    botones.forEach(boton => {
      boton.addEventListener('click', () => {
        const pestana = boton.getAttribute('data-pestana');
        cambiarPestana(pestana);
      });
    });
  }

  /**
   * Cambia la pestaña activa
   */
  function cambiarPestana(nombre) {
    // Actualizar botones
    document.querySelectorAll('.pestana-boton').forEach(b => {
      b.classList.remove('activa');
    });
    document.querySelector(`[data-pestana="${nombre}"]`).classList.add('activa');

    // Actualizar contenido
    document.querySelectorAll('.pestana').forEach(p => {
      p.classList.remove('activa');
    });
    document.getElementById(`pestana-${nombre}`).classList.add('activa');

    // Renderizar la pestaña correspondiente
    if (nombre === 'lista') {
      renderizarLista();
    } else if (nombre === 'flashcards') {
      renderizarFlashcards();
    } else if (nombre === 'practica') {
      renderizarPractica();
    }
  }

  /**
   * PESTAÑA 1: LISTA
   */
  function renderizarLista() {
    const contenedor = document.getElementById('pestana-lista');
    const progreso = Progreso.obtenerProgreso();

    // Obtener categorías únicas
    const categorias = [...new Set(vocabulario.palabras.map(p => p.categoria))].sort();
    const frecuencias = ['Muy frecuente', 'Frecuente', 'Ocasional'];
    const niveles = ['nivel-1', 'nivel-2', 'nivel-3', 'nivel-4'];

    let html = `
      <div class="filtros-lista">
        <input type="text" id="busqueda-vocab" placeholder="Buscar palabra..." class="entrada">
        <select id="filtro-categoria" class="entrada">
          <option value="">Todas las categorías</option>
          ${categorias.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select id="filtro-frecuencia" class="entrada">
          <option value="">Todas las frecuencias</option>
          ${frecuencias.map(f => `<option value="${f}">${f}</option>`).join('')}
        </select>
        <select id="filtro-nivel" class="entrada">
          <option value="">Todos los niveles</option>
          ${niveles.map(n => `<option value="${n}">Nivel ${n.split('-')[1]}</option>`).join('')}
        </select>
      </div>

      <div class="grid-vocabulario" id="grid-vocab"></div>
    `;

    contenedor.innerHTML = html;

    // Configurar búsqueda con debounce
    const inputBusqueda = document.getElementById('busqueda-vocab');
    const selectCategoria = document.getElementById('filtro-categoria');
    const selectFrecuencia = document.getElementById('filtro-frecuencia');
    const selectNivel = document.getElementById('filtro-nivel');

    const actualizarLista = () => {
      const termino = inputBusqueda.value.toLowerCase();
      const categoria = selectCategoria.value;
      const frecuencia = selectFrecuencia.value;
      const nivel = selectNivel.value;

      palabrasFiltradas = vocabulario.palabras.filter(p => {
        const coincideTermino = p.griego.includes(termino) ||
                                p.transliteracion.toLowerCase().includes(termino) ||
                                p.definicion.toLowerCase().includes(termino);
        const coincideCategoria = !categoria || p.categoria === categoria;
        const coincideFrecuencia = !frecuencia || p.frecuencia === frecuencia;
        const coincideNivel = !nivel || p.nivelId === nivel;

        return coincideTermino && coincideCategoria && coincideFrecuencia && coincideNivel;
      });

      renderizarGridVocabulario(progreso);
    };

    inputBusqueda.addEventListener('input', debounce(actualizarLista, 300));
    selectCategoria.addEventListener('change', actualizarLista);
    selectFrecuencia.addEventListener('change', actualizarLista);
    selectNivel.addEventListener('change', actualizarLista);

    renderizarGridVocabulario(progreso);
  }

  /**
   * Renderiza el grid de palabras
   */
  function renderizarGridVocabulario(progreso) {
    const grid = document.getElementById('grid-vocab');
    const aprendidas = progreso.vocabulario?.aprendidas || [];

    let html = '';
    palabrasFiltradas.forEach(palabra => {
      const conocida = aprendidas.includes(palabra.griego);
      const claseMarcada = conocida ? 'aprendida' : '';

      html += `
        <div class="tarjeta-vocab ${claseMarcada}">
          <div class="palabra-vocab-grande">${palabra.griego}</div>
          <div class="palabra-vocab-detalle">
            <div class="trans">${palabra.transliteracion}</div>
            <div class="def">${palabra.definicion}</div>
          </div>
          <div class="badges">
            <span class="badge categoria">${palabra.categoria}</span>
            <span class="badge frecuencia">${palabra.frecuencia}</span>
            ${palabra.frecuenciaNT ? `<span class="badge nt">NT: ${palabra.frecuenciaNT}x</span>` : ''}
          </div>
          ${conocida ? '<div class="marca-aprendida">✓</div>' : ''}
        </div>
      `;
    });

    grid.innerHTML = html || '<p style="grid-column: 1/-1; text-align: center;">No hay palabras que coincidan con los filtros</p>';
  }

  /**
   * PESTAÑA 2: FLASHCARDS
   */
  function renderizarFlashcards() {
    const contenedor = document.getElementById('pestana-flashcards');
    palabrasFiltradas = [...vocabulario.palabras];
    indiceFlashcard = 0;

    let html = `
      <div class="controles-flashcard">
        <button class="boton primario" id="btn-mezclar">🔀 Mezclar</button>
      </div>
      <div id="area-flashcard"></div>
    `;

    contenedor.innerHTML = html;

    document.getElementById('btn-mezclar').addEventListener('click', () => {
      palabrasFiltradas = fisherYatesShuffle([...palabrasFiltradas]);
      indiceFlashcard = 0;
      mostrarFlashcard();
    });

    mostrarFlashcard();
  }

  /**
   * Muestra la tarjeta actual
   */
  function mostrarFlashcard() {
    if (indiceFlashcard >= palabrasFiltradas.length) {
      indiceFlashcard = 0;
    }

    const palabra = palabrasFiltradas[indiceFlashcard];
    const area = document.getElementById('area-flashcard');
    const progreso = Progreso.obtenerProgreso();

    area.innerHTML = '';

    const tarjeta = Flashcard.crear(
      palabra,
      indiceFlashcard,
      palabrasFiltradas.length,
      null, // No hacer nada al voltear
      (palabraVoltead) => {
        marcarComoConocida(palabraVoltead);
      }
    );

    area.appendChild(tarjeta);

    // Botones de navegación
    const controles = document.createElement('div');
    controles.className = 'controles-nav-flashcard';

    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'boton secundario';
    btnAnterior.textContent = '← Anterior';
    btnAnterior.addEventListener('click', () => {
      indiceFlashcard = (indiceFlashcard - 1 + palabrasFiltradas.length) % palabrasFiltradas.length;
      mostrarFlashcard();
    });

    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = 'boton secundario';
    btnSiguiente.textContent = 'Siguiente →';
    btnSiguiente.addEventListener('click', () => {
      indiceFlashcard = (indiceFlashcard + 1) % palabrasFiltradas.length;
      mostrarFlashcard();
    });

    controles.appendChild(btnAnterior);
    controles.appendChild(btnSiguiente);
    area.appendChild(controles);
  }

  /**
   * Marca una palabra como conocida
   */
  function marcarComoConocida(palabra) {
    const progreso = Progreso.obtenerProgreso();
    if (!progreso.vocabulario) progreso.vocabulario = {};
    if (!progreso.vocabulario.aprendidas) progreso.vocabulario.aprendidas = [];

    if (!progreso.vocabulario.aprendidas.includes(palabra.griego)) {
      progreso.vocabulario.aprendidas.push(palabra.griego);
      Progreso.guardarProgreso(progreso);

      // Avanzar a siguiente
      indiceFlashcard = (indiceFlashcard + 1) % palabrasFiltradas.length;
      mostrarFlashcard();
    }
  }

  /**
   * PESTAÑA 3: PRÁCTICA
   */
  function renderizarPractica() {
    const contenedor = document.getElementById('pestana-practica');
    palabrasFiltradas = [...vocabulario.palabras];

    if (palabrasFiltradas.length === 0) {
      contenedor.innerHTML = '<p>No hay palabras para practicar</p>';
      return;
    }

    // Generar ejercicio
    generarEjercicioPractica(contenedor);
  }

  /**
   * Genera un ejercicio dinámico de práctica
   */
  function generarEjercicioPractica(contenedor) {
    // Seleccionar palabra aleatoria
    const palabra = palabrasFiltradas[Math.floor(Math.random() * palabrasFiltradas.length)];

    // Seleccionar 3 palabras incorrectas aleatorias (distintas de la correcta)
    const incorrectas = vocabulario.palabras
      .filter(p => p.griego !== palabra.griego)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Generar opciones como array de textos
    const opcionesArray = [
      palabra.definicion,
      ...incorrectas.map(p => p.definicion)
    ].sort(() => Math.random() - 0.5);

    // Encontrar índice de la respuesta correcta
    const respuestaCorrecta = opcionesArray.indexOf(palabra.definicion);

    // Crear estructura de datos esperada por EjercicioSeleccion
    const datos = {
      id: 'practica-vocab',
      tipo: 'seleccion',
      preguntas: [
        {
          pregunta: `¿Cuál es la definición de <em>${palabra.griego}</em>?`,
          estimulo: palabra.griego,
          opciones: opcionesArray,
          respuestaCorrecta: respuestaCorrecta,
          explicacion: `<strong>${palabra.griego}</strong> (${palabra.transliteracion}) significa: <em>${palabra.definicion}</em>`
        }
      ]
    };

    contenedor.innerHTML = '';

    ejercicioActual = new EjercicioSeleccion(datos, {
      onCompleted: (resultado) => {
        if (resultado.correcta) {
          // Agregar puntos si es correcto
          const progreso = Progreso.obtenerProgreso();
          progreso.usuario.puntosTotales = (progreso.usuario.puntosTotales || 0) + 10;
          Progreso.guardarProgreso(progreso);
          Navegacion.actualizarProgreso();
        }

        // Mostrar botón siguiente
        const btnSiguiente = document.createElement('button');
        btnSiguiente.className = 'boton primario';
        btnSiguiente.textContent = 'Siguiente pregunta';
        btnSiguiente.style.marginTop = '2rem';
        btnSiguiente.addEventListener('click', () => generarEjercicioPractica(contenedor));

        contenedor.appendChild(btnSiguiente);
      }
    });

    ejercicioActual.renderizar(contenedor);
  }

  /**
   * Utilidades
   */

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function fisherYatesShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // API pública
  return { renderizar };
})();
