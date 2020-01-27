import { TypeDecorator } from '@angular/core';
import { Subscription } from 'rxjs';

/** decorator to kill subscribers to prevent replicate subscription */
export function DestroySubscribers(): TypeDecorator {

    return function (target: any) {

        // decorate the function ngOnDestroy
        target.prototype.ngOnDestroy = ngOnDestroyDecorator(target.prototype.ngOnDestroy);

        // decorator function
        function ngOnDestroyDecorator(f) {

            return function () {

                // save the result of ngOnDestroy performance to the variable superData 
                let superData = f ? f.apply(this, arguments) : null;
                // unsubscribe
                for (let key in this.subscribers) {
                    let subscriber = this.subscribers[key];
                    if (subscriber instanceof Subscription) {
                        subscriber.unsubscribe();
                    }
                }
                // return the result of ngOnDestroy performance
                return superData;
            }
        }

        // return the decorated class
        return target;
    }
}