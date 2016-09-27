import { inViewport } from './viewport';

/**
* - Registry -
*
* Maintain a list of elements, a subset which currently pass
* a given criteria, and fire events when elements move in or out.
*/

class inViewRegistry {

    constructor(options) {
        //support old syntax where you pass in elements and not a options object
        const elements = (typeof options.elements === "undefined") ? options : options.elements;

        this.offset = options.offset
        this.current  = [];
        this.elements = elements;
        this.handlers = { enter: [], exit: [] };
        this.singles  = { enter: [], exit: [] };
    }

    /**
    * Check each element in the registry, if an element
    * changes states, fire an event and operate on current.
    */
    check(offset) {
        //console.log(this);
        this.elements.forEach(el => {
            const offsetValue = this.offset ? this.offset : offset
            let passes  = inViewport(el, offsetValue);
            //let passes  = inViewport(el, offset);
            let index   = this.current.indexOf(el);
            let current = index > -1;
            let entered = passes && !current;
            let exited  = !passes && current;

            if (entered) {
                this.current.push(el);
                this.emit('enter', el);
            }

            if (exited) {
                this.current.splice(index, 1);
                this.emit('exit', el);
            }

        });
        return this;
    }

    /**
    * Register a handler for event, to be fired
    * for every event.
    */
    on(event, handler) {
        this.handlers[event].push(handler);
        return this;
    }

    /**
    * Register a handler for event, to be fired
    * once and removed.
    */
    once(event, handler) {
        this.singles[event].unshift(handler);
        return this;
    }

    /**
    * Emit event on given element. Used mostly
    * internally, but could be useful for users.
    */
    emit(event, element) {
        while(this.singles[event].length) {
            this.singles[event].pop()(element);
        }
        let length = this.handlers[event].length;
        while (--length > -1) {
            this.handlers[event][length](element);
        }
        return this;
    }

}

export default (elements) => new inViewRegistry(elements);
