// script.js

var apiKey = "38e497c6c1a043d1341416e80915669f";
var repoOwner = "thexxx880";
var repoName = "API";
var filePath = "content/API/JSON/list-movie.JSON";

var seleccionado = null;

var availablePlatforms = [
    "Sin Plataforma", "Prime Video", "Apple TV", "HBO Max", "Disney",
    "Disney JR", "Pixar", "Netflix", "Apple tv", "Fox", "Paramount",
    "Sony", "Sony Animations", "Universal", "Warner Bros", "Marvel",
    "Marvel JR", "Lego", "DC Comics", "LionsGate", "Navidad",
    "DreamWorks", "Cine Cristiano", "Cartoon Networks",
    "Nickelodeon", "Vix", "K-Drama", "Anime"
];

window.onload = function() {
    var t = localStorage.getItem("github_token");
    if (t) {
        document.getElementById("token").value = t;
    }
    cargarPlataformas();
};

function cargarPlataformas() {
    var html = "";
    availablePlatforms.forEach(function(item) {
        html += `<option value="${item}">${item}</option>`;
    });
    document.getElementById("plataforma").innerHTML = html;
}

function guardarToken() {
    var token = document.getElementById("token").value.trim();
    localStorage.setItem("github_token", token);
    mensaje("✅ Token guardado");
}

function buscarTMDB() {
    var q = document.getElementById("buscar").value.trim();
    if (q.length < 2) {
        document.getElementById("resultados").innerHTML = "";
        return;
    }

    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=es&query=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(data => {
            const container = document.getElementById("resultados");
            container.innerHTML = "";

            data.results.forEach(item => {
                const poster = item.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
                    : "https://via.placeholder.com/300x450?text=Sin+Imagen";

                const year = item.release_date ? item.release_date.substring(0, 4) : "----";

                // Crear la card de forma segura
                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
                    <img src="${poster}" alt="${item.title}">
                    <div class="info">
                        <b>${item.title}</b><br>
                        <span class="year">${year}</span>
                    </div>
                `;

                // Evento click de forma correcta (esto soluciona tu problema)
                card.addEventListener("click", () => seleccionar(item));

                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Error en búsqueda TMDB:", err);
            mensaje("❌ Error al buscar películas");
        });
}

function seleccionar(item) {
    seleccionado = item;

    const poster = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : "https://via.placeholder.com/300x450?text=Sin+Imagen";

    document.getElementById("posterModal").src = poster;
    document.getElementById("tituloSel").innerText = item.title || "Sin título";
    document.getElementById("idSel").innerText = `ID TMDB: ${item.id}`;

    // Limpiar campos de enlaces
    document.getElementById("video1").value = "";
    document.getElementById("video2").value = "";
    document.getElementById("video3").value = "";

    // Abrir modal usando clase (más confiable)
    document.getElementById("modal").classList.add("open");
}

function cerrarModal() {
    document.getElementById("modal").classList.remove("open");
}

function publicar() {
    var token = localStorage.getItem("github_token");
    if (!token) {
        mensaje("❌ Guarda primero el token");
        return;
    }

    if (!seleccionado) {
        mensaje("❌ Selecciona una película");
        return;
    }

    var enlace1 = document.getElementById("video1").value.trim();
    var enlace2 = document.getElementById("video2").value.trim();
    var enlace3 = document.getElementById("video3").value.trim();

    if (enlace1 === "") {
        mensaje("❌ Debes pegar mínimo 1 enlace");
        return;
    }

    var plataforma = Array.from(
        document.getElementById("plataforma").selectedOptions
    ).map(op => op.value);

    if (plataforma.length === 0) {
        plataforma = ["Sin Plataforma"];
    }

    fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
        headers: { Authorization: "token " + token }
    })
    .then(r => r.json())
    .then(file => {
        var contenido = atob(file.content.replace(/\n/g, ""));
        var json = JSON.parse(contenido);

        var nuevoItem = {
            id: seleccionado.id,
            enlace: enlace1,
            plataforma: plataforma
        };

        if (enlace2 !== "") nuevoItem.enlace2 = enlace2;
        if (enlace3 !== "") nuevoItem.enlace3 = enlace3;

        json[seleccionado.id] = nuevoItem;

        var nuevoContenido = btoa(unescape(encodeURIComponent(JSON.stringify(json, null, 2))));

        return fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
            method: "PUT",
            headers: {
                Authorization: "token " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `Nuevo contenido publicado: ${seleccionado.title}`,
                content: nuevoContenido,
                sha: file.sha
            })
        });
    })
    .then(r => r.json())
    .then(data => {
        mensaje("✅ Publicado correctamente");
        cerrarModal();
        // Opcional: limpiar búsqueda después de publicar
        // document.getElementById("buscar").value = "";
    })
    .catch(err => {
        console.error(err);
        mensaje("❌ Error al publicar en GitHub");
    });
}

function mensaje(txt) {
    const msgDiv = document.getElementById("msg");
    msgDiv.innerHTML = `<div class="msg">${txt}</div>`;
    msgDiv.classList.add("show");

    // Ocultar mensaje automáticamente después de 4 segundos
    setTimeout(() => {
        msgDiv.classList.remove("show");
    }, 4000);
}
