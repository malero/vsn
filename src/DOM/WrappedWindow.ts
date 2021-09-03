import {DOMObject} from "./DOMObject";
import {Scope} from "../Scope";

export class WrappedWindow extends DOMObject {
    constructor(
        protected _window: Window, ...props) {
        super(props);
        this._scope = new Scope();

        this.scope.set('@scrollY', this._window.scrollY);
        this.scope.set('@scrollX', this._window.scrollX);
        _window.addEventListener('scroll', this.onScroll.bind(this), {
            passive: true
        });
    }

    onScroll(e) {
        console.log('wut');
        this.scope.set('@scrollY', this._window.scrollY);
        this.scope.set('@scrollX', this._window.scrollX);
    }
}
