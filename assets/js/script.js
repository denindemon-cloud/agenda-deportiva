console.log("Portal funcionando");

const deporte = document.querySelector("#deporte");
const liga = document.querySelector("#liga");
const listaEncuentros = document.querySelector("#listaEncuentros");
const botonFiltrar = document.querySelector("#botonFiltrar");
const listaResultados = document.querySelector("#listaResultados");


deporte.addEventListener("change", function() {
    
    if (deporte.value === "futbol") {

        liga.innerHTML = `
        <option value="todas">Todas</option>
                <option value="4328">Premier League</option>
                <option value="4627">Liga Chilena</option>
                <option value="4501">Copa Libertadores</option>
                <option value="4724">Copa Sudamericana</option>
                <option value="4480">Champions League</option>
        
        `;
               
    } else if (deporte.value === "nba") {
        
        liga.innerHTML = `
        <option value="4387">NBA</option>
        
        `;
        
        
    } else if (deporte.value === "tenis") {
        
        liga.innerHTML = `
        <option value="atp">ATP</option>
        <option value="wta">WTA</option>
        `;
    
    } else if (deporte.value === "todos") {
        
        liga.innerHTML = `
        <option value="todas">Todas</option>
        `;
    } 


});

const encuentros = [];


function mostrarEncuentros(datos, contenedor = listaEncuentros) {

    let template = "";

    for (const encuentro of datos) {
        let participante1;
        let participante2;

        if (encuentro.deporte === "tenis") {
            participante1 = encuentro.jugador1;
            participante2 = encuentro.jugador2;


        } else {
            participante1 = encuentro.local;
            participante2 = encuentro.visita;
        }

        template += `

    <div class= "col-md-4">
        <article class="card">
            <div class="card-body">

                <p class = "card-text">
                    Competición: ${encuentro.liga}
                </p>    
                
                <h3 class="card-title">
                    ${participante1} vs ${participante2}
                </h3>
                <p class="card-text">
                    Resultado: ${encuentro.resultado}
                </p>
                <p class="card-text">
                    ${encuentro.estado}
                </p>

                <p class="card-text">
                  Fecha: ${encuentro.fecha}

                </p>
                 
            </div>
        </article>
    </div>

    `;
    }

contenedor.innerHTML = template;

}




botonFiltrar.addEventListener("click", function() {

    console.log("Deporte:", deporte.value);
    console.log("Competición:", liga.value);

    if (deporte.value === "futbol") {

        encuentros.length = 0;

        obtenerAPI(liga.value, "futbol",endpointProximos, listaEncuentros);
        obtenerAPI(liga.value, "futbol", endpointPasados, listaResultados);
    
    } else if (deporte.value === "nba") {

        encuentros.length = 0;

        obtenerAPI(liga.value, "nba", endpointProximos, listaEncuentros);
        obtenerAPI(liga.value, "nba", endpointPasados, listaResultados);
   
    } else if (deporte.value === "tenis") {

        encuentros.length = 0;

        obtenerTenis(deporteTenis, liga.value);
    }

});




const urlApi = "https://www.thesportsdb.com/api/v1/json/123/";
const endpointProximos  = "eventsnextleague.php?id=";
const endpointPasados = "eventspastleague.php?id=";




// const idPremier = 4328; 
// const idNBA = 4387;
// const idChile = 4627;
// const idLibertadores = 4501;
// const idSudamericana = 4724;
// const idiChampions = 4480;
// const idiATP = 4464;
// const idiWTA = 4517;



