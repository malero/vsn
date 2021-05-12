import {ClassConstructor} from "./ClassConstructor";

export class ControllerAttribute extends ClassConstructor {
    protected attributeName: string = 'v-controller';

    constructor(tag) {
        super(tag);
    }
}
