// src/services/tokenFactoryTypes.js

import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { Metadata } from 'cosmjs-types/cosmos/bank/v1beta1/bank';
import { BinaryReader, BinaryWriter } from 'cosmjs-types/binary';

function createBaseMsgCreateDenom() {
  return {
    sender: '',
    subdenom: '',
  };
}

function createBaseMsgMint() {
  return {
    sender: '',
    amount: undefined,
    mintToAddress: '',
  };
}

// MsgSetDenomMetadata 기본 메시지 구조를 생성한다.
// 메타데이터가 없는 초기 상태를 반환한다.
function createBaseMsgSetDenomMetadata() {
  return {
    sender: '',
    metadata: undefined,
  };
}

export const MsgCreateDenom = {
  encode(message, writer = BinaryWriter.create()) {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.subdenom !== '') {
      writer.uint32(18).string(message.subdenom);
    }
    return writer;
  },

  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDenom();

    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.subdenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object) {
    const message = createBaseMsgCreateDenom();
    message.sender = object?.sender ?? '';
    message.subdenom = object?.subdenom ?? '';
    return message;
  },
};

export const MsgMint = {
  encode(message, writer = BinaryWriter.create()) {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
    }
    if (message.mintToAddress !== '') {
      writer.uint32(26).string(message.mintToAddress);
    }
    return writer;
  },

  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgMint();

    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        case 3:
          message.mintToAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object) {
    const message = createBaseMsgMint();
    message.sender = object?.sender ?? '';
    message.amount = object?.amount ? Coin.fromPartial(object.amount) : undefined;
    message.mintToAddress = object?.mintToAddress ?? '';
    return message;
  },
};

export const MsgSetDenomMetadata = {
  encode(message, writer = BinaryWriter.create()) {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.metadata !== undefined) {
      Metadata.encode(message.metadata, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetDenomMetadata();

    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.metadata = Metadata.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object) {
    const message = createBaseMsgSetDenomMetadata();
    message.sender = object?.sender ?? '';
    message.metadata = object?.metadata ? Metadata.fromPartial(object.metadata) : undefined;
    return message;
  },
};

export function getTokenFactoryRegistryTypes(createDenomTypeUrl, mintTypeUrl, setMetadataTypeUrl) {
  const entries = [];

  if (createDenomTypeUrl?.trim()) {
    entries.push([createDenomTypeUrl.trim(), MsgCreateDenom]);
  }

  if (mintTypeUrl?.trim()) {
    entries.push([mintTypeUrl.trim(), MsgMint]);
  }

  if (setMetadataTypeUrl?.trim()) {
    entries.push([setMetadataTypeUrl.trim(), MsgSetDenomMetadata]);
  }

  return entries;
}
