# Intel Hex 386 - Overview

# IN DEVELOPMENT - NEEDS TESTING - DO NOT USE IN PRODUCTION CODE

Intel Hex 386 is a typescript library for parsing intel hex files commonly used
for flashing microcontrollers.


## Table of Contents

### Brief
- [Limitations](#limitations)
- [Dependancies](#dependancies)
- [Installation](#installation)
- [Basics](#basics)
  - [Instantiate](#instantiate)
  - [Serialize](#serialize)
- [Cursor](#the-cursor)
  - [Set Byte Order](#set-byte-order)
  - [Dynamic Length Sequential Reads](#using-the-cursor-for-dynamic-sequential-reads)
  - [Read Types](#using-the-cursor-to-read-specific-types)

### In Detail
- [Cursor](docs/Cursor.md)


## Limitations

This utility currently only works with extended linear address intel hex files.
It is also designed only to deal with intel hex files that already exist, it 
currently does not have the capacity to generate an intel hex file from nothing.


## Dependancies

#### npm
  - ncc_common

## Installation

```bash
npm install intel_hex_386
```

## Basics

### Import ES Module
#### Vanilla Javascript ES
```javascript
import { IntelHex386 } from "intel_hex_386";
```
#### TypeScript
```typescript
import { IntelHex386, ByteOrder } from "intel_hex_386";
```


### Instantiate 
Some intel hex files can include a crc, or additional information such as the byte order
for the file. This data is not processed by this package.  Only the intel hex document
is read from the string.  The parser is agnostic to anything else in the file and should
only extract a continuous intel hex 386 document.

If any record has an incorrect checksum the package will throw an error.
```typescript
const intelHexFile:string = fs.readFileSync(filepath,'utf8');
const intelHex386 = new IntelHex386(intelHexFile);
```

### Serialize
Serialization generates a utf8 encoded string of the intel hex records.  During
serialization the checksum for each record is calculated.
```typescript
const intelHexSerialized:string = intelHex386.serialize();
```

## The Cursor
Reading & Writing to the intel hex.

### Recommended
#### Destructure the cursor
```typescript
const { cursor } = intelHex386;
```

### Set Byte Order

If the byte order is not set before the first read or write an error will be thrown.

#### Typescript
```typescript
cursor.setByteOrder(ByteOrder.LittleEndian);
```
#### Javascript
```javascript
cursor.setByteOrder("LittleEndian");
```

### Using the cursor for dynamic sequential reads
```typescript
let read = cursor.read(0x12345678);
```
Setting the cursor to a variable allows for sequential reads to be made, from the initial starting address.

This can be useful when a yet unknown number of sequential operations need to take place

```typescript
const getUint32:number = () => read.integer(false,4);
const packedValues = getUint32();
const idObjects = [];

for (let p = 0; p < packedValues; p++){
  const id = getUInt32();
  const sequentialIds = getUInt32();

  for (let s = 0; s < sequentialIds;s++){
    idObjects.push({ id: id + s });
  }
}
```

### Using the cursor to read specific types

This packages is intended to handle reading and writing specific primative datatypes
to and from the intel hex 386 file.

- bytes
- integers
- fixed points
- floats
- strings

Please see: [Cursor](docs/Cursor.md) for a detailed explaination of the type options.

```typescript
const unsigned32BitInteger:number = (
  cursor
    .read(0x12345678)
    .integer(false,4)
) // returns a single 32 bit integer

const unsigned32BitInteger:number[] = (
  cursor
    .read(0x12345678)
    .integer(false,4,10)
) // returns an array of 10, 32 bit integers 
```

