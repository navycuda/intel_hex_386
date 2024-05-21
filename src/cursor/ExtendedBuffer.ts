
const extendSign = (val:number):number => {
  if (val & 0x800000) {
    val |= 0xFF000000;
  }
  return val;
}


interface ReadInteger{
  (offset?:number):number;
}
interface WriteInteger{
  (value:number, offset?:number):void;
}


export class ExtendedBuffer extends Buffer{
  constructor(size:number){
    super(size);
    Object.setPrototypeOf(this, ExtendedBuffer.prototype);
  }

  static from(arrayBuffer: ArrayBuffer | SharedArrayBuffer, byteOffset?: number, length?: number): ExtendedBuffer;
  static from(data: Uint8Array | ReadonlyArray<number>): ExtendedBuffer;
  static from(data: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>): ExtendedBuffer;
  static from(str: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: 'string'): string }, encoding?: BufferEncoding): ExtendedBuffer;
  static from(value: unknown, encodingOrOffset?: unknown, length?:number):ExtendedBuffer{
    let buffer: Buffer;

    if (typeof value === 'string'){
      buffer = Buffer.from(value,encodingOrOffset as BufferEncoding);
    } else if (Array.isArray(value) || value instanceof Uint8Array){
      buffer = Buffer.from(value);
    } else if (value instanceof ArrayBuffer || value instanceof SharedArrayBuffer){
      buffer = Buffer.from(value,encodingOrOffset as number, length);
    } else if (value instanceof Buffer){
      buffer = Buffer.from(value);
    } else {
      throw new TypeError('The "value" argument must be on of type string, buffer, array or array like object.');
    }
    Object.setPrototypeOf(buffer, ExtendedBuffer.prototype);
    return buffer as ExtendedBuffer;
  }


  readInt24BE:ReadInteger = (offset = 0) => {
    let value = (this[offset] << 16) | (this[offset+1] << 8) | (this[offset+2]);
    return extendSign(value);
  }
  readInt24LE:ReadInteger = (offset = 0) => {
    let value = (this[offset]) | (this[offset + 1] << 8) | (this[offset+2] << 16);
    return extendSign(value);
  }
  readUInt24BE:ReadInteger = (offset = 0) => {
    return (this[offset] << 16) | (this[offset+1] << 8) | (this[offset+2]);
  }
  readUInt24LE:ReadInteger = (offset = 0) => {
    return (this[offset]) | (this[offset + 1] << 8) | (this[offset+2] << 16);
  }



  writeInt24BE:WriteInteger = (value, offset = 0) => {
    this[offset]      = (value >> 16) & 0xFF;
    this[offset + 1]  = (value >>  8) & 0xFF;
    this[offset + 2]  = value         & 0xFF;
  }
  writeInt24LE:WriteInteger = (value, offset = 0) => {
    this[offset]      = value         & 0xFF;
    this[offset + 1]  = (value >>  8) & 0xFF;
    this[offset + 2]  = (value >> 16) & 0xFF;
  }
  writeUInt24BE:WriteInteger = (value, offset = 0) => {
    value &= 0xFFFFFF;
    this.writeInt24BE(value,offset);
  }
  writeUInt24LE:WriteInteger = (value, offset = 0) => {
    value &= 0xFFFFFF;
    this.writeInt24LE(value,offset);
  }
}