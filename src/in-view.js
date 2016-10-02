import Registry from './registry';
import { inViewport } from './viewport';
import { throttle } from 'lodash';

/**
* Create and return the inView function.
*/
const inView = () => {

    /**
    * How often and on what events we should check
    * each registry.
    */
    const interval = 100;
    const triggers = ['scroll', 'resize', 'load'];

    let registerId = 0

    /**
    * Maintain a hashmap of all registries, a history
    * of selectors to enumerate, and an offset object.
    */
    let selectors = { history: [] };
    let offset = {};

    /**
    * Check each registry from selector history,
    * throttled to interval.
    */
    const check = throttle(() => {
        selectors.history.forEach(selector => {
            selectors[selector].check();
        });
    }, interval);

    /**
    * For each trigger event on window, add a listener
    * which checks each registry.
    */
    triggers.forEach(event =>
        addEventListener(event, check));

    /**
    * If supported, use MutationObserver to watch the
    * DOM and run checks on mutation.
    */
    if (window.MutationObserver) {
        new MutationObserver(check)
            .observe(document.body, { attributes: true, childList: true, subtree: true });
    }

    /**
    * The main interface. Takes a array of Dom Nodes and retrieve
    * the associated registry or create a new one.
    */
    let control = (elements) => {

        if(isNode(elements)) {
          elements = [elements];
        }

        if (!Array.isArray(elements)) return;

        elements = elements.filter(isNode);

        selectors[++registerId] = Registry(elements, offset);

        return selectors[registerId];
    };

    /**
    * Mutate the offset object with either an object
    * or a number.
    */
    control.offset = o => {
        if (o === undefined) return offset;
        const isNum = n => typeof n === 'number';
        ['top', 'right', 'bottom', 'left']
            .forEach(isNum(o) ?
                dim => offset[dim] = o :
                dim => isNum(o[dim]) ? offset[dim] = o[dim] : null
            );
        return offset;
    };

    /**
    * Add proxy for inViewport, set defaults, and
    * return the interface.
    */
    control.is = el => inViewport(el, offset);
    control.offset(0);
    return control;

};

function isNode(o){
  return (
    typeof Node === "object" ? o instanceof Node :
    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
  );
}

// Export a singleton.
export default inView;
