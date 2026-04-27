
var apiKey = "38e497c6c1a043d1341416e80915669f";

var repoOwner = "thexxx880";
var repoName = "API";
var filePath = "content/API/JSON/list-movie.JSON";

var seleccionado = null;

var availablePlatforms = [
"Sin Plataforma","Prime Video","Apple TV","HBO Max","Disney",
"Disney JR","Pixar","Netflix","Apple tv","Fox","Paramount",
"Sony","Sony Animations","Universal","Warner Bros","Marvel",
"Marvel JR","Lego","DC Comics","LionsGate","Navidad",
"DreamWorks","Cine Cristiano","Cartoon Networks",
"Nickelodeon","Vix","K-Drama","Anime"
];

window.onload = function(){

var t = localStorage.getItem("github_token");

if(t){
document.getElementById("token").value = t;
}

cargarPlataformas();

}

function cargarPlataformas(){

var html = "";

availablePlatforms.forEach(function(item){
html += '<option value="'+item+'">'+item+'</option>';
});

document.getElementById("plataforma").innerHTML = html;

}

function guardarToken(){

var token = document.getElementById("token").value.trim();

localStorage.setItem("github_token", token);

mensaje("✅ Token guardado");

}

function buscarTMDB(){

var q = document.getElementById("buscar").value.trim();

if(q.length < 2){
document.getElementById("resultados").innerHTML = "";
return;
}

fetch("https://api.themoviedb.org/3/search/movie?api_key="+apiKey+"&language=es&query="+encodeURIComponent(q))
.then(function(r){
return r.json();
})
.then(function(data){

var html = "";

data.results.forEach(function(item){

var poster = item.poster_path ?
"https://image.tmdb.org/t/p/w500"+item.poster_path :
"https://via.placeholder.com/300x450?text=Sin+Imagen";

var year = item.release_date ? item.release_date.substring(0,4) : "----";

html += `
<div class="card" onclick='seleccionar(${JSON.stringify(item)})'>
<img src="${poster}">
<div class="info">
<b>${item.title}</b><br>
${year}
</div>
</div>
`;

});

document.getElementById("resultados").innerHTML = html;

});

}

function seleccionar(item){

seleccionado = item;

var poster = item.poster_path ?
"https://image.tmdb.org/t/p/w500"+item.poster_path :
"https://via.placeholder.com/300x450?text=Sin+Imagen";

document.getElementById("posterModal").src = poster;
document.getElementById("tituloSel").innerText = item.title;
document.getElementById("idSel").innerText = "ID TMDB: "+item.id;

document.getElementById("video1").value = "";
document.getElementById("video2").value = "";
document.getElementById("video3").value = "";

document.getElementById("modal").style.display = "flex";

}

function cerrarModal(){
document.getElementById("modal").style.display = "none";
}

function publicar(){

var token = localStorage.getItem("github_token");

if(!token){
mensaje("❌ Guarda primero el token");
return;
}

if(!seleccionado){
mensaje("❌ Selecciona película");
return;
}

var enlace1 = document.getElementById("video1").value.trim();
var enlace2 = document.getElementById("video2").value.trim();
var enlace3 = document.getElementById("video3").value.trim();

if(enlace1==""){
mensaje("❌ Debes pegar mínimo 1 enlace");
return;
}

var plataforma = Array.from(
document.getElementById("plataforma").selectedOptions
).map(function(op){
return op.value;
});

if(plataforma.length==0){
plataforma = ["Sin Plataforma"];
}

fetch("https://api.github.com/repos/"+repoOwner+"/"+repoName+"/contents/"+filePath,{
headers:{
Authorization:"token "+token
}
})
.then(function(r){
return r.json();
})
.then(function(file){

var contenido = atob(file.content.replace(/\n/g,""));
var json = JSON.parse(contenido);

var nuevoItem = {
id: seleccionado.id,
enlace: enlace1,
plataforma: plataforma
};

if(enlace2!=""){
nuevoItem.enlace2 = enlace2;
}

if(enlace3!=""){
nuevoItem.enlace3 = enlace3;
}

json[seleccionado.id] = nuevoItem;

var nuevo = btoa(unescape(encodeURIComponent(JSON.stringify(json,null,2))));

return fetch("https://api.github.com/repos/"+repoOwner+"/"+repoName+"/contents/"+filePath,{
method:"PUT",
headers:{
Authorization:"token "+token,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"Nuevo contenido publicado "+seleccionado.title,
content:nuevo,
sha:file.sha
})
});

})
.then(function(r){
return r.json();
})
.then(function(data){

mensaje("✅ Publicado correctamente");
cerrarModal();

})
.catch(function(err){

mensaje("❌ Error al publicar");
console.log(err);

});

}

function mensaje(txt){

document.getElementById("msg").innerHTML =
'<div class="msg">'+txt+'</div>';

}