import { NgModule } from '@angular/core';
import { StatListComponent } from './stat_list/stat.list.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ToolbarContentComponent } from './toolbar_content/toolbar.content.component';
import { MapComponent } from './map/map.component';
import { BarChartComponent } from './bar_chart/bar.chart.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
    imports: [IonicModule, CommonModule, ChartsModule],
    declarations: [StatListComponent, ToolbarContentComponent, MapComponent, BarChartComponent],
    exports: [StatListComponent, ToolbarContentComponent, MapComponent, BarChartComponent]
})
export class ComponentsModule { }