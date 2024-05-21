[<- Overview](../README.md)
# Intel Hex 386 - Cursor

# IN DEVELOPMENT - NEEDS TESTING - DO NOT USE IN PRODUCTION CODE

## Introduction

The cursor is how the byte data of the intel hex file is read or written to.



## Instantiation

When the intel hex 386 document is instantiated, it populates the datablocks. Then 
the cursor is instantiated using the datablocks from the intel hex file.

## Setting the Byte Order

Specifically addressing the Endianess of the stored data is core to the function of
this package.  As such, before the cursor can be used the byte order must be specified.

Since the byte order is not stored in the intel hex 386 records, this must be provided 
from an external source.

For typescript, and enum has been provided:
```typescript
export enum ByteOrder{
  BigEndian = 'BigEndian',
  LittleEndian = 'LittleEndian'
}
```

For javascript, the string values have been optionally provided for autocorrect:
```javascript
export type ByteOrderAsString = "BigEndian"|"LittleEndian";
```

Set the byte order.  If the byte order has not been set before any read or write attempts
the package will throw an error.
```typescript
const intelHex386 = new IntelHex386(intelHexFile);
const { cursor } = intelHex386;
cursor.setByteOrder(ByteOrder.LittleEndian);
```

## Reading the Bytes

### cursor.read(from)
- 'from' (string|number): Accepts hexidecimal values (with or without 0x), or unsigned integer. This would be the address in memory space as defined in the intel hex file where the read should start.

Read is a closure and thus must be called prior to extracting bytes from the intel hex.
```typescript
let read = cursor.read('0x12345678')
```

#### returns:
* [byte](#readfrombytebytelength)
* [integer]()
* [fixedPoint]()
* [floatingPoint]()
* [string]()

### read(from).byte(byteLength?)
- 'byteLength' (number|undefined): If no byteLength is specified, a single byte is returned.  If provided, a buffer with that length of bytes is returned.

#### returns (number|buffer)

### read(from).integer(signed,byteLength,elementLength?)
- 'signed' (boolean): Is this a signed integer?
- 'byteLength' (1|2|3|4): What is the byteLength of this integer?
- 'elementLength?' (number|undefined): If an element length is provided the return is a number array of this size.

#### returns (number|number[])