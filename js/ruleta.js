// ==========================================================================
// COMPONENTE RULETA MODULAR - REPARADO PARA CÍRCULO PERFECTO Y LIGA
// ==========================================================================

function abrirRuletaGeneral(partido, partidoId, callbackGatillo, esLiga = false) {
    appState.ruletaActiva.partidoId = partidoId;
    appState.ruletaActiva.equipo1 = partido.equipo1;
    appState.ruletaActiva.equipo2 = partido.equipo2;

    // Forzamos el dibujo inicial
    dibujarRuletaCanvas(partido.equipo1, partido.equipo2, esLiga);

    // Asignamos el evento al botón de Girar
    document.getElementById('btn-spin-trigger').setAttribute('onclick', callbackGatillo);
    document.getElementById('roulette-modal').classList.remove('d-none');
}

function abrirRuletaEliminatoria(partidoId) {
    const fase = appState.tournament.faseActual;
    const partido = appState.tournament.fases[fase][partidoId];
    abrirRuletaGeneral(partido, partidoId, 'gatillarGiroRuletaEliminatoria()', false);
}

function abrirRuletaLiga(partidoId) {
    const fecha = appState.tournament.faseActual;
    const partido = appState.tournament.fases[fecha][partidoId];
    // IMPORTANTE: pasamos true para activar el modo 40/40/20 de la Liga
    abrirRuletaGeneral(partido, partidoId, 'gatillarGiroRuletaLiga()', true);
}

function cerrarRuleta() {
    document.getElementById('roulette-modal').classList.add('d-none');
}

function dibujarRuletaCanvas(eq1, eq2, esLiga) {
    const canvas = document.getElementById('canvas-wheel');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const cx = 160;
    const cy = 160;
    const r = 160;

    ctx.clearRect(0, 0, 320, 320);

    if (!esLiga) {
        // ELIMINATORIA: Mitades perfectas de 50% y 50%
        dibujarPorcion(ctx, cx, cy, r, 0, Math.PI, '#00f2fe', eq1);   // Cyan Neón
        dibujarPorcion(ctx, cx, cy, r, Math.PI, Math.PI * 2, '#ff007f', eq2); // Rosa Neón Eléctrico
    } else {
        // LIGA: 40% Local, 20% Empate, 40% Visitante
        const rad40 = (40 / 100) * (Math.PI * 2);
        const rad20 = (20 / 100) * (Math.PI * 2);

        dibujarPorcion(ctx, cx, cy, r, 0, rad40, '#00f2fe', eq1); // Local (40%)
        dibujarPorcion(ctx, cx, cy, r, rad40, rad40 + rad20, '#ffcc00', 'EMPATE'); // Empate (20% Amarillo)
        dibujarPorcion(ctx, cx, cy, r, rad40 + rad20, Math.PI * 2, '#ff007f', eq2); // Visitante (40%)
    }
}

function dibujarPorcion(ctx, cx, cy, r, startAngle, endAngle, color, texto) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Líneas de separación estilizadas
    ctx.strokeStyle = '#0d0e15';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Nombres de los equipos rotados
    ctx.save();
    ctx.translate(cx, cy);
    const midAngle = startAngle + (endAngle - startAngle) / 2;
    ctx.rotate(midAngle);

    ctx.fillStyle = '#0d0e15'; // Color oscuro para que contraste al 100%
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';

    const textoCorto = texto.length > 11 ? texto.substring(0, 9) + '..' : texto;
    ctx.fillText(textoCorto.toUpperCase(), r - 25, 5);
    ctx.restore();
}

// Ahora animamos el FRAME contenedor para que no se rompan los píxeles al girar
function ejecutarAnimacionRuleta(procesarResultadoCallback) {
    const frame = document.querySelector('.wheel-frame');
    const btn = document.getElementById('btn-spin-trigger');
    btn.disabled = true;

    const gradosRandom = Math.floor(Math.random() * 360);
    const giroTotal = 1440 + gradosRandom; // 4 vueltas completas

    frame.style.transition = 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)';
    frame.style.transform = `rotate(${giroTotal}deg)`;

    setTimeout(() => {
        procesarResultadoCallback(gradosRandom);

        // Reset estático para el próximo partido
        frame.style.transition = 'none';
        frame.style.transform = `rotate(${gradosRandom}deg)`;
        setTimeout(() => {
            frame.style.transition = 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)';
        }, 50);

        btn.disabled = false;
        cerrarRuleta();
    }, 4100);
}

function gatillarGiroRuletaEliminatoria() {
    ejecutarAnimacionRuleta((gradosRandom) => {
        let ganador = "", golesLocal = 0, golesVisitante = 0;

        // 1. Calculamos el ángulo final neto de detención de la rueda
        const anguloDetenido = gradosRandom % 360;

        // 2. Ajustamos el desfase: la flecha está arriba (270°). 
        // Restamos para saber qué porción del canvas cayó debajo de los 270°.
        const anguloReal = (270 - anguloDetenido + 360) % 360;

        // Mitad de 0° a 180° es Equipo 1 (Local), de 180° a 360° es Equipo 2 (Visitante)
        if (anguloReal < 180) {
            ganador = appState.ruletaActiva.equipo1;
            golesLocal = Math.floor(Math.random() * 3) + 1;
            golesVisitante = Math.floor(Math.random() * golesLocal);
        } else {
            ganador = appState.ruletaActiva.equipo2;
            golesVisitante = Math.floor(Math.random() * 3) + 1;
            golesLocal = Math.floor(Math.random() * golesVisitante);
        }

        const fase = appState.tournament.faseActual;
        const pId = appState.ruletaActiva.partidoId;
        appState.tournament.fases[fase][pId].goles1 = golesLocal;
        appState.tournament.fases[fase][pId].goles2 = golesVisitante;

        alert(`🎯 ¡La ruleta decidió! Ganador: ${ganador} (${golesLocal} - ${golesVisitante})`);
        renderizarFaseEliminatoria();
    });
}

function gatillarGiroRuletaLiga() {
    ejecutarAnimacionRuleta((gradosRandom) => {
        let golesLocal = 0, golesVisitante = 0;

        // 1. Ángulo base de giro
        const anguloDetenido = gradosRandom % 360;

        // 2. Sincronizamos con la flecha de arriba (270°)
        const anguloReal = (270 - anguloDetenido + 360) % 360;

        // REGLA MATEMÁTICA LIGA EXACTA:
        // Local: 0° a 144° (40%) | Empate: 144° a 216° (20%) | Visitante: 216° a 360° (40%)
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

        const fecha = appState.tournament.faseActual;
        const pId = appState.ruletaActiva.partidoId;
        appState.tournament.fases[fecha][pId].goles1 = golesLocal;
        appState.tournament.fases[fecha][pId].goles2 = golesVisitante;

        renderizarLiga();
    });
}