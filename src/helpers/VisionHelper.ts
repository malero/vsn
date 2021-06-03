
export class VisionHelper {
    public static isConstructor(obj: any): boolean {
        return obj &&
          obj.hasOwnProperty("prototype") &&
          !!obj.prototype &&
          !!obj.prototype.constructor &&
          !!obj.prototype.constructor.name;
    }
}
