import Component from "../../library/component.js";

export default class ChartComponent extends Component {
    constructor() {
        super({ element: document.getElementById("chart") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
            <div class="card p-3 flex-grow-1 d-flex flex-column">
                <h6 class="mb-3">WL - LAST 30 GAME</h6>
                <div class="chart-container flex-grow-1">
                    <canvas id="chart"></canvas>
                </div>
            </div>
        `;

        this.element.innerHTML = view;
        this.initializeChart();
    }

    initializeChart() {
        var ctx = document.getElementById('chart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Victory', 'Defeat', 'smth else'],
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
    }
}
