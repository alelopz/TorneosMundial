const ordenFases = {
    'dieciseisavos': 'octavos',
    'octavos': 'cuartos',
    'cuartos': 'semifinales',
    'semifinales': 'final'
};

function inicializarEliminatoria(equipos) {
    const cant = equipos.length;
    if (![4, 8, 16, 32].includes(cant)) {
        alert('Para Eliminación Directa necesitas exactamente 4, 8, 16 o 32 equipos.');
        changeScreen('screen-menu');
        return;
    }

    if (cant === 32) appState.tournament.faseActual = 'dieciseisavos';
    else if (cant === 16) appState.tournament.faseActual = 'octavos';
    else if (cant === 8) appState.tournament.faseActual = 'cuartos';
    else if (cant === 4) appState.tournament.faseActual = 'semifinales';

    // Para las fases finales que vienen desde grupos fijos, NO mezclamos de nuevo.
    // Usamos el orden exacto que calculó el fixture del mundial.
    const listaEquipos = [...equipos];

    appState.tournament.fases = {};
    appState.tournament.fases[appState.tournament.faseActual] = [];

    for (let i = 0; i < listaEquipos.length; i += 2) {
        appState.tournament.fases[appState.tournament.faseActual].push({
            id: i / 2,
            equipo1: listaEquipos[i],
            equipo2: listaEquipos[i + 1],
            goles1: null,
            goles2: null
        });
    }
    renderizarFaseEliminatoria();
}

function renderizarFaseEliminatoria() {
    const faseName = appState.tournament.faseActual;
    const partidos = appState.tournament.fases[faseName];
    const renderArea = document.getElementById('tournament-render-area');

    let htmlPartidos = "";
    partidos.forEach(p => {
        const g1 = p.goles1 !== null ? p.goles1 : "";
        const g2 = p.goles2 !== null ? p.goles2 : "";

        htmlPartidos += `
            <div class="match-card">
                <div class="match-team">
                    <span class="team-name">${p.equipo1}</span>
                    <input type="number" class="score-input" min="0" placeholder="0" value="${g1}" id="g1-${p.id}" onchange="guardarGolesEliminatoria(${p.id}, 1)">
                </div>
                <div class="match-vs">VS</div>
                <div class="match-team">
                    <span class="team-name">${p.equipo2}</span>
                    <input type="number" class="score-input" min="0" placeholder="0" value="${g2}" id="g2-${p.id}" onchange="guardarGolesEliminatoria(${p.id}, 2)">
                </div>
                ${appState.tournament.mode === 'ruleta' ?
                `<button class="btn-match-roulette" onclick="abrirRuletaEliminatoria(${p.id})"><i class="fa-solid fa-crosshairs"></i></button>` : ''
            }
            </div>
        `;
    });

    renderArea.innerHTML = `
        <div class="bracket-container">
            <h3 class="phase-title">${faseName.toUpperCase()}</h3>
            <div class="matches-list-bracket">${htmlPartidos}</div>
            <div class="center-btn-container">
                <button class="btn-nav btn-start" style="margin-top: 30px;" onclick="avanzarFaseEliminatoria()">AVANZAR DE FASE 🚀</button>
            </div>
        </div>
    `;
}

function guardarGolesEliminatoria(partidoId, nroEquipo) {
    const fase = appState.tournament.faseActual;
    const input = document.getElementById(`g${nroEquipo}-${partidoId}`);
    const valor = input.value !== "" ? parseInt(input.value) : null;
    if (nroEquipo === 1) appState.tournament.fases[fase][partidoId].goles1 = valor;
    else appState.tournament.fases[fase][partidoId].goles2 = valor;
}

function abrirRuletaEliminatoria(partidoId) {
    const fase = appState.tournament.faseActual;
    const partido = appState.tournament.fases[fase][partidoId];
    abrirRuletaGeneral(partido, partidoId, 'gatillarGiroRuletaEliminatoria()');
}

// ==========================================================================
// 🔥 GESTOR DE GIRO DE RULETA INTEGRADO CON TU ESTRUCTURA DE .FASES
// ==========================================================================
function gatillarGiroRuletaEliminatoria() {
    ejecutarAnimacionRuleta((gradosRandom) => {
        let golesLocal = 0, golesVisitante = 0;
        const anguloDetenido = gradosRandom % 360;
        const anguloReal = (270 - anguloDetenido + 360) % 360;

        // Si el ángulo apunta a la mitad derecha del círculo, la flecha señala al LOCAL (Cian)
        if (anguloReal < 180) {
            // --- GANA EL EQUIPO LOCAL (Equipo 1 - Ejemplo: Boca) ---
            golesLocal = Math.floor(Math.random() * 3) + 1; // De 1 a 3 goles
            golesVisitante = Math.floor(Math.random() * golesLocal); // Menos que el local

            alert(`🎯 ¡Ganó ${appState.ruletaActiva.equipo1}! (${golesLocal} - ${golesVisitante})`);
        }
        // Si apunta a la mitad izquierda del círculo, la flecha señala al VISITANTE (Fucsia)
        else {
            // --- GANA EL EQUIPO VISITANTE (Equipo 2 - Ejemplo: River) ---
            golesVisitante = Math.floor(Math.random() * 3) + 1;
            golesLocal = Math.floor(Math.random() * golesVisitante);

            alert(`🎯 ¡Ganó ${appState.ruletaActiva.equipo2}! (${golesLocal} - ${golesVisitante})`);
        }

        const fase = appState.tournament.faseActual;
        const pId = appState.ruletaActiva.partidoId;

        // GUARDADO EN TU ESTRUCTURA REAL (.fases)
        if (appState.tournament.fases && appState.tournament.fases[fase]) {
            const partido = appState.tournament.fases[fase][pId];
            if (partido) {
                partido.goles1 = golesLocal;
                partido.goles2 = golesVisitante;
            }
        }

        // CIERRE SEGURO DEL MODAL
        const modal = document.getElementById('roulette-modal');
        if (modal) {
            modal.classList.add('d-none');
        }

        // REDIBUJAR LA PANTALLA
        renderizarFaseEliminatoria();
    });
}

function avanzarFaseEliminatoria() {
    const faseActual = appState.tournament.faseActual;
    const partidosActuales = appState.tournament.fases[faseActual];

    const ganadores = [];
    for (let p of partidosActuales) {
        if (p.goles1 === null || p.goles2 === null) {
            alert("Quedan partidos sin jugar o sin anotar.");
            return;
        }
        if (p.goles1 === p.goles2) {
            alert(`¡Tiene que haber un ganador entre ${p.equipo1} y ${p.equipo2}!`);
            return;
        }
        ganadores.push(p.goles1 > p.goles2 ? p.equipo1 : p.equipo2);
    }

    if (faseActual === 'final') {
        alert(`🏆 ¡TENEMOS CAMPEÓN! El ganador es: ${ganadores[0].toUpperCase()}`);
        return;
    }

    const siguienteFase = ordenFases[faseActual];
    appState.tournament.faseActual = siguienteFase;
    appState.tournament.fases[siguienteFase] = [];

    for (let i = 0; i < ganadores.length; i += 2) {
        appState.tournament.fases[siguienteFase].push({
            id: i / 2,
            equipo1: ganadores[i],
            equipo2: ganadores[i + 1],
            goles1: null,
            goles2: null
        });
    }
    renderizarFaseEliminatoria();
}