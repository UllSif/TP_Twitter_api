const socket = io();

var background = document.getElementById('background');

// Changer la couleur du background
socket.on('backgroundColor', function (color) {
    // On récupère le texte des tweets et on change la couleur
    background.style.backgroundColor = color.newColor;
})
