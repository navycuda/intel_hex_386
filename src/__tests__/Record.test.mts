import { IntelHexMatch } from "Tools.js";
import { NewRecord, Record, RecordType } from "../Record.js";
import ncc from "ncc_common";
const { test, expect } = ncc;


  
test("Instantiate an empty Record", () => {
  expect('Nothing to instantiate record with')
    .toBeThrownError(()=>{
      //@ts-ignore
      const record = new Record();
    });
});

test("Instantiate a record with a badchecksum from IntelHexMatch", () => {
  expect('Record has bad checksum.')
    .toBeThrownError(()=>{

      const intelHexMatch:IntelHexMatch = {
        length: '00',
        address: '0000',
        type: '01',
        data: '',
        checksum: '02' // Should be FF
      }

      const record = new Record(intelHexMatch);
    });
});


test("Instantiate a record as an end of File", () => {
  const record = Record.EoF;
  expect(record.type).toBeEqual(RecordType.EndOfFile);
});

const data2C = [
//  20, 21, 22, 23
     0,  0,  0,  0,
//  24, 25, 26, 27,
     0,  0,  0,  0,
//  28, 29, 2A, 2B
     0,  0,  0,  0,
//  2C, 2D, 2E, 2F,
    17,  0,  0,  0,
//  30, 31, 33, 33
     0,  0,  0,  0,
//  34, 35, 36, 37,
     0,  0,  0,  0,
//  38, 39, 3A, 3B
     0,  0,  0,  0,
//  3C, 3D, 3E, 3F,
     0,  0,  0,  0,
];
const newRecord:NewRecord = {
  address: 0x80020020,
  type: RecordType.Data,
  data: Buffer.from(data2C)
}


test("Read a record Byte", () => {
  const record = new Record(null,newRecord);
  const result = record.read(0x2C);
  expect(result).toBeEqual(17);
});

test("Write a byte", () => {
  const record = new Record(null,newRecord);
  record.write(21,0x2C);
  const result = record.read(0x2C);
  expect(result).toBeEqual(21);
});

test("Serialization", () => {
  const record = Record.EoF;
  const serializedRecord = record.serialize();
  expect(serializedRecord).toBeEqual(':00000001FF\r\n');
})