// ==========================================================================
// MÓDULO: GRUPOS IDA Y VUELTA (ESTILO CHAMPIONS - 6 FECHAS con EMPATE)
// ==========================================================================

function inicializarGruposIdaVuelta(equipos) {
    if (equipos.length < 4 || equipos.length % 4 !== 0) {
        alert(`Para armar grupos de 4 necesitas una cantidad de equipos múltiplo de 4 (Ej: 4, 8, 12, 16). Tenés ${equipos.length}.`);
        return;
    }

    appState.tournament.grupos = {};
    appState.tournament.faseActual = 'fecha-1';

    // 1. Sorteo de equipos al azar
    let listaSorteada = [...equipos].sort(() => Math.random() - 0.5);
    const cantidadGrupos = listaSorteada.length / 4;

    // 2. Creamos los grupos y su fixture de 6 fechas (Ida y Vuelta)
    for (let i = 0; i < cantidadGrupos; i++) {
        const letraGrupo = String.fromCharCode(65 + i);
        appState.tournament.grupos[letraGrupo] = {
            equipos: listaSorteada.slice(i * 4, (i * 4) + 4),
            partidos: {
                'fecha-1': [], 'fecha-2': [], 'fecha-3': [],
                'fecha-4': [], 'fecha-5': [], 'fecha-6': []
            }
        };

        const eq = appState.tournament.grupos[letraGrupo].equipos;

        // --- PRIMERA VUELTA (IDA) ---
        // Fecha 1: 1 vs 4, 2 vs 3
        appState.tournament.grupos[letraGrupo].partidos['fecha-1'].push({ id: `GIV-${letraGrupo}-1-1`, equipo1: eq[0], equipo2: eq[3], goles1: null, goles2: null });
        appState.tournament.grupos[letraGrupo].partidos['fecha-1'].push({ id: `GIV-${letraGrupo}-1-2`, equipo1: eq[1], equipo2: eq[2], goles1: null, goles2: null });

        // Fecha 2: 1 vs 3, 4 vs 2
        appState.tournament.grupos[letraGrupo].partidos['fecha-2'].push({ id: `GIV-${letraGrupo}-2-1`, equipo1: eq[0], equipo2: eq[2], goles1: null, goles2: null });
        appState.tournament.grupos[letraGrupo].partidos['fecha-2'].push({ id: `GIV-${letraGrupo}-2-2`, equipo1: eq[3], equipo2: eq[1], goles1: null, goles2: null });

        // Fecha 3: 1 vs 2, 3 vs 4
        appState.tournament.grupos[letraGrupo].partidos['fecha-3'].push({ id: `GIV-${letraGrupo}-3-1`, equipo1: eq[0], equipo2: eq[1], goles1: null, goles2: null });
        appState.tournament.grupos[letraGrupo].partidos['fecha-3'].push({ id: `GIV-${letraGrupo}-3-2`, equipo1: eq[2], equipo2: eq[3], goles1: null, goles2: null });

        // --- SEGUNDA VUELTA (VUELTA - LOCALÍAS INVERTIDAS) ---
        // Fecha 4: 4 vs 1, 3 vs 2
        appState.tournament.grupos[letraGrupo].partidos['fecha-4'].push({ id: `GIV-${letraGrupo}-4-1`, equipo1: eq[3], equipo2: eq[0], goles1: null, goles2: null });
        appState.tournament.grupos[letraGrupo].partidos['fecha-4'].push({ id: `GIV-${letraGrupo}-4-2`, equipo1: eq[2], equipo2: eq[1], goles1: null, goles2: null });

        // Fecha 5: 3 vs 1, 2 vs 4 (Arreglado bug tipográfico de eq[4] a eq[3])
        appState.tournament.grupos[letraGrupo].partidos['fecha-5'].push({ id: `GIV-${letraGrupo}-5-1`, equipo1: eq[2], equipo2: eq[0], goles1: null, goles2: null });
        appState.tournament.grupos[letraGrupo].partidos['fecha-5'].push({ id: `GIV-${letraGrupo}-5-2`, equipo1: eq[1], equipo2: eq[3], goles1: null, goles2: null });

        // Fecha 6: 2 vs 1, 4 vs 3
        appState.tournament.grupos[letraGrupo].partidos['fecha-6'].push({ id: `GIV-${letraGrupo}-6-1`, equipo1: eq[1], equipo2: eq[0], goles1: null, goles2: null });
        appState.tournament.grupos[letraGrupo].partidos['fecha-6'].push({ id: `GIV-${letraGrupo}-6-2`, equipo1: eq[3], equipo2: eq[2], goles1: null, goles2: null });
    }

    renderizarGruposIdaVuelta();
}

