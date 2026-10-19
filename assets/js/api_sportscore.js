//Prueba de funcionamiento de la consola
console.log("SportScore funcionando");

//Elementos del DOM
const deporte = document.querySelector("#deporte");
const competicion = document.querySelector("#liga");
const fecha = document.querySelector("#fecha");
const botonFiltrar = document.querySelector("#botonFiltrar");
const listaEncuentros = document.querySelector("#listaEncuentros");




//Configuración API SportScore
const urlApi = "https://sportscore.com/api/v1/";
const endpoint = "fixtures/";


//Variable para la traducción del deporte al valor utilizado en SportScore
let deporteAPI = "football";



//Consulta los partidos de una competición
async function obtenerPartidos(fecha) {

    //Esta variable almacenará la URL final de la consulta
    let urlConsulta = "";

    
    //En tenis se consultará todos los partidos del día
    if (deporte.value === "tenis") {

        urlConsulta = `${urlApi}${endpoint}?sport=${deporteAPI}&date=${fecha}&limit=30`;
    
        //fútbol y basketball se consultan directamente mediante un slug para identificar competiciones, se encuentra documentada en su página. El parámetro competition esta documentando slug
    } else {

        urlConsulta = `${urlApi}${endpoint}?sport=${deporteAPI}&date=${fecha}&competition=${competicion.value}&limit=20`;
    }

    //Se realiza la consulta a sportscore 
    const respuesta = await fetch(urlConsulta);

    const datos = await respuesta.json();



    //Arreglo para guardar los partidos
    const encuentrosAPI = [];

    //Recorre los partidos obtenidos desde sportscore
    for (const partido of datos.matches) {

         // Prueba temporal para ver la URL del partido
        if (deporte.value === "futbol") {
            console.log(partido.url);
        }

        let resultado = "Sin resultado";

        // Si existe un marcador, construye el resultado del encuentro
        if (partido.home_score !== null && partido.away_score !== null) {
            resultado = partido.home_score + " - " + partido.away_score;
        } 

        //esta variable es sólo para que no muestre el estado finished en inglés 
        let estado = partido.status_text;

        if (partido.status_text === "Finished" || partido.status_text === "Ended") {
            estado = "Finalizado"
        }

        if (partido.status_text === "Not started") {
            estado = "Programado";
        }

        if (partido.status_text === "Delayed") {
            estado = "Aplazado";
        }

        // normalizar el nombre de la liga chilena

        let nombreCompeticion = partido.competition;

        if (partido.competition === "CHI Liga de Primera") {
            nombreCompeticion = "Liga Chilena de Primera"
        }
        
    

        
        const fechaPartido = new Date(partido.time);
        const fechaFormateada = fechaPartido.toLocaleDateString("es-CL");

        //Se normaliza los datos del partido, para usarlo en todos los deportes
        const encuentro = {
            deporte: deporte.value,
            competicion: nombreCompeticion,
            participante1: partido.home,
            participante2: partido.away,
            logo1: partido.home_logo,
            logo2: partido.away_logo,
            resultado: resultado,
            fecha: fechaFormateada,
            estado: estado,

            golesLocal: [],
            golesVisita: [],
            amarillasLocal: [],
            amarillasVisita: [],
            rojasLocal: [],
            rojasVisita: []

        };

        if (deporte.value === "futbol" && estado === "Finalizado") {

            const partesUrl = partido.url.split("/");
            const slugPartido = partesUrl[3];

            await obtenerIncidentesFutbol(encuentro, slugPartido);
        }

            //Se filtrará ATP y WTA en los partidos de tenis
        if (deporte.value === "tenis") {

            if (competicion.value === "atp" && partido.competition.startsWith("ATP")) {
                encuentrosAPI.push(encuentro);
            }

            if (competicion.value === "wta" && partido.competition.startsWith("WTA")) {
                encuentrosAPI.push(encuentro);
            }
            
            //Fútbol y basketball ya vienen filtrados por la competición desde la API
        } else {
            encuentrosAPI.push(encuentro);
        }
        

       
    }
    mostrarEncuentros(encuentrosAPI);
   
    
}


