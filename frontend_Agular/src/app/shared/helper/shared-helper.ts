export class SharedHelper {
  static convertStringToBoolean(str: string): boolean {
    const arr = str.split('.');
    try {
      return arr[arr.length - 1] as unknown as boolean
    } catch (e) {
      return false;
    }
  }
}