function calcularTablasGruposIdaVuelta() {
    const tablas = {};

    Object.keys(appState.tournament.grupos).forEach(letra => {
        tablas[letra] = {};
        appState.tournament.grupos[letra].equipos.forEach(t => {
            tablas[letra][t] = { nombre: t, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, df: 0 };
        });

        const partidosGrupo = appState.tournament.grupos[letra].partidos;
        Object.keys(partidosGrupo).forEach(fechaKey => {
            partidosGrupo[fechaKey].forEach(p => {
                if (p.goles1 !== null && p.goles2 !== null) {
                    const eq1 = p.equipo1; const eq2 = p.equipo2;
                    tablas[letra][eq1].pj++; tablas[letra][eq2].pj++;
                    tablas[letra][eq1].gf += p.goles1; tablas[letra][eq1].gc += p.goles2;
                    tablas[letra][eq2].gf += p.goles2; tablas[letra][eq2].gc += p.goles1;

                    if (p.goles1 > p.goles2) {
                        tablas[letra][eq1].pts += 3; tablas[letra][eq1].pg++; tablas[letra][eq2].pp++;
                    } else if (p.goles1 < p.goles2) {
                        tablas[letra][eq2].pts += 3; tablas[letra][eq2].pg++; tablas[letra][eq1].pp++;
                    } else {
                        tablas[letra][eq1].pts += 1; tablas[letra][eq1].pe++; tablas[letra][eq2].pts += 1; tablas[letra][eq2].pe++;
                    }
                    tablas[letra][eq1].df = tablas[letra][eq1].gf - tablas[letra][eq1].gc;
                    tablas[letra][eq2].df = tablas[letra][eq2].gf - tablas[letra][eq2].gc;
                }
            });
        });
    });

    const tablasOrdenadas = {};
    Object.keys(tablas).forEach(letra => {
        tablasOrdenadas[letra] = Object.values(tablas[letra]).sort((a, b) => b.pts - a.pts || b.df - a.df || b.gf - a.gf);
    });

    return tablasOrdenadas;
}

