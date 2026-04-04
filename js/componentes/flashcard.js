/**
 * FLASHCARD
 * Componente de tarjeta volteada con animación CSS 3D
 */

const Flashcard = (() => {
  'use strict';

  /**
   * Crea una tarjeta individual
   * @param {Object} palabra - Objeto palabra con griego, transliteracion, definicion, etc.
   * @param {number} indice - Índice actual en la lista
   * @param {number} total - Total de palabras
   * @param {Function} alVoltearse - Callback cuando se voltea (recibe true=reverso)
   * @param {Function} alMarcarConocida - Callback cuando marca como conocida
   * @returns {HTMLElement} Elemento de tarjeta
   */
  function crear(palabra, indice, total, alVoltearse, alMarcarConocida) {
    const contenedor = document.createElement('div');
    contenedor.className = 'flashcard-contenedor';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'flashcard';
    tarjeta.setAttribute('role', 'region');
    tarjeta.setAttribute('aria-label', `Tarjeta ${indice + 1} de ${total}`);

    // Frente: palabra griega
    const frente = document.createElement('div');
    frente.className = 'flashcard-frente';
    frente.innerHTML = `
      <div class="palabra-grande">${palabra.griego}</div>
      <p class="indicador-lado">Pulsa para voltear</p>
    `;

    // Reverso: transliteración, definición, ejemplo
    const reverso = document.createElement('div');
    reverso.className = 'flashcard-reverso';
    reverso.innerHTML = `
      <div class="transliteracion">${palabra.transliteracion}</div>
      <div class="definicion">${palabra.definicion}</div>
      <div class="ejemplo">
        <em>${palabra.ejemplo}</em>
      </div>
      <p class="indicador-lado">Pulsa para voltear</p>
    `;

    tarjeta.appendChild(frente);
    tarjeta.appendChild(reverso);

    // Event listener para voltear
    tarjeta.addEventListener('click', () => {
      tarjeta.classList.toggle('volteada');
      const volteada = tarjeta.classList.contains('volteada');
      if (alVoltearse) alVoltearse(volteada);
    });

    // Permitir voltear con tecla espaciadora si la tarjeta tiene focus
    tarjeta.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        tarjeta.click();
      }
    });

    tarjeta.setAttribute('tabindex', '0');

    // Botón: ¿La sabía?
    const botonSabia = document.createElement('button');
    botonSabia.className = 'boton secundo pequeno';
    botonSabia.innerHTML = '✓ La sabía';
    botonSabia.addEventListener('click', (e) => {
      e.stopPropagation(); // No voltear la tarjeta
      if (alMarcarConocida) alMarcarConocida(palabra);
    });

    // Botón: Frecuencia
    const botonFrec = document.createElement('button');
    botonFrec.className = 'boton-info pequeno';
    botonFrec.innerHTML = `📊 Frecuencia NT: ${palabra.frecuenciaNT || '?'}`;
    botonFrec.disabled = true;

    // Barra de progreso
    const barra = document.createElement('div');
    barra.className = 'barra-progreso-flashcard';
    barra.innerHTML = `
      <div class="progreso" style="width: ${Math.round((indice / total) * 100)}%"></div>
      <span class="texto-progreso">${indice + 1}/${total}</span>
    `;

    contenedor.appendChild(tarjeta);
    contenedor.appendChild(botonSabia);
    contenedor.appendChild(botonFrec);
    contenedor.appendChild(barra);

    return contenedor;
  }

  /**
   * Genera el HTML de estilos CSS 3D (para inyectar en <style> si es necesario)
   * @returns {string} CSS para flashcards
   */
  function obtenerCSS() {
    return `
      /* FLASHCARD - Animación CSS 3D */
      .flashcard-contenedor {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }

      .flashcard {
        position: relative;
        width: 100%;
        max-width: 400px;
        height: 300px;
        cursor: pointer;
        perspective: 1000px;
        background: transparent;
        border: none;
        padding: 0;
      }

      .flashcard-frente,
      .flashcard-reverso {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        border-radius: var(--radio-borde, 8px);
        transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .flashcard-frente {
        background: linear-gradient(135deg, var(--color-primario, #2C5F8A), var(--color-secundario, #C9973D));
        color: white;
        transform: rotateY(0deg);
      }

      .flashcard-reverso {
        background: linear-gradient(135deg, var(--color-acento, #6B4E9E), var(--color-primario, #2C5F8A));
        color: white;
        transform: rotateY(180deg);
        text-align: center;
      }

      .flashcard.volteada .flashcard-frente {
        transform: rotateY(-180deg);
      }

      .flashcard.volteada .flashcard-reverso {
        transform: rotateY(0deg);
      }

      .palabra-grande {
        font-size: 4rem;
        font-weight: 600;
        font-family: var(--fuente-griega, 'Noto Serif');
        line-height: 1.2;
        margin: 0;
      }

      .transliteracion {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .definicion {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        line-height: 1.4;
      }

      .ejemplo {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 0.5rem;
        max-width: 90%;
      }

      .indicador-lado {
        font-size: 0.9rem;
        margin-top: auto;
        opacity: 0.8;
        font-style: italic;
      }

      .barra-progreso-flashcard {
        width: 100%;
        max-width: 400px;
        height: 8px;
        background: var(--color-fondo, #F8F6F0);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }

      .barra-progreso-flashcard .progreso {
        height: 100%;
        background: var(--color-secundario, #C9973D);
        transition: width 0.3s ease;
      }

      .barra-progreso-flashcard .texto-progreso {
        position: absolute;
        top: -20px;
        right: 0;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--color-primario, #2C5F8A);
      }

      .boton-info.pequeno {
        background: var(--color-fondo, #F8F6F0);
        color: var(--color-primario, #2C5F8A);
        border: 1px solid var(--color-primario, #2C5F8A);
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        cursor: default;
        opacity: 0.7;
      }

      /* Responsive */
      @media (max-width: 640px) {
        .flashcard {
          height: 250px;
          max-width: 100%;
        }

        .palabra-grande {
          font-size: 3rem;
        }

        .transliteracion {
          font-size: 1.2rem;
        }

        .definicion {
          font-size: 1rem;
        }
      }
    `;
  }

  // API pública
  return {
    crear,
    obtenerCSS
  };
})();
