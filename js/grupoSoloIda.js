// ==========================================================================
// MÓDULO: GRUPOS SOLO IDA (ESTILO MUNDIAL CON CLASIFICACIÓN A FASE FINAL)
// ==========================================================================

function inicializarGruposSoloIda(equipos) {
    if (equipos.length < 4 || equipos.length % 4 !== 0) {
        alert(`Para armar grupos de 4 necesitas una cantidad de equipos múltiplo de 4 (Ej: 4, 8, 12, 16, 32). Actualmente ingresaste ${equipos.length}.`);
        return;
    }

    appState.tournament.grupos = {};
    appState.tournament.faseActual = 'fecha-1';

    // 1. Mezclamos los equipos al azar para el sorteo genuino
    let listaSorteada = [...equipos].sort(() => Math.random() - 0.5);
    const cantidadGrupos = listaSorteada.length / 4;

    // 2. Crear los grupos (A, B, C...) y estructurar su Round Robin fijo (3 fechas)
    for (let i = 0; i < cantidadGrupos; i++) {
        const letraGrupo = String.fromCharCode(65 + i); // 65 es 'A' en ASCII
        appState.tournament.grupos[letraGrupo] = {
            equipos: listaSorteada.slice(i * 4, (i * 4) + 4),
            partidos: { 'fecha-1': [], 'fecha-2': [], 'fecha-3': [] }
        };

        const eq = appState.tournament.grupos[letraGrupo].equipos;

        // Fecha 1: 1 vs 4, 2 vs 3
        appState.tournament.grupos[letraGrupo].partidos['fecha-1'].push({ id: `G-${letraGrupo}-1-1`, equipo1: eq[0], equipo2: eq[3], goles1: null, goles2: null });
        appState.tournament.grupos[letraGrupo].partidos['fecha-1'].push({ id: `G-${letraGrupo}-1-2`, equipo1: eq[1], equipo2: eq[2], goles1: null, goles2: null });

        // Fecha 2: 1 vs 3, 4 vs 2
        appState.tournament.grupos[letraGrupo].partidos['fecha-2'].push({ id: `G-${letraGrupo}-2-1`, equipo1: eq[0], equipo2: eq[2], goles1: null, goles2: null });
        appState.tournament.grupos[letraGrupo].partidos['fecha-2'].push({ id: `G-${letraGrupo}-2-2`, equipo1: eq[3], equipo2: eq[1], goles1: null, goles2: null });

        // Fecha 3: 1 vs 2, 3 vs 4
        appState.tournament.grupos[letraGrupo].partidos['fecha-3'].push({ id: `G-${letraGrupo}-3-1`, equipo1: eq[0], equipo2: eq[1], goles1: null, goles2: null });
        appState.tournament.grupos[letraGrupo].partidos['fecha-3'].push({ id: `G-${letraGrupo}-3-2`, equipo1: eq[2], equipo2: eq[3], goles1: null, goles2: null });
    }

    renderizarGruposSoloIda();
}