function renderizarGruposIdaVuelta() {
    const renderArea = document.getElementById('tournament-render-area');
    const fechaName = appState.tournament.faseActual;
    const nroFecha = parseInt(fechaName.split('-')[1]);
    const tablas = calcularTablasGruposIdaVuelta();

    let html = `
        <div class="fecha-nav-header" style="margin-bottom: 25px;">
            <button class="btn-select" ${nroFecha === 1 ? 'disabled' : ''} onclick="cambiarFechaGruposIdaVuelta(${nroFecha - 1})"><i class="fa-solid fa-chevron-left"></i></button>
            <h3>Fase de Grupos: ${fechaName.toUpperCase().replace('-', ' ')}</h3>
            <button class="btn-select" ${nroFecha === 6 ? 'disabled' : ''} onclick="cambiarFechaGruposIdaVuelta(${nroFecha + 1})"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div class="grupos-grid-container">
    `;

    Object.keys(appState.tournament.grupos).forEach(letra => {
        const partidosFecha = appState.tournament.grupos[letra].partidos[fechaName];

        let htmlPartidos = "";
        partidosFecha.forEach(p => {
            const g1 = p.goles1 !== null ? p.goles1 : "";
            const g2 = p.goles2 !== null ? p.goles2 : "";

            htmlPartidos += `
                <div class="match-card">
                    <div class="match-team">
                        <span class="team-name">${p.equipo1}</span>
                        <input type="number" class="score-input" min="0" placeholder="0" value="${g1}" id="g1-${p.id}" onchange="guardarGolesGruposIdaVuelta('${letra}', '${p.id}', 1)">
                    </div>
                    <div class="match-vs">VS</div>
                    <div class="match-team">
                        <span class="team-name">${p.equipo2}</span>
                        <input type="number" class="score-input" min="0" placeholder="0" value="${g2}" id="g2-${p.id}" onchange="guardarGolesGruposIdaVuelta('${letra}', '${p.id}', 2)">
                    </div>
                    ${appState.tournament.mode === 'ruleta' ?
                    `<button class="btn-match-roulette" onclick="abrirRuletaGruposIdaVuelta('${letra}', '${p.id}')"><i class="fa-solid fa-crosshairs"></i></button>` : ''
                }
                </div>
            `;
        });

        let htmlTabla = `
            <table class="liga-table">
                <thead>
                    <tr><th>#</th><th style="text-align:left;">Equipo</th><th>PTS</th><th>PJ</th><th>DF</th></tr>
                </thead>
                <tbody>
        `;
        tablas[letra].forEach((pos, idx) => {
            const clasifica = idx < 2 ? 'leader-row' : '';
            htmlTabla += `
                <tr class="${clasifica}">
                    <td><strong>${idx + 1}</strong></td>
                    <td style="text-align:left; font-weight:600;">${pos.nombre}</td>
                    <td class="txt-cyan">${pos.pts}</td>
                    <td>${pos.pj}</td>
                    <td class="${pos.df > 0 ? 'txt-pink' : ''}">${pos.df}</td>
                </tr>
            `;
        });
        htmlTabla += `</tbody></table>`;

        html += `
            <div class="grupo-block-card" style="background: #11121a; border: 1px solid #222533; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <h2 style="color: #00f2fe; margin-bottom: 15px; border-bottom: 1px solid #222533; padding-bottom: 5px;">GRUPO ${letra}</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
                    <div><h4 style="margin-bottom: 10px; color: #fff;">Partidos</h4>${htmlPartidos}</div>
                    <div><h4 style="margin-bottom: 10px; color: #fff;">Posiciones</h4>${htmlTabla}</div>
                </div>
            </div>
        `;
    });

    html += `</div>`;

    // 🔥 SI ESTAMOS EN LA FECHA 6, INYECTAMOS EL BOTÓN DE NAVEGACIÓN HACIA LAS FINALES
    if (nroFecha === 6) {
        html += `
            <div class="center-btn-container" style="text-align: center; margin-top: 30px; margin-bottom: 50px;">
                <button class="btn-nav btn-start" onclick="avanzarAFAseFinalIdaVuelta()">AVANZAR A FASES FINALES 🚀</button>
            </div>
        `;
    }

    renderArea.innerHTML = html;
}

function guardarGolesGruposIdaVuelta(letraGrupo, partidoId, nroEquipo) {
    const input = document.getElementById(`g${nroEquipo}-${partidoId}`);
    const valor = input.value !== "" ? parseInt(input.value) : null;
    const fecha = appState.tournament.faseActual;

    const partidos = appState.tournament.grupos[letraGrupo].partidos[fecha];
    const idx = partidos.findIndex(x => x.id === partidoId);

    if (nroEquipo === 1) partidos[idx].goles1 = valor;
    else partidos[idx].goles2 = valor;

    renderizarGruposIdaVuelta();
}

function cambiarFechaGruposIdaVuelta(nuevaFechaNro) {
    appState.tournament.faseActual = `fecha-${nuevaFechaNro}`;
    renderizarGruposIdaVuelta();
}

function abrirRuletaGruposIdaVuelta(letraGrupo, partidoId) {
    const fecha = appState.tournament.faseActual;
    const partidos = appState.tournament.grupos[letraGrupo].partidos[fecha];
    const partido = partidos.find(x => x.id === partidoId);

    appState.ruletaActiva.partidoId = partidoId;
    appState.ruletaActiva.letraGrupo = letraGrupo;
    appState.ruletaActiva.equipo1 = partido.equipo1;
    appState.ruletaActiva.equipo2 = partido.equipo2;

    // IMPORTANTE: Pasamos true para dibujar el modo LIGA con la porción de EMPATE (40/40/20)
    dibujarRuletaCanvas(partido.equipo1, partido.equipo2, true);

    document.getElementById('btn-spin-trigger').setAttribute('onclick', 'gatillarGiroRuletaGruposIdaVuelta()');
    document.getElementById('roulette-modal').classList.remove('d-none');
}

