import { IntelHexMatch } from "./Tools.js";
import ncc from "ncc_common";

export enum RecordType{
  Data = 0x00,
  EndOfFile = 0x01,
  ExtendedSegmentAddress = 0x02,  // Not implemented
  StartSegmentAddress = 0x03,     // Not implemented
  ExtendedLinearAddress = 0x04,
  StartLinearAddress = 0x05       // Not implemented
}

/** two's complement checksum for intelhex records */
export const getChecksum = (record:Record):number => {
  const { length, address, type, data } = record;
  
  const toBeSummed = [
    length,
    address & 0xFF,
    (address >> 8) & 0xFF,
    type,
    ...data
  ]

  const sum = toBeSummed.reduce((a,c)=>a+c);
  return (~sum + 1) & 0xFF;
}


/** ### Intel Hex Record
 * Single line of an intel hex file.
 * ```
 *   :02000004800278
 *   |||||||||||||^^ checksum
 *   |||||||||^^^^-- data
 *   |||||||^^------ type
 *   |||^^^^-------- address
 *   |^^------------ length
 *   ^-------------- intel hex marker
 * ```
 */
export class Record{
  length: number;
  address: number;
  type: RecordType;
  data: Buffer
  checksum: number;
  get ela(){
    return (this.data[0] << 24 >>> 0) + (this.data[1] << 16 >>> 0);
  }


  constructor(intelHexMatch:IntelHexMatch){
    const { length, address, type, data, checksum } = intelHexMatch

    this.length = parseInt(length,16);
    this.address = parseInt(address,16);
    this.type = parseInt(type,16);
    this.data = Buffer.from(data,'hex');
    this.checksum = parseInt(checksum,16);

    // Validate the checksum is good.
    if (this.checksum !== getChecksum(this)) {
      throw new Error('Record has bad checksum.');
    }
  }


  /** #### Serialize the Record
   * Serializes the Intel Hex Record into a utf-8 string
   */
  serialize():string{
    const { toHexFrom } = ncc.convert;
    const length = toHexFrom.integer(this.length,1);
    const address = toHexFrom.integer(this.address,2);
    const type = toHexFrom.integer(this.type,1);
    const data = this.data.toString('hex').toUpperCase();
    const checksum = toHexFrom.integer(getChecksum(this),1);
    return `:${length}${address}${type}${data}${checksum}\r\n`;
  }
}