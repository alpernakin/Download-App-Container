import { Component, OnInit, ViewChild } from '@angular/core';
import { DownloadService } from 'src/app/services/download.service';
import { BarChartComponent } from 'src/app/components/bar_chart/bar.chart.component';
import { KeyValuePair } from 'src/app/models/response.models';

@Component({
    selector: 'app-monthly',
    templateUrl: './monthly.tab.page.html',
    styleUrls: ['./monthly.tab.page.scss'],
})
export class MonthlyTabPage implements OnInit {

    private readonly months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // set to the current date
    public dateString = new Date().toISOString();

    /** download numbers for each month */
    public chartData: number[];

    @ViewChild(BarChartComponent, { static: false }) chartComponent: BarChartComponent;

    constructor(
        private download: DownloadService) { }

    ngOnInit() {

        this.loadData();
    }

    ionViewDidEnter() {

    }

    public onDateChangedCallback(_event: any) {

        this.loadData();
    }

    public getYearFromDate(dateString: string): number {
        return new Date(dateString).getFullYear()
    }

    public loadData() {
        this.download.getMonthlyDownloads(this.getYearFromDate(this.dateString))
            .subscribe(data => this.chartData = this.mapToChartData(data));
    }

    public mapToChartData(data: KeyValuePair[]): Array<any> {
        let monthlyData = [];
        // fill the empty months
        this.months.forEach((_month: string, index: number) => {
            // pair with month array index => 0 index points 1st month
            let monthData = data.find(x => x.key === index + 1);
            // if we have a number for the given month index
            // then assign it, otherwise set it to zero
            monthlyData.push(monthData ? monthData.value : 0);
        });

        return monthlyData;
    }
}