function gatillarGiroRuletaGruposIdaVuelta() {
    ejecutarAnimacionRuleta((gradosRandom) => {
        let golesLocal = 0, golesVisitante = 0;
        const anguloDetenido = gradosRandom % 360;
        const anguloReal = (270 - anguloDetenido + 360) % 360;

        // MATEMÁTICA CORREGIDA DE LIGA DE 3 SECCIONES
        if (anguloReal < 144) {
            golesLocal = Math.floor(Math.random() * 3) + 1;
            golesVisitante = Math.floor(Math.random() * golesLocal);
            alert(`🎯 ¡Ganó ${appState.ruletaActiva.equipo1}! (${golesLocal} - ${golesVisitante})`);
        } else if (anguloReal >= 144 && anguloReal < 216) {
            golesLocal = Math.floor(Math.random() * 3);
            golesVisitante = golesLocal;
            alert(`🎯 ¡La ruleta clavó un EMPATE! (${golesLocal} - ${golesVisitante})`);
        } else {
            golesVisitante = Math.floor(Math.random() * 3) + 1;
            golesLocal = Math.floor(Math.random() * golesVisitante);
            alert(`🎯 ¡Ganó ${appState.ruletaActiva.equipo2}! (${golesLocal} - ${golesVisitante})`);
        }

        const letra = appState.ruletaActiva.letraGrupo;
        const pId = appState.ruletaActiva.partidoId;
        const fecha = appState.tournament.faseActual;
        const partidos = appState.tournament.grupos[letra].partidos[fecha];
        const idx = partidos.findIndex(x => x.id === pId);

        partidos[idx].goles1 = golesLocal;
        partidos[idx].goles2 = golesVisitante;

        renderizarGruposIdaVuelta();
    });
}

// ==========================================================================
// 🔥 ENRUTADOR INTERNO: SALTO DEFINITIVO A ELIMINACIÓN DIRECTA (PARTIDO ÚNICO)
// ==========================================================================
function avanzarAFAseFinalIdaVuelta() {
    const letrasGrupos = Object.keys(appState.tournament.grupos);

    // 1. Validar que se hayan cargado todos los goles en las 6 fechas
    for (let letra of letrasGrupos) {
        const partidosObj = appState.tournament.grupos[letra].partidos;
        for (let fKey of Object.keys(partidosObj)) {
            for (let p of partidosObj[fKey]) {
                if (p.goles1 === null || p.goles2 === null) {
                    alert(`Hay partidos pendientes en el Grupo ${letra} (${fKey.toUpperCase()}). ¡Completalos para avanzar!`);
                    return;
                }
            }
        }
    }

    // 2. Obtener tablas de posiciones ordenadas usando tu propia lógica analítica
    const tablas = calcularTablasGruposIdaVuelta();
    let clasificadosFinales = [];

    // 3. Cruces estilo Champions League puros (1º Grupo A vs 2º Grupo B, y al revés)
    for (let i = 0; i < letrasGrupos.length; i += 2) {
        const gA = letrasGrupos[i];
        const gB = letrasGrupos[i + 1];

        if (gA && gB) {
            // Cruce 1: 1º del Grupo A vs 2º del Grupo B
            clasificadosFinales.push(tablas[gA][0].nombre);
            clasificadosFinales.push(tablas[gB][1].nombre);

            // Cruce 2: 1º del Grupo B vs 2º del Grupo A
            clasificadosFinales.push(tablas[gB][0].nombre);
            clasificadosFinales.push(tablas[gA][1].nombre);
        } else if (gA) {
            // Protección por si la cantidad de grupos llegara a ser impar
            clasificadosFinales.push(tablas[gA][0].nombre);
            clasificadosFinales.push(tablas[gA][1].nombre);
        }
    }

    // 4. Cambiar el estado del torneo y resetear triggers de ruleta
    appState.tournament.type = 'eliminatoria';
    appState.ruletaActiva = { partidoId: null, equipo1: null, equipo2: null };

    // Modificamos el click del botón del modal para que apunte al gestor 50/50 limpio
    const btnSpin = document.getElementById('btn-spin-trigger');
    if (btnSpin) {
        btnSpin.setAttribute('onclick', 'gatillarGiroRuletaEliminatoria()');
    }

    // Seteo estético en el panel superior si existe la etiqueta
    const titleDashboard = document.getElementById('tournament-title');
    if (titleDashboard) {
        titleDashboard.textContent = `PANEL: ELIMINATORIA - FASES FINALES (${appState.tournament.mode.toUpperCase()})`;
    }

    // 5. Invocar al inicializador blindado de eliminacion.js a partido único
    if (typeof inicializarEliminatoria === 'function') {
        inicializarEliminatoria(clasificadosFinales);
    } else {
        alert("Error crítico: No se encontró la función inicializarEliminatoria en tu script de llaves.");
    }
}