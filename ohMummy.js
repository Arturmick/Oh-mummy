const tablero = [];
const filas = 13;
const columnas = 21;
const premios = {
    llave: true,
    cofre: true,
    potion: true,
    sarcofago: true,
    momiaPremio: true
};
let verificacionCasilla = [];
let imagenSalida;
let vidas = 5;
let nivel = 1;
let puntuacion = 0;
let inicio = true;
let reinicio = true;
let cartelStart = 1;

let bloquesTesoros = [20]; bloquesTesoros.fill(false);    
let potion = false;
let llave = false;
let sarcofago = false;
let premiosAleatoriedad = ['llave', 'cofre', 'cofre', 'cofre', 'cofre', 'cofre', 'cofre', 'cofre', 'cofre', 'cofre', 'cofre', 'cofre', 'potion', 'sarcofago', 'momiaPremio', 'nada', 'nada', 'nada', 'nada', 'nada'];
let elementos = [
    { tipo: 'llave', cantidad: 1 },
    { tipo: 'cofre', cantidad: 11 },
    { tipo: 'potion', cantidad: 1 },
    { tipo: 'sarcofago', cantidad: 1 },
    { tipo: 'momiaPremio', cantidad: 1 },
    { tipo: 'nada', cantidad: 5 } 
];

let intervaloMomia = [];
let pasoDerechoMomia = [true];
let posicionMomia = [];
let numeroMomias = 1; 
let tiempoMomia = 1000;
let direccionMomia = [];

let pasoDerechoPersonaje = true;
let posicionPersonaje = { fila: 0, columna: 10 }; 
let velocidadPersonaje = 200;

let backgroundMusic = new Audio('Musica/ohmummy.mp3');
backgroundMusic.loop = true;
backgroundMusic.muted =  false;

/***************************** CARGA PRINCIPALES FUNCIONES ***************************/

document.addEventListener('DOMContentLoaded', () => {
    
    cargarPartida(); //Comprueba si hay elementos guardados en el localStorage
    bienvenida() //Muestra la pantalla de start y hace que empiece la música de fondo
    //juego(); //Carga el juego directamente    
    cargarEventos(); //Carga los eventos del juego  
});

function cargarEventos() {
    if (typeof empezar !== 'undefined') {
        empezar.addEventListener('click', () => {
            eventosStart();              
        });
        document.addEventListener( 'keydown', (evento) => {
        if (evento.key === 'Enter') {
            eventosStart();            
        }
    });
    
    }    
    document.addEventListener('click', (evento) => {
        if (evento.target.classList.contains('celda')) {
            console.log(`Clicked on cell at position: ${evento.target.dataset.position}`);
            console.log(verificacionCasilla[evento.target.dataset.position.split(' ')[0]][evento.target.dataset.position.split(' ')[1]]);
        
        }
    });
    
    document.getElementById('salir').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas salir del juego?\nLos datos no se guardarán')) {
            localStorage.clear();
            window.close();
        }    
        
    });
    document.getElementById('reiniciar').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas reiniciar el juego?\nLos datos no se guardarán')) {
            localStorage.clear();
            window.location.reload();
        }    
        
    });
    document.getElementById('silenciar').addEventListener('click', () => {
        
        if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
        } else {
            backgroundMusic.muted = true;   
        }        
        document.getElementById('silenciar').classList.toggle('pulsado');
        document.getElementById('silenciar').classList.toggle('noPulsado');   
    });

    document.addEventListener('keydown', throttle(mecanicas,velocidadPersonaje));
}

/************************************* EMPEZAR PARTIDA ************************/

