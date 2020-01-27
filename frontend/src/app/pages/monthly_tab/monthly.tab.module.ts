import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import { RouterModule } from '@angular/router';
import { MonthlyTabPage } from './monthly.tab.page';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        ComponentsModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: MonthlyTabPage }])
    ],
    declarations: [MonthlyTabPage]
})
export class MonthlyTabPageModule { }