function calcularTablasGruposSoloIda() {
    const tablas = {};

    Object.keys(appState.tournament.grupos).forEach(letra => {
        tablas[letra] = {};
        appState.tournament.grupos[letra].equipos.forEach(t => {
            tablas[letra][t] = { nombre: t, grupo: letra, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, df: 0 };
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

function renderizarGruposSoloIda() {
    const renderArea = document.getElementById('tournament-render-area');
    const fechaName = appState.tournament.faseActual;
    const nroFecha = parseInt(fechaName.split('-')[1]);
    const tablas = calcularTablasGruposSoloIda();

    let html = `
        <div class="fecha-nav-header" style="margin-bottom: 25px;">
            <button class="btn-select" ${nroFecha === 1 ? 'disabled' : ''} onclick="cambiarFechaGruposSoloIda(${nroFecha - 1})"><i class="fa-solid fa-chevron-left"></i></button>
            <h3>Fase de Grupos: ${fechaName.toUpperCase().replace('-', ' ')}</h3>
            <button class="btn-select" ${nroFecha === 3 ? 'disabled' : ''} onclick="cambiarFechaGruposSoloIda(${nroFecha + 1})"><i class="fa-solid fa-chevron-right"></i></button>
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
                        <input type="number" class="score-input" min="0" placeholder="0" value="${g1}" id="g1-${p.id}" onchange="guardarGolesGruposSoloIda('${letra}', '${p.id}', 1)">
                    </div>
                    <div class="match-vs">VS</div>
                    <div class="match-team">
                        <span class="team-name">${p.equipo2}</span>
                        <input type="number" class="score-input" min="0" placeholder="0" value="${g2}" id="g2-${p.id}" onchange="guardarGolesGruposSoloIda('${letra}', '${p.id}', 2)">
                    </div>
                    ${appState.tournament.mode === 'ruleta' ?
                    `<button class="btn-match-roulette" onclick="abrirRuletaGruposSoloIda('${letra}', '${p.id}')"><i class="fa-solid fa-crosshairs"></i></button>` : ''
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

    // Añadimos el gran botón de cierre abajo de los grupos
    html += `
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <button class="btn-nav btn-start" style="padding: 15px 40px; font-size: 1.1rem; box-shadow: 0 0 15px var(--neon-cyan);" onclick="avanzarAFAseFinalMundial()">
                GENERAR LLAVES FINALES 🚀
            </button>
        </div>
    `;
    renderArea.innerHTML = html;
}

function guardarGolesGruposSoloIda(letraGrupo, partidoId, nroEquipo) {
    const input = document.getElementById(`g${nroEquipo}-${partidoId}`);
    const valor = input.value !== "" ? parseInt(input.value) : null;
    const fecha = appState.tournament.faseActual;

    const partidos = appState.tournament.grupos[letraGrupo].partidos[fecha];
    const idx = partidos.findIndex(x => x.id === partidoId);

    if (nroEquipo === 1) partidos[idx].goles1 = valor;
    else partidos[idx].goles2 = valor;

    renderizarGruposSoloIda();
}

function cambiarFechaGruposSoloIda(nuevaFechaNro) {
    appState.tournament.faseActual = `fecha-${nuevaFechaNro}`;
    renderizarGruposSoloIda();
}

function abrirRuletaGruposSoloIda(letraGrupo, partidoId) {
    const fecha = appState.tournament.faseActual;
    const partidos = appState.tournament.grupos[letraGrupo].partidos[fecha];
    const partido = partidos.find(x => x.id === partidoId);

    appState.ruletaActiva.partidoId = partidoId;
    appState.ruletaActiva.letraGrupo = letraGrupo;
    appState.ruletaActiva.equipo1 = partido.equipo1;
    appState.ruletaActiva.equipo2 = partido.equipo2;

    // CORRECCIÓN FASE DE GRUPOS: pasamos true para que use la ruleta de 3 secciones (permite EMPATE)
    dibujarRuletaCanvas(partido.equipo1, partido.equipo2, true);

    document.getElementById('btn-spin-trigger').setAttribute('onclick', 'gatillarGiroRuletaGruposSoloIda()');
    document.getElementById('roulette-modal').classList.remove('d-none');
}

function gatillarGiroRuletaGruposSoloIda() {
    ejecutarAnimacionRuleta((gradosRandom) => {
        let golesLocal = 0, golesVisitante = 0;
        const anguloDetenido = gradosRandom % 360;
        const anguloReal = (270 - anguloDetenido + 360) % 360;

        // MATEMÁTICA LIGA EXACTA APLICADA A GRUPOS (40/20/40)
        if (anguloReal < 144) {
            golesLocal = Math.floor(Math.random() * 3) + 1;
            golesVisitante = Math.floor(Math.random() * golesLocal);
            alert(`🎯 ¡Ganó ${appState.ruletaActiva.equipo1}! (${golesLocal} - ${golesVisitante})`);
        } else if (anguloReal >= 144 && anguloReal < 216) {
            golesLocal = Math.floor(Math.random() * 3);
            golesVisitante = golesLocal;
            alert(`🎯 ¡Empate entre ${appState.ruletaActiva.equipo1} y ${appState.ruletaActiva.equipo2}! (${golesLocal} - ${golesVisitante})`);
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

        renderizarGruposSoloIda();
    });
}

// ==========================================================================
// CÁLCULO DE CLASIFICADOS INTERNOS Y CRUCES FIJOS (REGLAMENTO MUNDIAL)
// ==========================================================================

function avanzarAFAseFinalMundial() {
    // 1. Validar que no falte ningún resultado en ninguna de las 3 fechas
    const letrasGrupos = Object.keys(appState.tournament.grupos);
    for (let letra of letrasGrupos) {
        const partidosObj = appState.tournament.grupos[letra].partidos;
        for (let fKey of Object.keys(partidosObj)) {
            for (let p of partidosObj[fKey]) {
                if (p.goles1 === null || p.goles2 === null) {
                    alert(`Faltan cargar goles en el Grupo ${letra} (${fKey.toUpperCase()}). ¡Completalos para pasar a las finales!`);
                    return;
                }
            }
        }
    }

    const tablas = calcularTablasGruposSoloIda();
    const cantidadGrupos = letrasGrupos.length;

    let clasificadosFinales = [];

    // --- ESCENARIO 1: MUNDIAL CLÁSICO DE 8 GRUPOS (Pasan 16 - Octavos de Final) ---
    if (cantidadGrupos === 8) {
        const ordenCruces = [
            { g1: 'A', p1: 0, g2: 'B', p2: 1 }, // 1A vs 2B
            { g1: 'C', p1: 0, g2: 'D', p2: 1 }, // 1C vs 2D
            { g1: 'E', p1: 0, g2: 'F', p2: 1 }, // 1E vs 2F
            { g1: 'G', p1: 0, g2: 'H', p2: 1 }, // 1G vs 2H
            { g1: 'B', p1: 0, g2: 'A', p2: 1 }, // 1B vs 2A
            { g1: 'D', p1: 0, g2: 'C', p2: 1 }, // 1D vs 2C
            { g1: 'F', p1: 0, g2: 'E', p2: 1 }, // 1F vs 2E
            { g1: 'H', p1: 0, g2: 'G', p2: 1 }  // 1H vs 2G
        ];
        ordenCruces.forEach(cruce => {
            clasificadosFinales.push(tablas[cruce.g1][cruce.p1].nombre);
            clasificadosFinales.push(tablas[cruce.g2][cruce.p2].nombre);
        });
    }

    // --- ESCENARIO 2: 4 GRUPOS (Pasan 8 - Cuartos de Final) ---
    else if (cantidadGrupos === 4) {
        const ordenCruces = [
            { g1: 'A', p1: 0, g2: 'B', p2: 1 }, // 1A vs 2B
            { g1: 'C', p1: 0, g2: 'D', p2: 1 }, // 1C vs 2D
            { g1: 'B', p1: 0, g2: 'A', p2: 1 }, // 1B vs 2A
            { g1: 'D', p1: 0, g2: 'C', p2: 1 }  // 1D vs 2C
        ];
        ordenCruces.forEach(cruce => {
            clasificadosFinales.push(tablas[cruce.g1][cruce.p1].nombre);
            clasificadosFinales.push(tablas[cruce.g2][cruce.p2].nombre);
        });
    }

    // --- ESCENARIO 3: 2 GRUPOS (Pasan 4 - Semifinales) ---
    else if (cantidadGrupos === 2) {
        clasificadosFinales.push(tablas['A'][0].nombre); clasificadosFinales.push(tablas['B'][1].nombre);
        clasificadosFinales.push(tablas['B'][0].nombre); clasificadosFinales.push(tablas['A'][1].nombre);
    }

    // --- ESCENARIO 4: 3 GRUPOS / 12 EQUIPOS (Pasan 8 con Mejores Terceros - Cuartos) ---
    else if (cantidadGrupos === 3) {
        let listaTerceros = [];
        letrasGrupos.forEach(letra => {
            listaTerceros.push(tablas[letra][2]);
        });
        listaTerceros.sort((a, b) => b.pts - a.pts || b.df - a.df || b.gf - a.gf);

        const mejorTercero1 = listaTerceros[0];
        const mejorTercero2 = listaTerceros[1];

        alert(`📊 Clasificados por mejores terceros: \n1º: ${mejorTercero1.nombre} (Grupo ${mejorTercero1.grupo})\n2º: ${mejorTercero2.nombre} (Grupo ${mejorTercero2.grupo})`);

        clasificadosFinales.push(tablas['A'][0].nombre); clasificadosFinales.push(mejorTercero2.nombre);
        clasificadosFinales.push(tablas['B'][0].nombre); clasificadosFinales.push(mejorTercero1.nombre);
        clasificadosFinales.push(tablas['C'][0].nombre); clasificadosFinales.push(tablas['A'][1].nombre);
        clasificadosFinales.push(tablas['B'][1].nombre); clasificadosFinales.push(tablas['C'][1].nombre);
    }

    else {
        letrasGrupos.forEach(letra => {
            clasificadosFinales.push(tablas[letra][0].nombre);
            clasificadosFinales.push(tablas[letra][1].nombre);
        });
    }

    // ==================================================================
    // 🔥 EL ARREGLO CRÍTICO: DESVINCULAR ENRUTAMIENTOS DE RUBLA/CRUCES
    // ==================================================================

    // 1. Cambiamos el tipo de torneo en el estado global
    appState.tournament.type = 'eliminatoria';

    // 2. Limpiamos cualquier rastro de los grupos en el estado de la ruleta activa
    appState.ruletaActiva = { partidoId: null, equipo1: null, equipo2: null };

    // 3. Re-enrutamos el trigger del botón de la ruleta en el HTML para que apunte a la de eliminación
    const btnSpin = document.getElementById('btn-spin-trigger');
    if (btnSpin) {
        // Apunta a la función encargada de girar en finales (revisá si en tu eliminacion.js se llama exactamente así)
        btnSpin.setAttribute('onclick', 'gatillarGiroRuletaEliminatoria()');
    }

    // 4. Cambiamos el título del panel superior
    const titleDashboard = document.getElementById('tournament-title');
    if (titleDashboard) {
        titleDashboard.textContent = `PANEL: ELIMINATORIA - FASES FINALES (${appState.tournament.mode.toUpperCase()})`;
    }

    // 5. Le pasamos el control limpio a tu archivo de llaves finales
    if (typeof inicializarEliminatoria === 'function') {
        inicializarEliminatoria(clasificadosFinales);
    } else {
        alert('Error: No se pudo cargar el script de fases finales (eliminacion.js).');
    }
}