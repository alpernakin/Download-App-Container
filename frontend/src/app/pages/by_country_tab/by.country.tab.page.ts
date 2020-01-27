import { Component, OnInit } from '@angular/core';
import { LabelCount } from 'src/app/components/stat_list/stat.list.component';
import { DownloadService } from 'src/app/services/download.service';

@Component({
    selector: 'app-by-country-tab',
    templateUrl: 'by.country.tab.page.html',
    styleUrls: ['by.country.tab.page.scss']
})
export class ByCountryTabPage implements OnInit {

    public items: LabelCount[] = [];

    constructor(
        private download: DownloadService) { }

    ngOnInit() {
        this.loadData();
    }

    ionViewDidEnter() { }

    public loadData() {
        this.items = [];
        this.download.getDownloadsByCountry().subscribe(data => {
            this.items = data.map(x => {
                return <LabelCount>{ label: x.key, count: x.value }
            });
        });
    }
}
