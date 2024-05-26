import { Record, RecordType } from "../Record.js";
import { AddressBlock } from "../AddressBlock.js";
import ncc from "ncc_common";
import { getSimpleRecords } from "./mock.js";
const { test, expect } = ncc;


test("Throw error when unsupported record added", ()=>{
  const record = Record.EoF;
  record.type = RecordType.StartLinearAddress;

  expect('Unsupported record added')
    .toBeThrownError(()=>{
      const addressBlock = new AddressBlock(record);
    });
});


test("Read from AddressBlock", () => {
  const addressBlock = new AddressBlock();
  for (const record of getSimpleRecords()){
    addressBlock.addRecord(record);
  }
  const result = addressBlock.read(0x8002002C);
  expect(result).toBeEqual(17);
});

test("Write to AddressBlock, read back the change", () => {
  const addressBlock = new AddressBlock();
  for (const record of getSimpleRecords()){
    addressBlock.addRecord(record);
  }
  addressBlock.write(21,0x8002002C);
  const result = addressBlock.read(0x8002002C);
  expect(result).toBeEqual(21);
});