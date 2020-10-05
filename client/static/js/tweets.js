const socket = io();

var mainContent = document.getElementById('main-content');

socket.on('tweet', function (tweet) {
    console.log(tweet.tweet);

    // A chaque tweet, on push le contenu dans un tableau
    var tweetbody = {
        'text': tweet.tweet.text,
    }
    try {
    } catch (err) {
    }

    // Puis on affiche le tweet sur la page
    var p = document.createElement('p');
    p.innerHTML = tweetbody.text;
    mainContent.appendChild(p);
})
