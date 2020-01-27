import { OnDestroy } from "@angular/core";
import { Subscription, of } from 'rxjs';
import { DestroySubscribers } from './destroy.subscribers';

describe('Decorators', () =>{

    describe('DestroySubscribers', () => {

        @DestroySubscribers()
        class FakeComponentWithSubscribers implements OnDestroy {
            public subscribers: { [key: string]: Subscription } = {};
            constructor() {
                this.subscribers["dummy_1"] = of({}).subscribe();
                this.subscribers["dummy_2"] = of({}).subscribe();
            }
            ngOnDestroy() {}
        }

        it('should unsubscribe the subscribers on destroy', () => {
            let fakeComponent = new FakeComponentWithSubscribers();
            fakeComponent.ngOnDestroy();

            let allClosed = true;
            for (let key in fakeComponent.subscribers) {
                let subscriber = fakeComponent.subscribers[key];
                allClosed = allClosed && !!subscriber.closed;
            }
            expect(allClosed).toBeTruthy();
        });
    })
});