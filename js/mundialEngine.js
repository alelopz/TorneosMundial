// Variable global dentro del motor para saber qué grupo está mirando el streamer
let grupoSeleccionadoActual = "A";

// Función Principal de Renderizado del Mundial Real
// Función Principal de Renderizado del Mundial Real
function inicializarFixtureMundialReal() {
    const renderArea = document.getElementById('tournament-render-area');
    if (!renderArea) return;

    // Limpiamos el área por las dudas
    renderArea.innerHTML = "";

    // 1. CREAMOS LA BOTONERA DE SELECCIÓN DE GRUPOS (A-L)
    const selectorContenedor = document.createElement('div');
    selectorContenedor.className = 'grupo-selector-banco';

    const letrasGrupos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    letrasGrupos.forEach(letra => {
        const btnGrupo = document.createElement('button');
        btnGrupo.className = `btn-grupo-tab ${letra === grupoSeleccionadoActual ? 'active' : ''}`;
        btnGrupo.textContent = `GRUPO ${letra}`;
        btnGrupo.onclick = () => {
            grupoSeleccionadoActual = letra;
            inicializarFixtureMundialReal();
        };
        selectorContenedor.appendChild(btnGrupo);
    });
    renderArea.appendChild(selectorContenedor);

    // 2. OBTENEMOS LOS DATOS DEL GRUPO ACTIVO DE NUESTRO APPSTATE
    const infoGrupo = appState.tournament.grupos[grupoSeleccionadoActual];
    if (!infoGrupo) {
        renderArea.insertAdjacentHTML('beforeend', '<p class="error-msg">Error: Estructura del grupo no encontrada.</p>');
        return;
    }

    // 3. CREAMOS LA GRID DE DOS COLUMNAS (TABLA IZQ | PARTIDOS DER)
    const dashboardGrid = document.createElement('div');
    dashboardGrid.className = 'mundial-dashboard-grid';

    // --- COLUMNA IZQUIERDA: TABLA DE POSICIONES ---
    const colIzquierda = document.createElement('div');
    colIzquierda.className = 'col-tabla-mundial';

    const tablaStats = calcularTablaGrupoMundial(grupoSeleccionadoActual);

    let htmlTabla = `
        <div class="tabla-contenedor-futurista">
            <h3 class="tabla-titulo-neón">POSICIONES - GRUPO ${grupoSeleccionadoActual}</h3>
            <table class="tabla-mundial-real">
                <thead>
                    <tr>
                        <th style="padding: 12px 8px;">POS</th>
                        <th class="txt-left" style="padding: 12px 8px;">SELECCIÓN</th>
                        <th style="padding: 12px 8px;">PTS</th>
                        <th style="padding: 12px 8px;">PJ</th>
                        <th style="padding: 12px 8px;">PG</th>
                        <th style="padding: 12px 8px;">PE</th>
                        <th style="padding: 12px 8px;">PP</th>
                        <th style="padding: 12px 8px;">GF</th>
                        <th style="padding: 12px 8px;">GC</th>
                        <th style="padding: 12px 8px;">DG</th>
                    </tr>
                </thead>
                <tbody>
    `;

    tablaStats.forEach((team, index) => {
        const infoEq = infoGrupo.equiposInfo.find(e => e.nombre === team.nombre);
        const flagCode = infoEq ? infoEq.flag : 'un';

        htmlTabla += `
            <tr class="${index < 2 ? 'zona-clasificacion' : ''}">
                <td style="padding: 12px 8px;"><span class="pos-num">${index + 1}</span></td>
                <td class="txt-left team-cell-flex" style="padding: 12px 8px; display: flex; align-items: center; gap: 10px;">
                    <img src="https://flagcdn.com/w40/${flagCode}.png" alt="bandera" style="width: 28px; border-radius: 3px; object-fit: cover;">
                    <span class="team-name-tabla" style="font-weight: 500;">${team.nombre}</span>
                </td>
                <td class="fw-bold text-cyan" style="padding: 12px 8px;">${team.pts}</td>
                <td style="padding: 12px 8px;">${team.pj}</td>
                <td style="padding: 12px 8px;">${team.pg}</td>
                <td style="padding: 12px 8px;">${team.pe}</td>
                <td style="padding: 12px 8px;">${team.pp}</td>
                <td style="padding: 12px 8px;">${team.gf}</td>
                <td style="padding: 12px 8px;">${team.gc}</td>
                <td class="${team.dg >= 0 ? 'text-green' : 'text-red'}" style="padding: 12px 8px;">
                    ${team.dg > 0 ? '+' + team.dg : team.dg}
                </td>
            </tr>
        `;
    });

    htmlTabla += `</tbody></table></div>`;
    colIzquierda.innerHTML = htmlTabla;
    dashboardGrid.appendChild(colIzquierda);

    // --- COLUMNA DERECHA: SELECCIÓN DE FECHAS Y PARTIDOS ---
    const colDerecha = document.createElement('div');
    colDerecha.className = 'col-partidos-mundial';

    let htmlPartidos = `
        <div class="fecha-selector-mini">
            <button class="${appState.tournament.faseActual === 'fecha-1' ? 'active' : ''}" onclick="cambiarFechaMundialReal('fecha-1')">FECHA 1</button>
            <button class="${appState.tournament.faseActual === 'fecha-2' ? 'active' : ''}" onclick="cambiarFechaMundialReal('fecha-2')">FECHA 2</button>
            <button class="${appState.tournament.faseActual === 'fecha-3' ? 'active' : ''}" onclick="cambiarFechaMundialReal('fecha-3')">FECHA 3</button>
        </div>
        <div class="lista-partidos-render">
    `;

    const partidosDeLaFecha = infoGrupo.partidos[appState.tournament.faseActual] || [];

    partidosDeLaFecha.forEach(p => {
        const g1 = p.goles1 !== null ? p.goles1 : 0;
        const g2 = p.goles2 !== null ? p.goles2 : 0;

        htmlPartidos += `
            <div class="match-card-mundial" data-partido-id="${p.id}">
                <div class="team-side local-side">
                    <img src="https://flagcdn.com/w40/${p.flag1}.png" alt="${p.equipo1}" class="flag-mundial">
                    <span class="team-name-mundial">${p.equipo1}</span>
                </div>
                
                <div class="score-block-mundial">
                    <input type="number" class="input-score" value="${g1}" min="0" onchange="guardarGolesMundialAmano('${p.id}', 1, this.value)">
                    <span class="vs-divider">X</span>
                    <input type="number" class="input-score" value="${g2}" min="0" onchange="guardarGolesMundialAmano('${p.id}', 2, this.value)">
                </div>

                <div class="team-side visitante-side">
                    <span class="team-name-mundial">${p.equipo2}</span>
                    <img src="https://flagcdn.com/w40/${p.flag2}.png" alt="${p.equipo2}" class="flag-mundial">
                </div>

                <button class="btn-ruleta-neón-mundial" title="Girar Ruleta" onclick="abrirRuletaMundialReal('${p.id}')">
                 🎡
                </button>
            </div>
        `;
    });

    htmlPartidos += `</div>`;
    colDerecha.innerHTML = htmlPartidos;
    dashboardGrid.appendChild(colDerecha);

    if (appState.tournament.faseActual.startsWith('fecha-')) {
        const contenedorAcciones = document.createElement('div');
        contenedorAcciones.className = 'contenedor-acciones-mundial';
        contenedorAcciones.style.width = '100%';
        contenedorAcciones.style.display = 'flex';
        contenedorAcciones.style.justify = 'center';
        contenedorAcciones.style.marginTop = '25px';

        const btnCerrarGrupos = document.createElement('button');
        btnCerrarGrupos.className = 'btn-neon-mundial-action';
        btnCerrarGrupos.innerHTML = '🔒 CERRAR CLASIFICACIÓN Y ARMAR 16AVOS';
        btnCerrarGrupos.onclick = () => {
            procesarMejoresTercerosMundial();
        };

        contenedorAcciones.appendChild(btnCerrarGrupos);
        renderArea.appendChild(contenedorAcciones);
    }

    renderArea.appendChild(dashboardGrid);
}