function eventosStart() {
    
    protector.classList.remove('protector');
    mochila.classList.remove('opacidad');
    nivelStart.classList.remove('opacidad');
    backgroundMusic.play(); // Reproduce la música de fondo 
    empezar.remove();
    empezar2.remove(); 
    nivelCartel.remove(); 
    cartelStart = false;  
    juego();
     
}
function cargarPartida() {
    if (localStorage.getItem('puntuacion') !== null) {
        puntuacion = parseInt(localStorage.getItem('puntuacion'));
        marcador1.innerHTML = puntuacion.toString().padStart(8, '0');
        vidas = parseInt(localStorage.getItem('vidas')); 
        numeroMomias = parseInt(localStorage.getItem('numeroMomias'));
        nivel = parseInt(localStorage.getItem('nivel'));
        cartelStart = parseInt(localStorage.getItem('cartelStart'));
        
    }
}
function bienvenida() {
    const imgDos = document.createElement('img');
    const img = document.createElement('img');
    const div = document.createElement('div');
    div.innerText =  `Nivel ${nivel}`;
    imgDos.src = 'Fotos/cartel2.png';
    img.src = 'Fotos/start.png';
    imgDos.classList.add('empezar2');
    img.classList.add('empezar');   
    img.id = 'empezar';
    imgDos.id = 'empezar2';
    div.id = 'nivelCartel';
    document.body.appendChild(img);
    document.body.appendChild(imgDos);
    document.body.appendChild(div);
    protector.classList.add('protector'); 
    cartelStart = 0;
}

/*********************************** INICIAR TABLERO ***************************/

function juego() {    
    crearTablero(); //Crea las casillas del tablero
    colocarPremios(); //Coloca los premios en el tablero
    inicializarVerificacionCasilla(); //Inicializa la matriz de verificación de casillas, es una matriz de booleanos para saber si el personaje ha pasado por una casilla
    anadirMomias(); //Añade las momias al tablero
    comprobarNivel(); //Comprueba el nivel en el que se encuentra el jugador y cambia el texto
    anadirVidas();    //Añade las vidas al marcador
}
function crearTablero() {    

    for (let i = 0; i < filas; i++) {
        const fila = [];
        
        for (let j = 0; j < columnas; j++) {
            const celda = document.createElement('div');
            celda.classList.add('celda');
            celda.dataset.position = `${i} ${j}`;
            if (j % 4 === 0 || i % 3 === 0) {
                celda.classList.add('pasillo');
            }
            pantalla.appendChild(celda);
            fila.push(celda);
            
        }
        tablero.push(fila);
        
    }
             
}
function colocarPremios() {
    
    for (let i = 1; i <= 10; i += 3) {
        for (let j = 2; j <= 18; j += 4) {
            if (premiosAleatoriedad.length > 0) {
                const index = Math.floor(Math.random() * premiosAleatoriedad.length);
                const premio = premiosAleatoriedad[index];                
                
                tablero[i][j-1].classList.add(premio + '11', 'oculto');
                tablero[i][j].classList.add(premio + '12', 'oculto');
                tablero[i][j+1].classList.add(premio + '13', 'oculto');
                tablero[i+1][j-1].classList.add(premio + '21', 'oculto');
                tablero[i+1][j].classList.add(premio + '22', 'oculto');
                tablero[i+1][j+1].classList.add(premio + '23', 'oculto');
                
                premiosAleatoriedad.splice(index, 1);                
            }
        }
    }
}
function inicializarVerificacionCasilla() {
    verificacionCasilla = [];
    for (let i = 0; i < filas; i++) {
        verificacionCasilla[i] = [];
        for (let j = 0; j < columnas; j++) {
            verificacionCasilla[i][j] = false;
        }
    }
}
function anadirMomias() {
    let fila;
    let columna;
    for (let i = 0; i <= numeroMomias-1; i++) {        
        console.log(numeroMomias);
        console.log(i);
        //obtengo una posicion aleatoria en una intersección, así las momias no se quedan atascadas en una recta puesto que la decisión 
        //de movimiento es en las esquinas
        do {
            fila = Math.floor(Math.random() * filas);
            columna = Math.floor(Math.random() * columnas);
        } while (!tablero[fila][columna].classList.contains('pasillo') || fila % 3 !== 0 || columna % 4 !== 0);

        posicionMomia.push({ fila: fila, columna: columna });
        tablero[posicionMomia[i].fila][posicionMomia[i].columna].classList.add('momia1');
        iniciarMovimientoMomia(i);
        
    }
}
function comprobarNivel() {
    const nivelElement = document.getElementById('nivelStart');
    nivelElement.innerText = `Nivel ${nivel}`;
}
function anadirVidas() {    
    
    for (let i = 1; i <= vidas; i++) {  
        let img = document.createElement('img');   
        img.src = 'Fotos/vida.png';       
        marcador2.appendChild(img);
    }       
}
function iniciarMovimientoMomia(numMomia) {
    const mochila = document.getElementById('mochila');
    const imgs = mochila.getElementsByTagName('img');

    intervaloMomia[numMomia]= setInterval(() => {        
        moverMomia(numMomia); 
          
        if(comprobarColision(posicionMomia[numMomia]) && potion) {

            for (let i = 0; i < imgs.length; i++) {
                if (imgs[i].src.includes('Fotos/potion.png')) {
                    mochila.removeChild(imgs[i]);
                    break;
                }
            }
            matarMomia();
        }else if(comprobarColision(posicionMomia[numMomia])) {
            morirPersonaje();
        }
    }, tiempoMomia); 
}

