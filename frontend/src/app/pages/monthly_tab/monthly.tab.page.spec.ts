import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MonthlyTabPage } from './monthly.tab.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { FormsModule } from '@angular/forms';
import { DownloadService } from 'src/app/services/download.service';
import { of } from 'rxjs';
import { KeyValuePair } from 'src/app/models/response.models';

var downloadSpy = jasmine.createSpyObj('DownloadService', ['getMonthlyDownloads']);

describe('MonthlyTabPage', () => {
    let component: MonthlyTabPage;
    let fixture: ComponentFixture<MonthlyTabPage>;

    beforeEach(async(() => {
        // stub the download service
        downloadSpy.getMonthlyDownloads.and.callFake(() => of([
            <KeyValuePair>{ key: 0, value: 12 },
            <KeyValuePair>{ key: 1, value: 5 }
        ]));

        TestBed.configureTestingModule({
            declarations: [MonthlyTabPage],
            imports: [IonicModule.forRoot(), FormsModule, ComponentsModule],
            providers: [
                { provide: DownloadService, useValue: downloadSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MonthlyTabPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should convert string year', () => {
        let year = component.getYearFromDate("2018-12-02T11:47:51.115+00:00");
        // run the test
        expect(year).toBe(2018);
    });

    it('should map chart data properly', () => {
        let dummyData = [
            <KeyValuePair>{ key: 1, value: 12 },
            <KeyValuePair>{ key: 2, value: 5 },
            <KeyValuePair>{ key: 5, value: 6 }
        ];
        // it should fill the months with no value
        let expectedData = [12, 5, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0];
        // run the test
        expect(component.mapToChartData(dummyData)).toEqual(expectedData);
    });
});