// Función corregida para aceptar el número 0 en los marcadores manuales
function guardarGolesMundialAmano(partidoId, nroEquipo, valor) {
    // Si el input está completamente vacío, lo dejamos en null, si tiene número (incluido el 0) lo parseamos
    const goles = valor === "" ? null : parseInt(valor, 10);

    const grupo = appState.tournament.grupos[grupoSeleccionadoActual];
    if (!grupo) return;

    const faseActual = appState.tournament.faseActual;
    const partido = grupo.partidos[faseActual].find(p => p.id === partidoId);

    if (partido) {
        if (nroEquipo === 1) {
            partido.goles1 = goles;
        } else if (nroEquipo === 2) {
            partido.goles2 = goles;
        }

        console.log(`Partido actualizado manual: ${partido.equipo1} ${partido.goles1} - ${partido.goles2} ${partido.equipo2}`);

        // Refrescamos pantalla y recalculamos tabla
        inicializarFixtureMundialReal();
    }
}

// Función auxiliar para que funcionen los botones de FECHA 1, 2 y 3
function cambiarFechaMundialReal(nombreFecha) {
    appState.tournament.faseActual = nombreFecha;
    inicializarFixtureMundialReal();
}

function inicializarDatosYFixtureMundial() {
    // 1. Limpiamos y aseguramos que la estructura esté en cero
    appState.tournament.grupos = {};
    appState.tournament.faseActual = 'fecha-1';

    // 2. Recorremos las letras de los grupos desde la A hasta la L
    const letrasGrupos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

    letrasGrupos.forEach(letra => {
        // Obtenemos los 4 equipos fijos definidos en datosMundial.js
        const equiposDelGrupo = MUNDIAL_2026_DATA[letra];

        if (!equiposDelGrupo || equiposDelGrupo.length !== 4) {
            console.error(`Error: El grupo ${letra} no tiene exactamente 4 equipos.`);
            return;
        }

        // Mapeamos solo los nombres para mantener compatibilidad con tu función calcularTablaGrupoMundial
        const arrayNombresEquipos = equiposDelGrupo.map(eq => eq.nombre);

        // 3. Estructuramos el objeto del grupo dentro de appState
        appState.tournament.grupos[letra] = {
            equipos: arrayNombresEquipos, // Lista de strings con los nombres
            equiposInfo: equiposDelGrupo,  // Guardamos también los objetos completos {nombre, flag} para las banderas
            partidos: {
                'fecha-1': [],
                'fecha-2': [],
                'fecha-3': []
            }
        };

        // Identificadores de los equipos para la lógica de las fechas (0, 1, 2, 3)
        const eq0 = equiposDelGrupo[0];
        const eq1 = equiposDelGrupo[1];
        const eq2 = equiposDelGrupo[2];
        const eq3 = equiposDelGrupo[3];

        // 4. Armamos el Fixture Fijo siguiendo el orden solicitado
        // Fecha 1: 1 vs 2 y 3 vs 4  (Índices: 0 vs 1 y 2 vs 3)
        appState.tournament.grupos[letra].partidos['fecha-1'] = [
            { id: `mundial-${letra}-f1-p1`, equipo1: eq0.nombre, flag1: eq0.flag, equipo2: eq1.nombre, flag2: eq1.flag, goles1: null, goles2: null },
            { id: `mundial-${letra}-f1-p2`, equipo1: eq2.nombre, flag1: eq2.flag, equipo2: eq3.nombre, flag2: eq3.flag, goles1: null, goles2: null }
        ];

        // Fecha 2: 1 vs 3 y 4 vs 2  (Índices: 0 vs 2 y 3 vs 1)
        appState.tournament.grupos[letra].partidos['fecha-2'] = [
            { id: `mundial-${letra}-f2-p1`, equipo1: eq0.nombre, flag1: eq0.flag, equipo2: eq2.nombre, flag2: eq2.flag, goles1: null, goles2: null },
            { id: `mundial-${letra}-f2-p2`, equipo1: eq3.nombre, flag1: eq3.flag, equipo2: eq1.nombre, flag2: eq1.flag, goles1: null, goles2: null }
        ];

        // Fecha 3: 1 vs 4 y 2 vs 3  (Índices: 0 vs 3 y 1 vs 2)
        appState.tournament.grupos[letra].partidos['fecha-3'] = [
            { id: `mundial-${letra}-f3-p1`, equipo1: eq0.nombre, flag1: eq0.flag, equipo2: eq3.nombre, flag2: eq3.flag, goles1: null, goles2: null },
            { id: `mundial-${letra}-f3-p2`, equipo1: eq1.nombre, flag1: eq1.flag, equipo2: eq2.nombre, flag2: eq2.flag, goles1: null, goles2: null }
        ];
    });

    console.log("¡Estructura de datos y fixture del Mundial Real inicializados con éxito!", appState.tournament.grupos);
}