/*********************************** FUNCIONES Y MECANICAS DE JUEGO ***************************/

function mecanicas(evento) { 
    const mochila = document.getElementById('mochila');
    const imgs = mochila.getElementsByTagName('img');

    let pasos = "";
    let orientacionPersonaje = "";
    let animacionPersonaje = "";  
    let nuevaColumnaPersonaje = posicionPersonaje.columna;
    let nuevaFilaPersonaje = posicionPersonaje.fila; 
    let movimientoValido = false;

    //La primera vez que se pulsa la flecha hacia abajo, se elimina la imagen de la salida y se añade el personaje dentro del tablero
    if (evento.key === 'ArrowDown' && inicio) { 
        
        salida.classList.add('opacidad');
        document.getElementById('salida').querySelector('img').remove();               
        tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.add('personaje1', 'pasos3'); 
        verificacionCasilla[posicionPersonaje.fila][posicionPersonaje.columna] = true; 
        inicio = false;        
    }
    if (evento.key === 'ArrowDown' && !inicio) {
        if (posicionPersonaje.fila < 12 && posicionPersonaje.columna % 4 === 0) {   

            pasos = 'pasos3';    
            orientacionPersonaje = 'personaje3';
            animacionPersonaje = 'entrarPorArribaPersonaje';
            nuevaFilaPersonaje += 1;  
            movimientoValido = true; 
        }
    }
    if (evento.key === 'ArrowUp'  && !inicio){
        if (posicionPersonaje.fila > 0 && posicionPersonaje.columna % 4 === 0) {   

            pasos = 'pasos4';   
            orientacionPersonaje = 'personaje4';
            animacionPersonaje = 'entrarPorAbajoPersonaje'; 
            nuevaFilaPersonaje -= 1; 
            movimientoValido = true;    
        }            
    }
    if (evento.key === 'ArrowLeft' && !inicio){
        if (posicionPersonaje.columna > 0 && posicionPersonaje.fila % 3 === 0) {   

            pasos = 'pasos2';   
            orientacionPersonaje = 'personaje2';
            animacionPersonaje = 'entrarPorDerechaPersonaje';  
            nuevaColumnaPersonaje -= 1; 
            movimientoValido = true      
        }
    }
    if (evento.key === 'ArrowRight' && !inicio){
        if (posicionPersonaje.columna < 20 && posicionPersonaje.fila % 3 === 0) {   

            pasos = 'pasos1'; 
            orientacionPersonaje = 'personaje1';
            animacionPersonaje = 'entrarPorIzquierdaPersonaje'; 
            nuevaColumnaPersonaje += 1; 
            movimientoValido = true;
        }
    }
    if (movimientoValido) {
        quitarClasesPersonaje();
        posicionPersonaje = { fila: nuevaFilaPersonaje, columna: nuevaColumnaPersonaje };           
        comprobarCondicionVictoria();
        verificarCasilla(); //Verifica si el personaje ha rodeado un bloque de premios         
        cambiarSpritePersonaje(orientacionPersonaje, animacionPersonaje);
        movimientoValido = false;
        anadirPasos(pasos);

        if(comprobarColision(posicionPersonaje) && potion) {
            
            for (let i = 0; i < imgs.length; i++) {
                if (imgs[i].src.includes('Fotos/potion.png')) {
                mochila.removeChild(imgs[i]);
                break;
            }
        }
            matarMomia();            
        }else if(comprobarColision(posicionPersonaje)) {
            morirPersonaje();
        }        
    }    
}
function matarMomia() {   
    let index = posicionMomia.findIndex(momia => momia.fila === posicionPersonaje.fila && momia.columna === posicionPersonaje.columna);    
    quitarClasesMomia(index);
    console.log('Muerte a la momia');    
    clearInterval(intervaloMomia[index]);
    posicionMomia[index] = null;
    potion = false;
    numeroMomias--;
}
function morirPersonaje() {    
    console.log('Muerte al personaje');
    vidas--;
    marcador2.querySelector('img').remove();    
    quitarClasesPersonaje();
    casillaSalida();
    if (vidas === 0) {
        gameOver();
    }
}
function verificarCasilla() {

    verificacionCasilla[posicionPersonaje.fila][posicionPersonaje.columna] = true;
    
    comprobarCeldasRodeadas();
}
function comprobarCeldasRodeadas() {

    //Primero compruebo una celda en medio de 4 premios, si es true compruebo cada esquina de esos premios y si da true compruebo todas las celdas que rodean ese premio en concreto

    const bloques = [
        { fila: 0, col: 0, index: 0 },
        { fila: 0, col: 4, index: 1 },
        { fila: 3, col: 0, index: 5 },
        { fila: 3, col: 4, index: 6 },

        { fila: 6, col: 0, index: 10 },
        { fila: 6, col: 4, index: 11 },
        { fila: 9, col: 0, index: 15 },
        { fila: 9, col: 4, index: 16 },

        { fila: 0, col: 8, index: 2 },
        { fila: 0, col: 12, index: 3 },
        { fila: 3, col: 8, index: 7 },
        { fila: 3, col: 12, index: 8 },

        { fila: 6, col: 8, index: 12 },
        { fila: 6, col: 12, index: 13 },
        { fila: 9, col: 8, index: 17 },
        { fila: 9, col: 12, index: 18 },

        { fila: 0, col: 16, index: 4 },        
        { fila: 3, col: 16, index: 9 },
        
        { fila: 6, col: 16, index: 14 },        
        { fila: 9, col: 16, index: 19 }        
    ];

    bloques.forEach(bloque => {        
              
        if ((verificacionCasilla[3][4] == true && verificacionCasilla[bloque.fila][bloque.col] == true && !bloquesTesoros[bloque.index]) 
            && comprobarBloques(bloque.fila, bloque.col)) {

            gestionarPremio(bloque.fila, bloque.col, bloque.index);
            
        }
        if ((verificacionCasilla[9][4] == true && verificacionCasilla[bloque.fila][bloque.col] == true && !bloquesTesoros[bloque.index]) 
            && comprobarBloques(bloque.fila, bloque.col)) {

             gestionarPremio(bloque.fila, bloque.col, bloque.index); 
            
        }
        if ((verificacionCasilla[3][12] == true && verificacionCasilla[bloque.fila][bloque.col] == true && !bloquesTesoros[bloque.index]) 
            && comprobarBloques(bloque.fila, bloque.col)) {

            gestionarPremio(bloque.fila, bloque.col, bloque.index);      
            
        }
        if ((verificacionCasilla[9][12] == true && verificacionCasilla[bloque.fila][bloque.col] == true && !bloquesTesoros[bloque.index]) 
            && comprobarBloques(bloque.fila, bloque.col)) {

            gestionarPremio(bloque.fila, bloque.col, bloque.index);
            
        }
        if ((verificacionCasilla[3][20] == true && verificacionCasilla[bloque.fila][bloque.col] == true && !bloquesTesoros[bloque.index])
            && comprobarBloques(bloque.fila, bloque.col)) {

            gestionarPremio(bloque.fila, bloque.col, bloque.index);
            
        }
        if ((verificacionCasilla[9][20] == true && verificacionCasilla[bloque.fila][bloque.col] == true && !bloquesTesoros[bloque.index])
            && comprobarBloques(bloque.fila, bloque.col)) {
            gestionarPremio(bloque.fila, bloque.col, bloque.index);
            
        }
    });
}
function comprobarBloques(num1,num2) {
   //Compruebo si las casillas que rodean el bloque están en true ( ya ha pasado por ellas el personaje)
    if (verificacionCasilla[num1][num2 + 1] == true &&
        verificacionCasilla[num1][num2 + 2] == true &&
        verificacionCasilla[num1][num2 + 3] == true &&
        verificacionCasilla[num1][num2 + 4] == true &&
        verificacionCasilla[num1 + 1][num2] == true &&
        verificacionCasilla[num1 + 1][num2 + 4] == true &&
        verificacionCasilla[num1 + 2][num2] == true &&
        verificacionCasilla[num1 + 2][num2 + 4] == true &&
        verificacionCasilla[num1 + 3][num2] == true &&
        verificacionCasilla[num1 + 3][num2 + 1] == true &&
        verificacionCasilla[num1 + 3][num2 + 2] == true &&
        verificacionCasilla[num1 + 3][num2 + 3] == true &&
        verificacionCasilla[num1 + 3][num2 + 4] == true) {
        
        return true;
    }    
    return false;
}
function gestionarPremio(fila, col, index) {
    bloquesTesoros[index] = true; //Pongo ese tesoro a true para que no vuelva a comprobarlo
    console.log(`Rodeado ${index}`);
    quitarOculto(fila, col); 
    comprobarPremio(fila, col);    
}
function comprobarPremio(fila, columna) {
    const img = document.createElement('img');
    let objeto = "";

    if (tablero[fila + 1][columna + 1].classList.contains('llave11')) {
        llave = true;
        console.log('llave');
        objeto = 'llave';
    } else if (tablero[fila + 1][columna + 1].classList.contains('cofre11')) {
        puntuacion += 100;
        marcador1.innerHTML = puntuacion.toString().padStart(8, '0');
        console.log('cofre');        
    } else if (tablero[fila + 1][columna + 1].classList.contains('potion11')) {
        potion = true;
        console.log('potion');
        objeto = 'potion';
    } else if (tablero[fila + 1][columna + 1].classList.contains('sarcofago11')) {
        sarcofago = true;
        console.log('sarcofago');
        objeto = 'sarcofago';
    }else if (tablero[fila + 1][columna + 1].classList.contains('momiaPremio11')) {
        console.log('momiaPremio');
        numeroMomias++;

        posicionMomia.push({ fila: fila + 3, columna: columna });
        console.log(posicionMomia[posicionMomia.length - 1]);

        //Lo he hecho así para aprender el funcionamiento se setTimeOut, es la animación de la momia que aparece en el tablero
        setTimeout(() => {
            tablero[fila + 2][columna + 1].classList.remove('momiaPremio21');
            tablero[fila + 2][columna + 1].classList.add('momiaPremio21a');
            setTimeout(() => {
                tablero[fila + 2][columna + 1].classList.remove('momiaPremio21a');
                tablero[fila + 2][columna + 1].classList.add('momiaPremio21b');                
                setTimeout(() => {
                    tablero[fila + 3][columna + 1].classList.add('momia3r', 'entrarPorArriba');
                    setTimeout(() => {
                        tablero[fila + 3][columna + 1].classList.remove('momia3r', 'entrarPorArriba');
                        tablero[fila + 3][columna].classList.add('momia2r', 'entrarPorDerecha');
                        setTimeout(() => {
                            tablero[posicionMomia[posicionMomia.length - 1].fila][posicionMomia[posicionMomia.length - 1].columna].classList.add('momia1'); 
                            iniciarMovimientoMomia(posicionMomia.length - 1); 
                        }, 300);
                    }, 700);                    
                }, 700);
            }, 300);
        }, 300);
        
               
    }else {
        console.log('Nada');

    }

    if(objeto !== "") {
        img.src = `Fotos/${objeto}.png`;
        mochila.appendChild(img);
    }    
}
function comprobarCondicionVictoria() {
    if(llave && sarcofago) {        
        setInterval(() => {        
            pasarNivel();        
        }, 1000);
        }
}
//Cambia la posición del personaje la primera vez, de la casilla de salida a dentro del tablero
function casillaSalida() {
    const img = document.createElement('img');

    salida.classList.remove('oculto');
    salida.classList.remove('opacidad');
    inicio = true;
    posicionPersonaje = { fila: 0, columna: 10 }; 
    
    img.src = 'Fotos/personaje/personaje3.png';     
    document.getElementById('salida').appendChild(img);   
}
function pasarNivel() {
    
    salida.classList.remove('opacidad');
    
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'ArrowUp' && reinicio === true && posicionPersonaje.fila === 0 && posicionPersonaje.columna === 10) {                 
            reinicio = false;
            cambiarNivel();  
        }
    });
    
}
function cambiarNivel() {
    nivel++;
    numeroMomias++;
    localStorage.setItem('nivel', nivel);
    localStorage.setItem('puntuacion', puntuacion);
    localStorage.setItem('vidas', vidas);
    localStorage.setItem('numeroMomias', numeroMomias);
    localStorage.setItem('cartelStart', cartelStart);
    window.location.reload();
}
function comprobarColision(posicion) {
    
    const { fila, columna } = posicion;
    if (tablero[fila][columna].classList.contains('personaje1') || 
        tablero[fila][columna].classList.contains('personaje2') || 
        tablero[fila][columna].classList.contains('personaje3') || 
        tablero[fila][columna].classList.contains('personaje4') ||
        tablero[fila][columna].classList.contains('personaje1r') || 
        tablero[fila][columna].classList.contains('personaje2r') || 
        tablero[fila][columna].classList.contains('personaje3r') || 
        tablero[fila][columna].classList.contains('personaje4r')) {
        if (tablero[fila][columna].classList.contains('momia1') || 
            tablero[fila][columna].classList.contains('momia2') || 
            tablero[fila][columna].classList.contains('momia3') || 
            tablero[fila][columna].classList.contains('momia4') ||
            tablero[fila][columna].classList.contains('momia1r') || 
            tablero[fila][columna].classList.contains('momia2r') || 
            tablero[fila][columna].classList.contains('momia3r') || 
            tablero[fila][columna].classList.contains('momia4r')) {
        
            return true;
        }
    }
    return false;
}
function gameOver() {
    
    protector.classList.add('protector');   
    
    const img = document.createElement('img');
    img.classList.add('gameOver');  
    img.src = 'Fotos/gameOver2.png';  
    document.body.appendChild(img);
    document.removeEventListener('keydown', mecanicas);

    const submenu = document.getElementById('submenu');
    Array.from(submenu.children).forEach(child => {
        child.classList.add('zindex');
    });  
}

