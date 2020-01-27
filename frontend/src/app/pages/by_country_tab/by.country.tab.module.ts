import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ByCountryTabPage } from './by.country.tab.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        ComponentsModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: ByCountryTabPage }])
    ],
    declarations: [ByCountryTabPage]
})
export class ByCountryTabPageModule { }
