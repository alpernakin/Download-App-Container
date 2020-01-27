import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

/**
 * to use in <ion-toolbar> tag
 */
@Component({
    selector: 'app-toolbar-content',
    templateUrl: './toolbar.content.component.html',
    styleUrls: ['./toolbar.content.component.scss'],
})
export class ToolbarContentComponent implements OnInit {

    @Input("header") header: string;

    @Output("onRefreshClicked") onRefreshClicked = new EventEmitter<void>();

    constructor() { }

    ngOnInit() { }

    public onClick() {
        this.onRefreshClicked.emit();
    }

}