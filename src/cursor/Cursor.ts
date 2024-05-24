import ncc from "ncc_common";
import { DataBlock } from "../DataBlock.js";
import { ExtendedBuffer } from "./ExtendedBuffer.js";

export enum ByteOrder{
  BigEndian = 'BigEndian',
  LittleEndian = 'LittleEndian'
}
export enum IntegerByteOrder{
  BigEndian = 'BE',
  LittleEndian = 'LE'
}

export type ByteOrderAsString = "BigEndian"|"LittleEndian";
export type ByteLength = 1|2|3|4;
export type AbsoluteAddress = string|number;

export interface Scalar{
  multiplier?: number;
  offset?: number;
}
/** ### Integer
 * Read an integer from the binary.
 */
export interface Integer{
  (signed:boolean,byteLength:ByteLength):number;
  (signed:boolean,byteLength:ByteLength,elementLength:number):number[];
}
/** ### Fixed Point
 * Read an integer and convert it to fixed point when scalars
 * are provided.
 */
export interface FixedPoint{
  (signed:boolean,byteLength:ByteLength):number;
  (signed:boolean,byteLength:ByteLength,scalar:Scalar|null):number;
  (signed:boolean,byteLength:ByteLength,scalar:Scalar|null,elementLength:number):number[];
}
/** ### Floating Point
 * Read floating point values from the binary
 */
interface FloatingPoint{
  ():number;
  (elementLength:number):number[];
}
/** ### String
 * Read a UTF8 string from the binary
 */
interface UTF8_String{
  (characterLength:number):string;
}
interface Byte{
  ():number;
  (byteLength:number):Buffer;
}
export interface ReadResult{
  byte:Byte;
  integer:Integer;
  fixedPoint:FixedPoint;
  floatingPoint:FloatingPoint;
  string:UTF8_String;
}

/** ### Byte Cursor
 * Handles all of the reading and writing of the Intel Hex Record Data
 */
export class Cursor{
  private dataBlocks:DataBlock[];
  private absoluteAddress: number = 0 >>> 0;
  private currentDataBlock: DataBlock;
  private byteOrder: IntegerByteOrder;


  constructor(dataBlocks:DataBlock[]){ this.dataBlocks= dataBlocks }

  private _setAbsoluteAddress(absoluteAddress:AbsoluteAddress):void{
    if (typeof absoluteAddress === 'string'){
      absoluteAddress = ncc.convert.toUIntFrom.hex(absoluteAddress);
    }
    this.absoluteAddress = absoluteAddress >>> 0;
    for (const dataBlock of this.dataBlocks){
      if (dataBlock.hasAbsoluteAddress(this.absoluteAddress)){
        this.currentDataBlock = dataBlock;
        return;
      }
    }
    throw new Error('Did not find appropriate datablock');
  }
  private _read():number{
    const byte = this.currentDataBlock.read(this.absoluteAddress);
    this.absoluteAddress ++;
    return byte;
  }
  private _write(value:number):void{
    this.currentDataBlock.write(value,this.absoluteAddress);
    this.absoluteAddress ++;
  }
  /** ### Set Byte Order
   * Must be set prior to any read/write operations
   */
  setByteOrder(byteOrder:ByteOrder|ByteOrderAsString){
    this.byteOrder = IntegerByteOrder[byteOrder];
    return this;
  }