// Función auxiliar para cambiar de fecha rápido
function cambiarFechaMundialReal(nombreFecha) {
    appState.tournament.faseActual = nombreFecha;
    inicializarFixtureMundialReal();
}

function renderizarMundialReal() {
    inicializarFixtureMundialReal();
}

// Función clonada y optimizada para calcular la tabla en base a los resultados del grupo
function calcularTablaGrupoMundial(letra) {
    const grupo = appState.tournament.grupos[letra];
    const listaEquipos = grupo.equipos;

    // Inicializamos el objeto de estadísticas de cada selección
    let stats = listaEquipos.map(name => ({
        nombre: name, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0
    }));

    // Recorremos todas las fechas sumando goles y puntos
    ['fecha-1', 'fecha-2', 'fecha-3'].forEach(f => {
        const partidos = grupo.partidos[f] || [];
        partidos.forEach(p => {
            if (p.goles1 !== null && p.goles2 !== null) {
                const eq1 = stats.find(e => e.nombre === p.equipo1);
                const eq2 = stats.find(e => e.nombre === p.equipo2);

                if (eq1 && eq2) {
                    eq1.pj++; eq2.pj++;
                    eq1.gf += p.goles1; eq1.gc += p.goles2;
                    eq2.gf += p.goles2; eq2.gc += p.goles1;
                    eq1.dg = eq1.gf - eq1.gc;
                    eq2.dg = eq2.gf - eq2.gc;

                    if (p.goles1 > p.goles2) {
                        eq1.pts += 3; eq1.pg++; eq2.pp++;
                    } else if (p.goles1 < p.goles2) {
                        eq2.pts += 3; eq2.pg++; eq1.pp++;
                    } else {
                        eq1.pts += 1; eq2.pts += 1; eq1.pe++; eq2.pe++;
                    }
                }
            }
        });
    });

    // Ordenamos por Puntos, luego Diferencia de Gol, luego Goles a Favor
    return stats.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}

// 1. Función puente para abrir el modal de la ruleta en el Mundial
function abrirRuletaMundialReal(partidoId) {
    const grupo = appState.tournament.grupos[grupoSeleccionadoActual];
    if (!grupo) return;

    const faseActual = appState.tournament.faseActual;
    const partido = grupo.partidos[faseActual].find(p => p.id === partidoId);

    if (partido) {
        // Usamos la función nativa de tu ruleta.js para inicializar el estado y pasarle "true" (modo LIGA con empate)
        abrirRuletaGeneral(partido, partidoId, 'gatillarGiroRuletaMundialReal()', true);
    }
}

// 2. Función que ejecuta la animación real del CSS y guarda los goles en el Mundial
function gatillarGiroRuletaMundialReal() {
    // LLAMAMOS A TU ANIMACIÓN NATIVA: Hace girar el .wheel-frame visualmente durante 4 segundos
    ejecutarAnimacionRuleta((gradosRandom) => {
        let golesLocal = 0;
        let golesVisitante = 0;

        // Sincronizamos de forma exacta el ángulo con la flecha superior (270°)
        const anguloDetenido = gradosRandom % 360;
        const anguloReal = (270 - anguloDetenido + 360) % 360;

        // REGLA MATEMÁTICA LIGA EXACTA (40% Local | 20% Empate | 40% Visitante)
        if (anguloReal < 144) {
            // Gana Local
            golesLocal = Math.floor(Math.random() * 3) + 1;
            golesVisitante = Math.floor(Math.random() * golesLocal);
        } else if (anguloReal >= 144 && anguloReal < 216) {
            // Empate
            golesLocal = Math.floor(Math.random() * 3);
            golesVisitante = golesLocal;
        } else {
            // Gana Visitante
            golesVisitante = Math.floor(Math.random() * 3) + 1;
            golesLocal = Math.floor(Math.random() * golesVisitante);
        }

        // Guardamos los goles en la estructura del Mundial Real
        const partidoId = appState.ruletaActiva.partidoId;
        const grupo = appState.tournament.grupos[grupoSeleccionadoActual];
        const faseActual = appState.tournament.faseActual;

        if (grupo) {
            const partido = grupo.partidos[faseActual].find(p => p.id === partidoId);
            if (partido) {
                partido.goles1 = golesLocal;
                partido.goles2 = golesVisitante;
            }
        }

        // Refrescamos la pantalla del mundial para que impacten los goles y se mueva la tabla
        inicializarFixtureMundialReal();
    });
}

