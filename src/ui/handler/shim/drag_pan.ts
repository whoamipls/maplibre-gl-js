import type {MousePanHandler} from '../mouse';
import type TouchPanHandler from './../touch_pan';

export type DragPanOptions = {
  linearity?: number;
  easing?: (t: number) => number;
  deceleration?: number;
  maxSpeed?: number;
};

/**
 * The `DragPanHandler` allows the user to pan the map by clicking and dragging
 * the cursor.
 */
export default class DragPanHandler {

    _el: HTMLElement;
    _mousePan: MousePanHandler;
    _touchPan: TouchPanHandler;
    _inertiaOptions: DragPanOptions;

    /**
     * @private
    */
    constructor(el: HTMLElement, mousePan: MousePanHandler, touchPan: TouchPanHandler) {
        this._el = el;
        this._mousePan = mousePan;
        this._touchPan = touchPan;
    }

    /**
     * Enables the "drag to pan" interaction.
     *
     * @param {Object} [options] Options object
     * @param {number} [options.linearity=0] factor used to scale the drag velocity
     * @param {Function} [options.easing=bezier(0, 0, 0.3, 1)] easing function applled to `map.panTo` when applying the drag.
     * @param {number} [options.maxSpeed=1400] the maximum value of the drag velocity.
     * @param {number} [options.deceleration=2500] the rate at which the speed reduces after the pan ends.
     *
     * @example
     *   map.dragPan.enable();
     * @example
     *   map.dragPan.enable({
     *      linearity: 0.3,
     *      easing: bezier(0, 0, 0.3, 1),
     *      maxSpeed: 1400,
     *      deceleration: 2500,
     *   });
     */
    enable(options?: DragPanOptions) {
        this._inertiaOptions = options || {};
        this._mousePan.enable();
        this._touchPan.enable();
        this._el.classList.add('mapabcgl-touch-drag-pan', 'mapboxgl-touch-drag-pan');
    }

    /**
     * Disables the "drag to pan" interaction.
     *
     * @example
     * map.dragPan.disable();
     */
    disable() {
        this._mousePan.disable();
        this._touchPan.disable();
        this._el.classList.remove('mapabcgl-touch-drag-pan', 'mapboxgl-touch-drag-pan');
    }

    /**
     * Returns a Boolean indicating whether the "drag to pan" interaction is enabled.
     *
     * @returns {boolean} `true` if the "drag to pan" interaction is enabled.
     */
    isEnabled() {
        return this._mousePan.isEnabled() && this._touchPan.isEnabled();
    }

    /**
     * Returns a Boolean indicating whether the "drag to pan" interaction is active, i.e. currently being used.
     *
     * @returns {boolean} `true` if the "drag to pan" interaction is active.
     */
    isActive() {
        return this._mousePan.isActive() || this._touchPan.isActive();
    }
}
