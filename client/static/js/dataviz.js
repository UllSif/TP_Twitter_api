var ctx = document.getElementById('myChart').getContext('2d');
var socket = io();

fetch('./api/capteurs/hum')
    .then(function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
                response.status);
            return;
        }
        response.json().then(function (data) {
            var x = []
            var y = []

            data.forEach(function (value) {
                x.push(value.timestamp);
                y.push(value.value);
            })

            var chart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'line',

                // The data for our dataset
                data: {
                    labels: x,
                    datasets: [{
                        label: 'My First dataset',
                        backgroundColor: 'rgb(255, 99, 132)',
                        borderColor: 'rgb(255, 99, 132)',
                        data: y
                    }]
                },

                // Configuration options go here
                options: {}
            });
            // console.log(chart);
            socket.on('humChange', function (msg) {
                console.log(msg);
                console.log(msg.newHum);
                addData(chart, Date.now(), msg.newHum)
            })
        })

    })
    .catch(function (err) {
        console.log('Fetch Error :-S', err);
    });

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}