/************************************** MOVIMIENTO MOMIA ************************/

function moverMomia(numMomia) {  
        
    let nuevaFila = posicionMomia[numMomia].fila;
    let nuevaColumna = posicionMomia[numMomia].columna;   

    calculoDireccion(numMomia); 

    if (direccionMomia[numMomia] === 'ArrowUp') {
        nuevaFila -= 1;
    } else if (direccionMomia[numMomia] === 'ArrowDown') {
        nuevaFila += 1;
    } else if (direccionMomia[numMomia] === 'ArrowLeft') {
        nuevaColumna -= 1;
    } else if (direccionMomia[numMomia] === 'ArrowRight') {
        nuevaColumna += 1;
    }

    if (tablero[nuevaFila] && tablero[nuevaFila][nuevaColumna] && tablero[nuevaFila][nuevaColumna].classList.contains('pasillo')) {
        quitarClasesMomia(numMomia);             
        posicionMomia[numMomia] = { fila: nuevaFila, columna: nuevaColumna }; 
        cambiarSpriteMomia(`momia${direccionMomia[numMomia] === 'ArrowUp' ? 4 : direccionMomia[numMomia] === 'ArrowDown' ? 3 : direccionMomia[numMomia] === 'ArrowLeft' ? 2 : 1}`,
             `entrarPor${direccionMomia[numMomia] === 'ArrowUp' ? 'Abajo' : direccionMomia[numMomia] === 'ArrowDown' ? 'Arriba' : direccionMomia[numMomia] === 'ArrowLeft' ? 'Derecha' : 'Izquierda'}`,
              nuevaFila, nuevaColumna,numMomia);            
    }    
}
//calculo la dirección de la momia en función de la posición en la que se encuentre, evitando que se salga del tablero
function calculoDireccion(numMomia) {
    const direcciones = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];    

    if (posicionMomia[numMomia].fila === 0 && posicionMomia[numMomia].columna === 0) {
        direccionMomia[numMomia] = direcciones.filter(d => d !== 'ArrowUp' && d !== 'ArrowLeft')[Math.floor(Math.random() * 2)];
    } else if (posicionMomia[numMomia].fila === 12 && posicionMomia[numMomia].columna === 0) {
        direccionMomia[numMomia] = direcciones.filter(d => d !== 'ArrowDown' && d !== 'ArrowLeft')[Math.floor(Math.random() * 2)];
    } else if (posicionMomia[numMomia].fila === 12 && posicionMomia[numMomia].columna === 20) {
        direccionMomia[numMomia] = direcciones.filter(d => d !== 'ArrowDown' && d !== 'ArrowRight')[Math.floor(Math.random() * 2)];
    } else if (posicionMomia[numMomia].fila === 0 && posicionMomia[numMomia].columna === 20) {
        direccionMomia[numMomia] = direcciones.filter(d => d !== 'ArrowUp' && d !== 'ArrowRight')[Math.floor(Math.random() * 2)];
    } else if (posicionMomia[numMomia].fila === 0 && posicionMomia[numMomia].columna % 4 === 0) {
        direccionMomia[numMomia] = direcciones.filter(d => d !== 'ArrowUp')[Math.floor(Math.random() * (direcciones.length - 1))];
    } else if (posicionMomia[numMomia].fila === 12 && posicionMomia[numMomia].columna % 4 === 0) {
        direccionMomia[numMomia] = direcciones.filter(d => d !== 'ArrowDown')[Math.floor(Math.random() * (direcciones.length - 1))];
    } else if (posicionMomia[numMomia].fila % 3 === 0 && posicionMomia[numMomia].columna === 0) {
        direccionMomia[numMomia] = direcciones.filter(d => d !== 'ArrowLeft')[Math.floor(Math.random() * (direcciones.length - 1))];
    } else if (posicionMomia[numMomia].fila % 3 === 0 && posicionMomia[numMomia].columna === 20) {
        direccionMomia[numMomia] = direcciones.filter(d => d !== 'ArrowRight')[Math.floor(Math.random() * (direcciones.length - 1))];
    } else if (posicionMomia[numMomia].fila % 3 === 0 && posicionMomia[numMomia].columna % 4 === 0) {
        direccionMomia[numMomia] = direcciones[Math.floor(Math.random() * direcciones.length)];
    }

    return direccionMomia[numMomia];
}