// Función para escanear los 12 grupos y calcular los 8 mejores terceros
function procesarMejoresTercerosMundial() {
    const todosLosTerceros = [];
    const letrasGrupos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

    letrasGrupos.forEach(letra => {
        // Calculamos las estadísticas completas del grupo en tiempo real
        const tablaOrdenada = calcularTablaGrupoMundial(letra);

        // El que quedó en la posición 3 (índice 2 del array ordenado) es el tercero del grupo
        if (tablaOrdenada && tablaOrdenada[2]) {
            const tercerEquipo = tablaOrdenada[2];
            todosLosTerceros.push({
                nombre: tercerEquipo.nombre,
                grupo: letra,
                pts: tercerEquipo.pts,
                pj: tercerEquipo.pj,
                pg: tercerEquipo.pg,
                pe: tercerEquipo.pe,
                pp: tercerEquipo.pp,
                gf: tercerEquipo.gf,
                gc: tercerEquipo.gc,
                dg: tercerEquipo.dg
            });
        }
    });

    // REGLA OFICIAL FIFA: Ordenamos de mejor a peor tercero
    // 1° Puntos -> 2° Diferencia de Gol -> 3° Goles a Favor
    todosLosTerceros.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
    });

    // Filtramos a los 8 sobrevivientes
    const clasificadosTerceros = todosLosTerceros.slice(0, 8);
    const eliminadosTerceros = todosLosTerceros.slice(8);

    console.log("=== 🏆 CONTROL DE MEJORES TERCEROS DEL MUNDIAL ===");
    console.log("Clasificados a 16avos:", clasificadosTerceros);
    console.log("Eliminados del torneo:", eliminadosTerceros);

    alert(`¡Fase de grupos cerrada! Clasificaron los 8 mejores terceros.\nAbrí la consola (F12) para ver la lista detallada.`);
}

// Función para renderizar el cuadro completo de los 16avos de Final
// 1. Función única corregida para cerrar Grupos, calcular clasificados y armar el Array de 16avos
function procesarMejoresTercerosMundial() {
    const todosLosPrimeros = {};
    const todosLosSegundos = {};
    const todosLosTerceros = [];
    const letrasGrupos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

    // Recolectamos posiciones reales de cada grupo
    letrasGrupos.forEach(letra => {
        const tablaOrdenada = calcularTablaGrupoMundial(letra);
        if (tablaOrdenada) {
            if (tablaOrdenada[0]) todosLosPrimeros[letra] = tablaOrdenada[0].nombre;
            if (tablaOrdenada[1]) todosLosSegundos[letra] = tablaOrdenada[1].nombre;
            if (tablaOrdenada[2]) {
                todosLosTerceros.push({
                    nombre: tablaOrdenada[2].nombre,
                    grupo: letra,
                    pts: tablaOrdenada[2].pts,
                    dg: tablaOrdenada[2].dg,
                    gf: tablaOrdenada[2].gf
                });
            }
        }
    });

    // Ordenamos terceros (Regla FIFA: Pts -> DG -> GF)
    todosLosTerceros.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
    });

    // Filtramos los 8 mejores
    const mejoresTerceros = todosLosTerceros.slice(0, 8).map(t => t.nombre);

    // ARRAY DE CRUCES FIJOS (Definición oficial/adaptada con tu cruce 1°J vs 2°H)
    const planoCruces = [
        { id: "16_P1", eq1: todosLosPrimeros["E"], eq2: mejoresTerceros[0] },
        { id: "16_P2", eq1: todosLosPrimeros["I"], eq2: mejoresTerceros[1] },
        { id: "16_P3", eq1: todosLosPrimeros["C"], eq2: todosLosSegundos["F"] },
        { id: "16_P4", eq1: todosLosSegundos["E"], eq2: todosLosSegundos["I"] },
        { id: "16_P5", eq1: todosLosSegundos["A"], eq2: todosLosSegundos["B"] },
        { id: "16_F6", eq1: todosLosPrimeros["F"], eq2: todosLosSegundos["C"] },
        { id: "16_P7", eq1: todosLosPrimeros["A"], eq2: mejoresTerceros[2] },
        { id: "16_P8", eq1: todosLosPrimeros["L"], eq2: todosLosSegundos[3] },
        { id: "16_P9", eq1: todosLosPrimeros["H"], eq2: todosLosSegundos["J"] },
        { id: "16_P10", eq1: todosLosSegundos["K"], eq2: todosLosSegundos["L"] },
        { id: "16_P11", eq1: todosLosPrimeros["J"], eq2: todosLosSegundos["H"] },
        { id: "16_P12", eq1: todosLosSegundos["D"], eq2: todosLosSegundos["G"] },
        { id: "16_P13", eq1: todosLosPrimeros["D"], eq2: mejoresTerceros[4] },
        { id: "16_P14", eq1: todosLosSegundos["B"], eq2: mejoresTerceros[5] },
        { id: "16_P15", eq1: todosLosPrimeros["G"], eq2: mejoresTerceros[6] },
        { id: "16_P16", eq1: todosLosPrimeros["K"], eq2: mejoresTerceros[7] }
    ];

    // Poblamos appState con los 16avos de forma dinámica
    appState.tournament.fases["16avos"] = planoCruces.map(c => {
        let flag1 = "un", flag2 = "un";

        letrasGrupos.forEach(l => {
            const inf = appState.tournament.grupos[l].equiposInfo;
            const find1 = inf.find(e => e.nombre === c.eq1);
            const find2 = inf.find(e => e.nombre === c.eq2);
            if (find1) flag1 = find1.flag;
            if (find2) flag2 = find2.flag;
        });

        return {
            id: c.id,
            equipo1: c.eq1 || "Por definir",
            flag1: flag1,
            goles1: null,
            penales1: null,
            equipo2: c.eq2 || "Por definir",
            flag2: flag2,
            goles2: null,
            penales2: null
        };
    });

    // Cambiamos de fase en la app y renderizamos
    appState.tournament.faseActual = "16avos";
    renderizar16avosMundial();
}

