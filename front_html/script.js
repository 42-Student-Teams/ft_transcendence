document.addEventListener("DOMContentLoaded", function() {
    var ctx = document.getElementById('chart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Body hits', 'Leg hits', 'Head hits'],
            datasets: [{
                label: 'Shot Distribution',
                data: [30.12, 50.12, 20.12],
                backgroundColor: ['#28a745', '#dc3545', '#ffc107']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
});
