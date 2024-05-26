import { IntelHexMatch } from "Tools.js";
import { NewRecord, Record, RecordType } from "../Record.js";
import ncc from "ncc_common";
const { test, expect } = ncc;
import { newRecord } from "./mock.js";

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


test("Read a record Byte", () => {
  const record = new Record(null,newRecord());
  const result = record.read(0x2C);
  expect(result).toBeEqual(17);
});

test("Write a byte", () => {
  const record = new Record(null,newRecord());
  record.write(21,0x2C);
  const result = record.read(0x2C);
  expect(result).toBeEqual(21);
});

test("Serialization", () => {
  const record = Record.EoF;
  const serializedRecord = record.serialize();
  expect(serializedRecord).toBeEqual(':00000001FF\r\n');
})