import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ByTimePageTabPage } from './by.time.tab.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        ComponentsModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: ByTimePageTabPage }])
    ],
    declarations: [ByTimePageTabPage]
})
export class ByTimeTabPageModule { }