// 2. Renderizador corregido apuntando a 'tournament-render-area'
function renderizar16avosMundial() {
    const renderArea = document.getElementById('tournament-render-area');
    if (!renderArea) return;

    // Limpiamos los grupos de la pantalla
    renderArea.innerHTML = "";

    // Cambiamos el encabezado a modo eliminatoria
    const titleDashboard = document.getElementById('tournament-title');
    if (titleDashboard) {
        titleDashboard.textContent = "⚡ 16AVOS DE FINAL - MUERTE SÚBITA";
    }

    const playoffContainer = document.createElement('div');
    playoffContainer.className = 'playoff-container-mundial';
    playoffContainer.style.width = '100%';
    playoffContainer.style.display = 'grid';
    playoffContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    playoffContainer.style.gap = '20px';
    playoffContainer.style.padding = '10px';

    const partidos = appState.tournament.fases["16avos"] || [];
    let htmlPartidos = "";

    partidos.forEach((p, index) => {
        const valGoles1 = p.goles1 !== null ? p.goles1 : "";
        const valGoles2 = p.goles2 !== null ? p.goles2 : "";
        const valPen1 = p.penales1 !== null ? p.penales1 : "";
        const valPen2 = p.penales2 !== null ? p.penales2 : "";

        // Si hay empate manual, mostramos los casilleros de penales con condicional inline
        const mostrarPenales = (p.goles1 !== null && p.goles2 !== null && p.goles1 === p.goles2) ? 'flex' : 'none';

        htmlPartidos += `
            <div class="match-card match-neon-playoff" style="background: #111219; border: 2px solid #00f2fe; border-radius: 8px; padding: 15px; box-shadow: 0 0 10px rgba(0, 242, 254, 0.2); position: relative;">
                <div style="position: absolute; top: 5px; right: 10px; font-size: 0.75rem; color: #666; font-weight: bold;">
                    PARTIDO ${index + 1}
                </div>
                
                <div class="teams-container" style="display: flex; flex-direction: column; gap: 12px; margin-top: 5px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w40/${p.flag1}.png" alt="flag" style="width: 28px; border-radius:3px;">
                            <span style="color: #fff; font-weight: bold; font-size: 0.95rem;">${p.equipo1}</span>
                        </div>
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <input type="number" placeholder="P" value="${valPen1}" min="0" 
                                style="width: 30px; text-align: center; background: #000; border: 1px solid #ff007f; color: #ff007f; font-size:0.8rem; font-weight: bold; border-radius: 4px; display: ${mostrarPenales};"
                                onchange="guardarPenales16avos('${p.id}', 1, this.value)">
                            <input type="number" class="score-input" value="${valGoles1}" min="0" 
                                style="width: 45px; text-align: center; background: #000; border: 1px solid #00f2fe; color: #fff; font-weight: bold; border-radius: 4px;"
                                onchange="guardarGoles16avosMundial('${p.id}', 1, this.value)">
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://flagcdn.com/w40/${p.flag2}.png" alt="flag" style="width: 28px; border-radius:3px;">
                            <span style="color: #fff; font-weight: bold; font-size: 0.95rem;">${p.equipo2}</span>
                        </div>
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <input type="number" placeholder="P" value="${valPen2}" min="0" 
                                style="width: 30px; text-align: center; background: #000; border: 1px solid #ff007f; color: #ff007f; font-size:0.8rem; font-weight: bold; border-radius: 4px; display: ${mostrarPenales};"
                                onchange="guardarPenales16avos('${p.id}', 2, this.value)">
                            <input type="number" class="score-input" value="${valGoles2}" min="0" 
                                style="width: 45px; text-align: center; background: #000; border: 1px solid #00f2fe; color: #fff; font-weight: bold; border-radius: 4px;"
                                onchange="guardarGoles16avosMundial('${p.id}', 2, this.value)">
                        </div>
                    </div>
                </div>

                <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
                    <button class="btn-ruleta-neón-mundial" title="Girar Ruleta Muerte Súbita" style="background:none; border:none; font-size:1.3rem; cursor:pointer;"
                        onclick="abrirRuleta16avosMundial('${p.id}')">
                        🎡
                    </button>
                </div>
            </div>
        `;
    });

    playoffContainer.innerHTML = htmlPartidos;
    renderArea.appendChild(playoffContainer);
}