//obtener incidencias de los partidos de fútbol en las competiciones: goles, tarjetas amarilla y roja
async function obtenerIncidentesFutbol(encuentro, slugPartido) {

    try {
        
        const respuesta = await fetch (
            `${urlApi}match/?sport=football&slug=${slugPartido}`
        );

        const datosDetalle = await respuesta.json();   

        for (const incidente of datosDetalle.match.incidents) {

            

            // La API identifica los goles de penal como "Penalty goal". Se agrega (P) para diferenciarlos visualmente de los goles normales.
            let textoIncidente = incidente.player + " " + incidente.time + "'";

            if (incidente.type === "Penalty goal") {
                textoIncidente += " (P)";
            }

         if (incidente.type === "Goal" || incidente.type === "Penalty goal") {

            if (incidente.side === "home") {

                encuentro.golesLocal.push(textoIncidente);
            
            } else if (incidente.side === "away") {

                encuentro.golesVisita.push(textoIncidente);
            }

         } else if (incidente.type === "Yellow card") {

            if (incidente.side === "home") {

                encuentro.amarillasLocal.push(textoIncidente);
            
            } else if (incidente.side === "away") {

                encuentro.amarillasVisita.push(textoIncidente);
            }
         
        } else if (incidente.type === "Red card") {

            if (incidente.side === "home") {

                encuentro.rojasLocal.push(textoIncidente);
            
            } else if (incidente.side === "away") {

                encuentro.rojasVisita.push(textoIncidente);
            }
        } 
    }

    } catch (error) {
        console.log("No se pudieron cargar las incidencias", error);
    }
    
}

//Muestra los encuentros obtenidos en tarjetas bootstrap
function mostrarEncuentros(datos) {

    let template = "";

    for (const encuentro of datos) {

        let detalleLocal = "";
        let detalleVisita = "";

        if (encuentro.deporte === "futbol" && encuentro.estado === "Finalizado") {

            for (const gol of encuentro.golesLocal) {
                detalleLocal += `<p class="mb-1">⚽ ${gol}</p>`;
            }

            for (const amarilla of encuentro.amarillasLocal) {
                detalleLocal += `<p class="mb-1">🟨 ${amarilla}</p>`;
            }

            for (const roja of encuentro.rojasLocal) {
                detalleLocal += `<p class="mb-1">🟥 ${roja}</p>`;
            }


            for (const gol of encuentro.golesVisita) {
                detalleVisita += `<p class="mb-1">⚽ ${gol}</p>`;
            }

            for (const amarilla of encuentro.amarillasVisita) {
                detalleVisita += `<p class="mb-1">🟨 ${amarilla}</p>`;
            }

            for (const roja of encuentro.rojasVisita) {
                detalleVisita += `<p class="mb-1">🟥 ${roja}</p>`;
            }
        }

        
        template += `
        
        <div class="card mb-3 shadow rounded-4 border-0">
            <div class ="card-body text-center">
            
            <h5 class="card-title">
                ${encuentro.competicion}
            </h5>
            
             <div class="row align-items-center text-center">

                        <div class="col-4">
                            <img src="${encuentro.logo1}" width="70" alt="${encuentro.participante1}">
                            <p>${encuentro.participante1}</p>

                            ${detalleLocal}
                        </div>

                        <div class="col-4">
                            <strong>${encuentro.resultado}</strong>
                        </div>

                        <div class="col-4">
                            <img src="${encuentro.logo2}" width="70" alt="${encuentro.participante2}">
                            <p>${encuentro.participante2}</p>

                            ${detalleVisita}
                        </div>

                    </div>

                    <p class="text-center">
                        Estado: ${encuentro.estado}
                    </p>

                    <p class="text-center">
                        Fecha: ${encuentro.fecha}
                               
                    </p>    

                   
                    

                </div>
            </div>
        `;

     }

  listaEncuentros.innerHTML = template;
}
 



//Actualiza las competiciones según el deporte seleccionado

deporte.addEventListener("change", function() {

    //La condicional traduce el deporte al valor utlizado por SportScore
    if (deporte.value === "futbol") {

        deporteAPI = "football";

        competicion.innerHTML = ` <option value="chi-liga-de-primera">Liga Chilena</option>
                                  <option value="english-premier-league">Premier League</option> 
                                  <option value="conmebol-copa-libertadores">Copa Libertadores</option>
                                  <option value="conmebol-copa-sudamericana">Copa Sudamericana</option>
                                  <option value="uefa-champions-league">Champions League</option>
                                  `;
    
    
    }

    if (deporte.value === "baloncesto") {

        deporteAPI = "basketball";

        competicion.innerHTML = 
        ` <option value="national-basketball-association">NBA</option>
          <option value="womens-national-basketball-association">WNBA</option>`;
    }
    
    if (deporte.value === "tenis") {
        deporteAPI = "tennis";
        
        competicion.innerHTML = `<option value="atp">ATP</option>
        <option value ="wta">WTA</option> `;

    }

   

});

// Los tres deportes usan el mismo botón y misma función
botonFiltrar.addEventListener("click", function() {
        
    if (fecha.value === "") {

        listaEncuentros.innerHTML = 
        `<div class="alert alert-warning">  
        Selecciona una fecha
        </div> `;
    
    } else {

        obtenerPartidos(fecha.value);
    }
    
});
