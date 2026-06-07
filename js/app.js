// ==========================================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================================================
const appState = {
    currentScreen: 'screen-menu',
    tournament: {
        type: 'liga',
        mode: 'manual',
        teams: [],
        fases: {},
        faseActual: ''
    },
    ruletaActiva: {
        partidoId: null,
        equipo1: '',
        equipo2: ''
    }
};

// Control de navegación de pantallas
function changeScreen(screenId) {
    const screens = document.querySelectorAll('.app-screen');
    screens.forEach(screen => screen.classList.add('d-none'));

    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.classList.remove('d-none');
        appState.currentScreen = screenId;
    }
}

// Configuración de los botones del menú de inicio
function setupConfigButtons() {
    const steps = document.querySelectorAll('.config-step');
    steps.forEach((step, index) => {
        const buttons = step.querySelectorAll('.btn-select');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const optionText = button.textContent.trim().toLowerCase();

                if (index === 0) {
                    if (optionText.includes('liga')) appState.tournament.type = 'liga';
                    // Sincronizados con guión bajo para que coincidan con generarTorneo()
                    else if (optionText.includes('solo ida')) appState.tournament.type = 'grupos_solo_ida';
                    else if (optionText.includes('ida y vuelta')) appState.tournament.type = 'grupos_ida_vuelta';
                    else if (optionText.includes('eliminación')) appState.tournament.type = 'eliminatoria';
                } else if (index === 1) {
                    if (optionText.includes('manual')) appState.tournament.mode = 'manual';
                    if (optionText.includes('ruleta')) appState.tournament.mode = 'ruleta';
                }
            });
        });
    });
}

// Disparador principal al tocar "GENERAR TORNEO"
function generarTorneo() {
    const textarea = document.getElementById('teams-input');
    const rawText = textarea.value;

    const teamsArray = rawText.split('\n')
        .map(team => team.trim())
        .filter(team => team.length > 0);

    if (teamsArray.length < 2) {
        alert('Anotá al menos 2 equipos para armar algo, che.');
        return;
    }

    appState.tournament.teams = teamsArray;

    const titleDashboard = document.getElementById('tournament-title');
    titleDashboard.textContent = `PANEL: ${appState.tournament.type.toUpperCase().replace(/_/g, ' ')} (${appState.tournament.mode.toUpperCase()})`;

    // Ahora la validación de strings matchea perfectamente
    if (appState.tournament.type === 'eliminatoria') {
        if (typeof inicializarEliminatoria === 'function') {
            inicializarEliminatoria(teamsArray);
        } else {
            alert('Error: El módulo de eliminación directa no está cargado.');
            return;
        }
    }
    else if (appState.tournament.type === 'liga') {
        if (typeof inicializarLiga === 'function') {
            inicializarLiga(teamsArray);
        } else {
            alert('Error: El módulo de liga no está cargado.');
            return;
        }
    }
    else if (appState.tournament.type === 'grupos_solo_ida') {
        if (typeof inicializarGruposSoloIda === 'function') {
            inicializarGruposSoloIda(teamsArray);
        } else {
            alert('Error: El módulo de Grupos Solo Ida no está cargado.');
            return;
        }
    }
    else if (appState.tournament.type === 'grupos_ida_vuelta') {
        if (typeof inicializarGruposIdaVuelta === 'function') {
            inicializarGruposIdaVuelta(teamsArray);
        } else {
            alert('Error: El módulo de Grupos Ida y Vuelta no está cargado.');
            return;
        }
    }

    changeScreen('screen-tournament-dashboard');
}

// Función que se activa al elegir la tarjeta del Mundial en el menú interactivo
function configurarEIniciarMundialReal() {
    appState.isRealTournament = true;
    appState.tournament.type = 'grupos_solo_ida';
    appState.tournament.mode = 'ruleta';
    appState.tournament.faseActual = 'fecha-1';
    appState.tournament.grupos = {};

    // Seteamos el encabezado del Dashboard principal
    const titleDashboard = document.getElementById('tournament-title');
    if (titleDashboard) {
        titleDashboard.textContent = "🏆 COPA DEL MUNDO 2026 - FASE DE GRUPOS";
    }

    // 🔥 Agregamos el llamado AQUÍ para poblar la base de datos antes de ir al dashboard
    inicializarDatosYFixtureMundial();

    // Cambiamos de pantalla al Panel de Control
    changeScreen('screen-tournament-dashboard');

    // Inicializamos el motor que dibuja en pantalla
    if (typeof inicializarFixtureMundialReal === 'function') {
        inicializarFixtureMundialReal();
    } else {
        alert('Error: El módulo mundialEngine.js no está cargado correctamente.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupConfigButtons();
});