/***************************************** CAMBIO DE SPRITES Y EFECTOS MOVIMIENTO POR TABLERO ***************************/

function cambiarSpritePersonaje (sprite, animacion) {

    if(pasoDerechoPersonaje){
        tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.add(sprite);
    }else {
        tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.add(sprite + 'r');
    }    
    pasoDerechoPersonaje = !pasoDerechoPersonaje;

    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.add(animacion);
}

function cambiarSpriteMomia (sprite, animacion, fila, columna, numMomia) {
    if (pasoDerechoMomia[numMomia]) {
        tablero[fila][columna].classList.add(sprite);
    } else {
        tablero[fila][columna].classList.add(sprite + 'r');
    }
    pasoDerechoMomia[numMomia] = !pasoDerechoMomia[numMomia];
    tablero[posicionMomia[numMomia].fila][posicionMomia[numMomia].columna].classList.add(animacion);    
}
function quitarClasesPersonaje() {
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('personaje4');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('personaje1');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('personaje2');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('personaje3');

    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('personaje4r');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('personaje1r');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('personaje2r');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('personaje3r');

    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('entrarPorArribaPersonaje');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('entrarPorAbajoPersonaje');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('entrarPorDerechaPersonaje');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('entrarPorIzquierdaPersonaje');    
}
function quitarClasesMomia(index) {
    
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('momia1');
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('momia2');
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('momia3');
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('momia4');

    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('momia1r');
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('momia2r');
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('momia3r');
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('momia4r');

    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('entrarPorArriba');
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('entrarPorAbajo');
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('entrarPorDerecha');
    tablero[posicionMomia[index].fila][posicionMomia[index].columna].classList.remove('entrarPorIzquierda');
}
function anadirPasos(pasos) {
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('pasos1');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('pasos2');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('pasos3');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.remove('pasos4');
    tablero[posicionPersonaje.fila][posicionPersonaje.columna].classList.add(pasos);
    
}
function quitarOculto(fila, columna) {
    tablero[fila + 1][columna + 1].classList.remove('oculto');
    tablero[fila + 1][columna + 2].classList.remove('oculto');
    tablero[fila + 1][columna + 3].classList.remove('oculto');
    tablero[fila + 2][columna + 1].classList.remove('oculto');
    tablero[fila + 2][columna + 2].classList.remove('oculto');
    tablero[fila + 2][columna + 3].classList.remove('oculto');
}

/******************* FUNCION POR DEFECTO NECEASRIA PARA CONTROLAR LA VELOCIDAD MÁXIMA DEL PERSONAJE *******************/

function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}