  /** ### Read
   * From the intel hex 386 binary
   * 
   * ```javascript
   * const read = intelHex386.cursor.read(absoluteAddress);
   * ```
   */
  read(from:AbsoluteAddress):ReadResult{
    if (!this.byteOrder) { throw new Error('ByteOrder has not been set'); }
    this._setAbsoluteAddress(from);
    const { byteOrder } = this;

    const getExtendedBuffer = (count:number):ExtendedBuffer => {
      const bytes = [];
      for (let c = 0; c < count; c++){
        bytes.push(this._read());
      }
      return ExtendedBuffer.from(bytes);
    }


    function byte():number;
    function byte(byteLength:number):Buffer;
    function byte(byteLength?:number):number|Buffer{
      if (!byteLength){
        return integer(false,1);
      }
      return getExtendedBuffer(byteLength);
    }


    function integer(signed:boolean,byteLength:ByteLength):number;
    function integer(signed:boolean,byteLength:ByteLength,elementLength:number):number[];
    function integer(signed:boolean,byteLength:ByteLength,elementLength?:number):number|number[]{
      const u = signed ? '' : 'U';
      const method = `read${u}Int${byteLength * 8}${byteOrder}` as keyof Buffer;

      if (elementLength === undefined){
        const buffer = getExtendedBuffer(byteLength);
        return (buffer[method] as any)(0,byteLength);
      }
      const integers:number[] = [];
      for (let i = 0; i < elementLength; i++){
        integers.push(integer(signed,byteLength));
      }
      return integers;
    }


    function fixedPoint(signed:boolean,byteLength:ByteLength):number;
    function fixedPoint(signed:boolean,byteLength:ByteLength,scalar:Scalar|null):number;
    function fixedPoint(signed:boolean,byteLength:ByteLength,scalar:Scalar|null,elementLength:number):number[];
    function fixedPoint(signed:boolean,byteLength:ByteLength,scalar?:Scalar,elementLength?:number):number|number[]{
      if (!elementLength){
        const _integer = integer(signed,byteLength);
        if (scalar){
          return (_integer * (scalar.multiplier || 1)) + (scalar.offset || 0);
        }
        return _integer;
      }
      
      const fixedPoints:number[] = [];
      for (let i = 0; i < elementLength; i++){
        fixedPoints.push(fixedPoint(signed,byteLength,scalar));
      }
      return fixedPoints;
    }


    function floatingPoint():number;
    function floatingPoint(elementLength:number):number[];
    function floatingPoint(elementLength?:number):number|number[]{
      if (!elementLength){
        const buffer = getExtendedBuffer(4);
        return buffer[`readFloat${byteOrder}`]();
      }
      const floatingPoints:number[] = [];
      for (let i = 0; i < elementLength; i++){
        floatingPoints.push(floatingPoint());
      }
      return floatingPoints;
    }
  

    function string(characterLength:number):string{
      const buffer = getExtendedBuffer(characterLength);
      return buffer.toString('utf-8');
    }


    return {
      byte,
      integer,
      fixedPoint,
      floatingPoint,
      string
    }
  }


  write(to:AbsoluteAddress){
    if (!this.byteOrder) { throw new Error('ByteOrder has not been set'); }
    this._setAbsoluteAddress(to);
    const { byteOrder } = this;

    const writeValues = (values:Buffer|number[]) => {
      for (let v = 0; v < values.length; v++){
        this._write(values[v]);
      }
    }


    function byte(value:number|number[]):void{
      if (Array.isArray(value)){
        return writeValues(value);
      }
      writeValues([ value ]);
    }


    function integer(value:number|number[],signed:boolean,byteLength:ByteLength){
      const u = signed ? '' : 'U';
      const method = `write${u}Int${byteLength * 8}${byteOrder}` as keyof Buffer;

      if (Array.isArray(value)){
        const buffer = ExtendedBuffer.alloc(value.length * byteLength, 0x00);
        for (let v = 0; v < value.length; v++){
          const offset = v * byteLength;
          (buffer[method] as any)(value[v],offset,byteLength);
        }
        return writeValues(buffer);
      }

      const buffer = ExtendedBuffer.alloc(byteLength,0x00);
      (buffer[method] as any)(value,0,byteLength);

      writeValues(buffer);
    }


    function fixedPoint(value:number|number[],signed:boolean,byteLength:ByteLength,scalar?:Scalar){
      if (Array.isArray(value)){
        const _value = value.map(v=>{
          if (scalar){
            return (v / (scalar.multiplier || 1)) + (-scalar.offset || 0);
          }
          return v;
        })
        return integer(_value,signed,byteLength);
      }
      if (scalar){
        const _value = (value / (scalar.multiplier || 1)) + (-scalar.offset || 0);
        return integer(_value,signed,byteLength);
      }
      return integer(value,signed,byteLength);
    }


    function floatingPoint(value:number|number[]){
      if (Array.isArray(value)){
        const buffer = ExtendedBuffer.alloc(value.length * 4, 0x00);
        for (let v = 0; v < value.length;v++){
          const offset = v * 4;
          buffer[`writeFloat${byteOrder}`](value[v],offset);
        }
        return writeValues(buffer);
      }
      const buffer = ExtendedBuffer.alloc(4,0xFF);
      buffer[`writeFloat${byteOrder}`](value,0);
      writeValues(buffer);
    }


    function string(str:string){
      const buffer = Buffer.from(str,'utf8');
      writeValues(buffer);
    }


    return {
      byte,
      integer,
      fixedPoint,
      floatingPoint,
      string
    }
  }
}