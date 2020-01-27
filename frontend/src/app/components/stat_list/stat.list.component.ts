import { Component, OnInit, Input } from '@angular/core';

export type LabelCount = { label: string, count: number }

/**
 * Simple list for label - count pair
 */
@Component({
    selector: 'app-stat-list',
    templateUrl: './stat.list.component.html',
    styleUrls: ['./stat.list.component.scss'],
})
export class StatListComponent implements OnInit {

    @Input("items") items: LabelCount[] = [];

    @Input("labelHeader") labelHeader: string;

    @Input("countHeader") countHeader: string;

    constructor() { }

    ngOnInit() { }
}
