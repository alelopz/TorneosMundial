function inicializarLiga(equipos) {
    if (equipos.length < 3) {
        alert('Anotá al menos 3 equipos para armar una liga.');
        return;
    }
    appState.tournament.fases = {};
    appState.tournament.faseActual = 'fecha-1';

    let lista = [...equipos].sort(() => Math.random() - 0.5);
    if (lista.length % 2 !== 0) {
        lista.push("FECHA LIBRE ☕");
    }

    const numEquipos = lista.length;
    const numFechas = numEquipos - 1;
    const partidosPorFecha = numEquipos / 2;

    for (let f = 0; f < numFechas; f++) {
        const nombreFecha = `fecha-${f + 1}`;
        appState.tournament.fases[nombreFecha] = [];

        for (let p = 0; p < partidosPorFecha; p++) {
            const local = (f + p) % (numEquipos - 1);
            let visitante = (numEquipos - 1 - p + f) % (numEquipos - 1);
            if (p === 0) visitante = numEquipos - 1;

            appState.tournament.fases[nombreFecha].push({
                id: p,
                equipo1: lista[local],
                equipo2: lista[visitante],
                goles1: lista[local].includes("FECHA LIBRE") ? 0 : null,
                goles2: lista[visitante].includes("FECHA LIBRE") ? 0 : null,
                esLibre: lista[local].includes("FECHA LIBRE") || lista[visitante].includes("FECHA LIBRE")
            });
        }
    }
    renderizarLiga();
}

function calcularTablaPosiciones() {
    const tabla = {};
    appState.tournament.teams.forEach(t => {
        tabla[t] = { nombre: t, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, df: 0 };
    });

    Object.keys(appState.tournament.fases).forEach(fechaKey => {
        appState.tournament.fases[fechaKey].forEach(p => {
            if (!p.esLibre && p.goles1 !== null && p.goles2 !== null) {
                const eq1 = p.equipo1; const eq2 = p.equipo2;
                tabla[eq1].pj++; tabla[eq2].pj++;
                tabla[eq1].gf += p.goles1; tabla[eq1].gc += p.goles2;
                tabla[eq2].gf += p.goles2; tabla[eq2].gc += p.goles1;

                if (p.goles1 > p.goles2) {
                    tabla[eq1].pts += 3; tabla[eq1].pg++; tabla[eq2].pp++;
                } else if (p.goles1 < p.goles2) {
                    tabla[eq2].pts += 3; tabla[eq2].pg++; tabla[eq1].pp++;
                } else {
                    tabla[eq1].pts += 1; tabla[eq1].pe++; tabla[eq2].pts += 1; tabla[eq2].pe++;
                }
                tabla[eq1].df = tabla[eq1].gf - tabla[eq1].gc;
                tabla[eq2].df = tabla[eq2].gf - tabla[eq2].gc;
            }
        });
    });

    return Object.values(tabla).sort((a, b) => b.pts - a.pts || b.df - a.df || b.gf - a.gf);
}

function renderizarLiga() {
    const fechaName = appState.tournament.faseActual;
    const partidos = appState.tournament.fases[fechaName];
    const renderArea = document.getElementById('tournament-render-area');

    let htmlPartidos = "";
    partidos.forEach(p => {
        if (p.esLibre) {
            const libre = p.equipo1.includes("LIBRE") ? p.equipo2 : p.equipo1;
            htmlPartidos += `<div class="match-card single-libre">☕ ${libre} tiene fecha libre</div>`;
            return;
        }

        const g1 = p.goles1 !== null ? p.goles1 : "";
        const g2 = p.goles2 !== null ? p.goles2 : "";

        // Usamos la función global abrirRuletaLiga() del módulo ruleta.js
        htmlPartidos += `
            <div class="match-card">
                <div class="match-team">
                    <span class="team-name">${p.equipo1}</span>
                    <input type="number" class="score-input" min="0" placeholder="0" value="${g1}" id="g1-${p.id}" onchange="guardarGolesLiga(${p.id}, 1)">
                </div>
                <div class="match-vs">VS</div>
                <div class="match-team">
                    <span class="team-name">${p.equipo2}</span>
                    <input type="number" class="score-input" min="0" placeholder="0" value="${g2}" id="g2-${p.id}" onchange="guardarGolesLiga(${p.id}, 2)">
                </div>
                ${appState.tournament.mode === 'ruleta' ?
                `<button class="btn-match-roulette" onclick="abrirRuletaLiga(${p.id})"><i class="fa-solid fa-crosshairs"></i></button>` : ''
            }
            </div>
        `;
    });

    const nroFecha = parseInt(fechaName.split('-')[1]);
    const totalFechas = Object.keys(appState.tournament.fases).length;
    const tablaOrdenada = calcularTablaPosiciones();

    let htmlTabla = `<table class="liga-table"><thead><tr><th>#</th><th style="text-align:left;">Equipo</th><th>PTS</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>DF</th></tr></thead><tbody>`;
    tablaOrdenada.forEach((pos, idx) => {
        htmlTabla += `<tr class="${idx === 0 ? 'leader-row' : ''}"><td><strong>${idx + 1}</strong></td><td style="text-align:left; font-weight:600;">${pos.nombre}</td><td class="txt-cyan">${pos.pts}</td><td>${pos.pj}</td><td>${pos.pg}</td><td>${pos.pe}</td><td>${pos.pp}</td><td class="${pos.df > 0 ? 'txt-pink' : ''}">${pos.df}</td></tr>`;
    });
    htmlTabla += `</tbody></table>`;

    renderArea.innerHTML = `
        <div class="liga-layout-grid">
            <div class="liga-matches-col">
                <div class="fecha-nav-header">
                    <button class="btn-select" ${nroFecha === 1 ? 'disabled' : ''} onclick="cambiarFechaLiga(${nroFecha - 1})"><i class="fa-solid fa-chevron-left"></i></button>
                    <h3>${fechaName.toUpperCase().replace('-', ' ')}</h3>
                    <button class="btn-select" ${nroFecha === totalFechas ? 'disabled' : ''} onclick="cambiarFechaLiga(${nroFecha + 1})"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
                <div class="matches-list-bracket">${htmlPartidos}</div>
            </div>
            <div class="liga-table-col">
                <h3 class="phase-title" style="margin-bottom:15px;">TABLA DE POSICIONES</h3>
                ${htmlTabla}
            </div>
        </div>
    `;
}

function guardarGolesLiga(partidoId, nroEquipo) {
    const fecha = appState.tournament.faseActual;
    const input = document.getElementById(`g${nroEquipo}-${partidoId}`);
    const valor = input.value !== "" ? parseInt(input.value) : null;
    if (nroEquipo === 1) appState.tournament.fases[fecha][partidoId].goles1 = valor;
    else appState.tournament.fases[fecha][partidoId].goles2 = valor;
    renderizarLiga();
}

function cambiarFechaLiga(nuevaFechaNro) {
    appState.tournament.faseActual = `fecha-${nuevaFechaNro}`;
    renderizarLiga();
}