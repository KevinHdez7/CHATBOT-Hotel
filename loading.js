document.addEventListener("DOMContentLoaded", function() {
    const loadingScreen = document.getElementById("loadingScreen");

    // Ocultar la pantalla de carga después de 2 segundos o cuando todo esté listo
    setTimeout(() => {
        loadingScreen.classList.add("hidden");
    }, 2000); // Puedes ajustar el tiempo de espera según tus necesidades
});
