import {EventDispatcher} from "simple-ts-event-dispatcher";
import {Tag} from "./Tag";

export abstract class Controller extends EventDispatcher {
    protected constructor(
        protected tag: Tag
    ) {
        super();
    }
}