// 3. Manejo de goles manuales en los 16avos
function guardarGoles16avosMundial(partidoId, nroEquipo, valor) {
    const goles = valor === "" ? null : parseInt(valor, 10);
    const partido = appState.tournament.fases["16avos"].find(p => p.id === partidoId);

    if (partido) {
        if (nroEquipo === 1) partido.goles1 = goles;
        else if (nroEquipo === 2) p.goles2 = goles;

        // Reset de penales si el resultado deja de ser empate
        if (partido.goles1 !== partido.goles2) {
            partido.penales1 = null;
            partido.penales2 = null;
        }
        renderizer16avosMundial();
    }
}

// 4. Guardado de los penales manuales
function guardarPenales16avos(partidoId, nroEquipo, valor) {
    const penales = valor === "" ? null : parseInt(valor, 10);
    const partido = appState.tournament.fases["16avos"].find(p => p.id === partidoId);
    if (partido) {
        if (nroEquipo === 1) partido.penales1 = penales;
        else if (nroEquipo === 2) partido.penales2 = penales;
    }
}

// 5. Apertura de ruleta en modo Eliminatoria (50/50 - Sin Empate)
function abrirRuleta16avosMundial(partidoId) {
    const partido = appState.tournament.fases["16avos"].find(p => p.id === partidoId);
    if (partido) {
        // Pasamos false al final para que dibujarRuletaCanvas use el modo 50/50 cian/rosa
        abrirRuletaGeneral(partido, partidoId, 'gatillarGiroRuleta16avos()', false);
    }
}

// 6. Animación y lógica para el giro de los 16avos (Muerte súbita en goles)
function gatillarGiroRuleta16avos() {
    ejecutarAnimacionRuleta((gradosRandom) => {
        let golesLocal = 0;
        let golesVisitante = 0;

        const anguloDetenido = gradosRandom % 360;
        const anguloReal = (270 - anguloDetenido + 360) % 360;

        // Mitad perfecta del canvas (0° a 180° Local | 180° a 360° Visitante)
        if (anguloReal < 180) {
            // Gana Local sí o sí
            golesLocal = Math.floor(Math.random() * 3) + 1;
            golesVisitante = Math.floor(Math.random() * golesLocal);
        } else {
            // Gana Visitante sí o sí
            golesVisitante = Math.floor(Math.random() * 3) + 1;
            golesLocal = Math.floor(Math.random() * golesVisitante);
        }

        const pId = appState.ruletaActiva.partidoId;
        const partido = appState.tournament.fases["16avos"].find(p => p.id === pId);

        if (partido) {
            partido.goles1 = golesLocal;
            partido.goles2 = golesVisitante;
            partido.penales1 = null;
            partido.penales2 = null;
        }

        // Refrescamos la pantalla neón de play-offs
        renderizar16avosMundial();
    });
}