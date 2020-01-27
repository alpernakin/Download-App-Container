import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: 'map',
                children: [{ path: '', loadChildren: () => import('../map_tab/map.tab.module').then(m => m.MapTabPageModule) }]
            },
            {
                path: 'by_country',
                children: [{ path: '', loadChildren: () => import('../by_country_tab/by.country.tab.module').then(m => m.ByCountryTabPageModule) }]
            },
            {
                path: 'by_time',
                children: [{ path: '', loadChildren: () => import('../by_time_tab/by.time.tab.module').then(m => m.ByTimeTabPageModule) }]
            },
            {
                path: 'monthly',
                children: [{ path: '', loadChildren: () => import('../monthly_tab/monthly.tab.module').then(m => m.MonthlyTabPageModule) }]
            },
            {
                path: '',
                redirectTo: '/tabs/map',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: '/tabs/map',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsPageRoutingModule { }