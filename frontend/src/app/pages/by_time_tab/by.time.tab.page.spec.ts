import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ByTimePageTabPage } from './by.time.tab.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { FormsModule } from '@angular/forms';
import { DownloadService } from 'src/app/services/download.service';
import { KeyValuePair } from 'src/app/models/response.models';
import { of } from 'rxjs';

var downloadSpy = jasmine.createSpyObj('DownloadService', ['getDownloadsByTimeOfDay']);

describe('ByTimePage', () => {
    let component: ByTimePageTabPage;
    let fixture: ComponentFixture<ByTimePageTabPage>;

    beforeEach(async(() => {
        // stub the download service
        downloadSpy.getDownloadsByTimeOfDay.and.callFake(() => of([
            <KeyValuePair>{ key: 0, value: 12 },
            <KeyValuePair>{ key: 1, value: 5 },
        ]));

        TestBed.configureTestingModule({
            declarations: [ByTimePageTabPage],
            imports: [IonicModule.forRoot(), FormsModule, ComponentsModule],
            providers: [
                { provide: DownloadService, useValue: downloadSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ByTimePageTabPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});