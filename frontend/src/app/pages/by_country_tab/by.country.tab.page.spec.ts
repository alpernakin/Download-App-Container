import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ByCountryTabPage } from './by.country.tab.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { FormsModule } from '@angular/forms';
import { DownloadService } from 'src/app/services/download.service';
import { KeyValuePair } from 'src/app/models/response.models';
import { of } from 'rxjs';

var downloadSpy = jasmine.createSpyObj('DownloadService', ['getDownloadsByCountry']);

describe('ByCountry', () => {
    let component: ByCountryTabPage;
    let fixture: ComponentFixture<ByCountryTabPage>;

    beforeEach(async(() => {
        // stub the download service
        downloadSpy.getDownloadsByCountry.and.callFake(() => of([
            <KeyValuePair>{ key: 0, value: 12 },
            <KeyValuePair>{ key: 1, value: 5 },
        ]));

        TestBed.configureTestingModule({
            declarations: [ByCountryTabPage],
            imports: [IonicModule.forRoot(), FormsModule, ComponentsModule],
            providers: [
                { provide: DownloadService, useValue: downloadSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ByCountryTabPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