async function obtenerAPI(idLiga, tipoDeporte, endpoint = endpointProximos, contenedor = listaEncuentros) {

    try {

        const encuentrosAPI = [];

        console.log(`${urlApi}${endpoint}${idLiga}`);
        
        const respuesta = await fetch(
            `${urlApi}${endpoint}${idLiga}`
        );

        const datos = await respuesta.json();


        for (const evento of datos.events) {

            let resultadoAPI;
            let estadoAPI;

            if (evento.intHomeScore === null && evento.intAwayScore === null) {
                resultadoAPI = "Sin resultado";
                estadoAPI = "Programado";

            } else {
                resultadoAPI = evento.intHomeScore + " - " + evento.intAwayScore;
                estadoAPI = evento.strStatus;
            }


            const encuentroAPI = {
                deporte: tipoDeporte,
                liga: evento.strLeague,
                local: evento.strHomeTeam,
                visita: evento.strAwayTeam,
                resultado: resultadoAPI,
                fecha: evento.dateEvent,
                estado: estadoAPI
            };

            encuentrosAPI.push(encuentroAPI);


        }

        mostrarEncuentros(encuentrosAPI, contenedor);


       

        console.log(datos.events[0].strHomeTeam);
        console.log(datos.events[0].strAwayTeam);
        console.log(datos.events[0].dateEvent);

    } catch (error) {
        console.log("Error al consultar la API", error);
    }

}


const urlApiTenis   =  "https://sportscore.com/api/widget/matches/";
const deporteTenis  = "tennis";
const limiteTenis   = 20;


async function obtenerTenis(deporteTenis, tipoTenis) {

    

    try {
        const respuesta = await fetch(
            `${urlApiTenis}?sport=${deporteTenis}&limit=${limiteTenis}`,

        );

        const datos = await respuesta.json();

        if (datos.matches === null || datos.matches.length === 0) {
            console.log("No hay partidos de tenis disponibles");
            return
        }


        console.log(datos.matches[0]);
        console.log(datos);

        for (const partido of datos.matches) {

            const fechaHoraTenis = new Date(partido.time);
            const fechaTenis = fechaHoraTenis.toLocaleDateString("es-CL");
            const horaTenis = fechaHoraTenis.toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit"
            });
            
            let resultadoTenis;
            let estadoTenis;

            // Si todavía no existe marcador
            if (
                (partido.home_score === null || partido.home_score === "") &&
                (partido.away_score === null || partido.away_score === "")
            ) {
                resultadoTenis = "Sin resultado";
                estadoTenis = "Programado";
            } else {
                resultadoTenis =
                    partido.home_score + " - " + partido.away_score;

                    if (partido.status_text === "Ended") {
                        estadoTenis = "Finalizado";
                    } else {
                        estadoTenis = partido.status_text;
                    }

                
            }

            let jugador1 = partido.home;
            let jugador2 = partido.away;

            if (jugador1.startsWith("Wqf")) {
                jugador1 = "Por definir";
            }

            if (jugador2.startsWith("Wqf")) {
                jugador2 = "Por definir";
            }

            
            const encuentroTenis = {
                deporte: "tenis",
                liga: partido.competition,
                jugador1: jugador1,
                jugador2: jugador2,
                resultado: resultadoTenis,
                fecha: fechaTenis,
                hora: horaTenis,
                estado: estadoTenis
            };

            if ((tipoTenis === "atp" && partido.competition.startsWith("ATP")) || (tipoTenis === "wta" && partido.competition.startsWith("WTA"))) {

                encuentros.push(encuentroTenis);
                
            }

            
        }

        // Mostrar todos los encuentros después de terminar el recorrido
        mostrarEncuentros(encuentros);

    } catch (error) {
        console.log("Error al consultar API de tenis", error);
    }
}



    
    
 
// obtenerAPI(idPremier,"futbol");
// obtenerAPI(idChile,"futbol");
// obtenerAPI(idLibertadores,"futbol");
// obtenerAPI(idSudamericana,"futbol");
// obtenerAPI(idiChampions, "futbol");
// obtenerTenis(deporteTenis);

// async function probarLigaChilena() {
//     const respuesta = await fetch("https://sportscore.com/api/v1/fixtures/?sport=football&date=2026-10-23&competition=chi-liga-de-primera&limit=20");
    
//     const datos  = await respuesta.json();

//     console.log(datos);
    

// }

// probarLigaChilena();

async function buscarNBA() {
    const respuesta = await fetch("https://sportscore.com/api/v1/fixtures/?sport=basketball&date=2026-10-16&competition=national-basketball-association&limit=20");
    
    const datos = await respuesta.json();

    console.log(datos);
}

buscarNBA();
