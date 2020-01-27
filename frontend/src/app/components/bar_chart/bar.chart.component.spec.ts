import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BarChartComponent } from './bar.chart.component';
import { ChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';

describe('BarChartComponent', () => {
	let component: BarChartComponent;
	let fixture: ComponentFixture<BarChartComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [BarChartComponent],
			imports: [IonicModule.forRoot(), CommonModule, ChartsModule]
		}).compileComponents();

		fixture = TestBed.createComponent(BarChartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
