import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StatListComponent } from './stat.list.component';

describe('StatListComponent', () => {
	let component: StatListComponent;
	let fixture: ComponentFixture<StatListComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [StatListComponent],
			imports: [IonicModule.forRoot()]
		}).compileComponents();

		fixture = TestBed.createComponent(StatListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
