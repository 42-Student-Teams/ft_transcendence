import Component from "../../library/component.js";

export default class ChartComponent extends Component {
    constructor() {
        super({ element: document.getElementById("chart") });
        this.render();
    }

    async render() {
        const view = /*html*/ `
        <div class="card p-3 d-flex flex-column align-items-center flex-grow-1">
            <h6 class="mb-3 text-start w-100">WL - LAST 30 GAME</h6>
            <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <canvas id="pie-chart" width="250" height="250"></canvas>
            </div>
            <div class="legend mt-3">
                <ul class="list-unstyled d-flex justify-content-center">
                    <li class="me-3 d-flex align-items-center"><span class="legend-color bg-success d-inline-block me-2" style="width: 20px; height: 20px;"></span> Victory</li>
                    <li class="me-3 d-flex align-items-center"><span class="legend-color bg-danger d-inline-block me-2" style="width: 20px; height: 20px;"></span> Defeat</li>
                    <li class="d-flex align-items-center"><span class="legend-color bg-warning d-inline-block me-2" style="width: 20px; height: 20px;"></span> Something Else</li>
                </ul>
            </div>
        </div>
        `;
		this.element = document.getElementById("chart");
        this.element.innerHTML = view;
		this.handleEvent();
    }

	async handleEvent() {
		
		class PieChart {
            constructor(elementId, data, colors) {
                this.canvas = document.getElementById(elementId);
                this.ctx = this.canvas.getContext('2d');
                this.data = data;
                this.colors = colors;
            }

            draw() {
                const total = this.data.reduce((acc, val) => acc + val, 0);
                let startAngle = 0;

                this.data.forEach((value, index) => {
                    const sliceAngle = (value / total) * 2 * Math.PI;
                    this.drawSlice(this.ctx, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, startAngle, startAngle + sliceAngle, this.colors[index]);
                    startAngle += sliceAngle;
                });
            }

            drawSlice(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fill();
            }
        }

        const data = [30.12, 50.12, 20.12];
        const colors = ['#28a745', '#dc3545', '#ffc107'];
        const pieChart = new PieChart('pie-chart', data, colors);
        pieChart.draw();
	}
}
