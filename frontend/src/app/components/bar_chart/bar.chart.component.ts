import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar.chart.component.html',
    styleUrls: ['./bar.chart.component.scss'],
})
export class BarChartComponent implements OnInit, OnChanges {

    public chartOptions = { responsive: true };

    public chartData: Array<{ data: any[], label: string }>;

    @Input("dataLabel") dataLabel: string;

    @Input("data") data: Array<number | string>;

    @Input("chartLabels") chartLabels: string[];

    constructor() { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data) {
            
            if (this.data)
                this.chartData = [{ data: this.data, label: this.dataLabel }];
        }
    }
}
