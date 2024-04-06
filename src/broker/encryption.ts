/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import {
  Direction as CoreDirection,
  KeyPairType as CoreKeyPairType,
  PreKeyPairType as CorePreKeyPairType,
  SignedPreKeyPairType as CoreSignedPreKeyPairType,
  EncryptedMessage,
  LocalEncryptionBundle,
  PreKeyBundle,
  ProseEncryptionService,
  SignalRepo
} from "@prose-im/prose-sdk-js";
import {
  Direction,
  KeyHelper,
  KeyPairType,
  SessionBuilder,
  SessionCipher,
  SignalProtocolAddress,
  StorageType
} from "@privacyresearch/libsignal-protocol-typescript";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const SECOND_TO_MILLISECONDS = 1000; // 1 second

const BUNDLE_PRE_KEYS_SIZE = 100;

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEncryptionStore implements StorageType {
  private readonly __repo: SignalRepo;

  constructor(repo: SignalRepo) {
    this.__repo = repo;
  }

  async getIdentityKeyPair(): Promise<KeyPairType<ArrayBuffer> | undefined> {
    const identityPair = await this.__repo.getIdentityKeyPair();

    if (identityPair) {
      // Return identity pair
      return {
        pubKey: identityPair.publicKey.buffer,
        privKey: identityPair.privateKey.buffer
      };
    }

    return undefined;
  }

  async getLocalRegistrationId(): Promise<number | undefined> {
    return await this.__repo.getLocalRegistrationId();
  }

  async isTrustedIdentity(
    identifier: string,
    identityKey: ArrayBuffer,
    direction: Direction
  ): Promise<boolean> {
    // Map direction to core direction
    let coreDirection: CoreDirection;

    switch (direction) {
      case Direction.SENDING: {
        coreDirection = CoreDirection.Sending;

        break;
      }

      case Direction.RECEIVING: {
        coreDirection = CoreDirection.Receiving;

        break;
      }
    }

    return await this.__repo.isTrustedIdentity(
      identifier,
      new Uint8Array(identityKey),
      coreDirection
    );
  }

  async saveIdentity(
    encodedAddress: string,
    publicKey: ArrayBuffer,
    nonblockingApproval?: boolean | undefined
  ): Promise<boolean> {
    return await this.__repo.saveIdentity(
      encodedAddress,
      new Uint8Array(publicKey),
      nonblockingApproval
    );
  }

  async loadPreKey(
    encodedAddress: string | number
  ): Promise<KeyPairType<ArrayBuffer> | undefined> {
    const preKey = await this.__repo.loadPreKey(encodedAddress);

    if (preKey) {
      // Return pre key
      return {
        pubKey: preKey.publicKey.buffer,
        privKey: preKey.privateKey.buffer
      };
    }

    return undefined;
  }

  async storePreKey(
    keyId: string | number,
    keyPair: KeyPairType<ArrayBuffer>
  ): Promise<void> {
    await this.__repo.storePreKey(
      keyId,

      new CoreKeyPairType(
        new Uint8Array(keyPair.pubKey),
        new Uint8Array(keyPair.privKey)
      )
    );
  }

  async removePreKey(keyId: string | number): Promise<void> {
    await this.__repo.removePreKey(keyId);
  }

  async storeSession(encodedAddress: string, record: string): Promise<void> {
    await this.__repo.storeSession(encodedAddress, record);
  }

  async loadSession(encodedAddress: string): Promise<string | undefined> {
    return await this.__repo.loadSession(encodedAddress);
  }

  async loadSignedPreKey(
    keyId: string | number
  ): Promise<KeyPairType<ArrayBuffer> | undefined> {
    const preKey = await this.__repo.loadSignedPreKey(keyId);

    if (preKey) {
      // Return signed pre key
      return {
        pubKey: preKey.publicKey.buffer,
        privKey: preKey.privateKey.buffer
      };
    }

    return undefined;
  }

  async storeSignedPreKey(
    keyId: string | number,
    keyPair: KeyPairType<ArrayBuffer>
  ): Promise<void> {
    if (typeof keyId !== "number") {
      throw new Error(`Unexpected keyId '${keyId}'`);
    }

    // Generate signed pre key
    const signedKeyPair = await KeyHelper.generateSignedPreKey(keyPair, keyId);

    // Store signed pre key
    await this.__repo.storeSignedPreKey(
      new CoreSignedPreKeyPairType(
        keyId,

        new CoreKeyPairType(
          new Uint8Array(signedKeyPair.keyPair.pubKey),
          new Uint8Array(signedKeyPair.keyPair.privKey)
        ),

        new Uint8Array(signedKeyPair.signature)
      ),

      Date.now() / SECOND_TO_MILLISECONDS
    );
  }

  async removeSignedPreKey(keyId: string | number): Promise<void> {
    await this.__repo.removeSignedPreKey(keyId);
  }
}

class BrokerEncryption implements ProseEncryptionService {
  async generateLocalEncryptionBundle(): Promise<LocalEncryptionBundle> {
    // Generate identity keypair
    const identityKeyPair = await KeyHelper.generateIdentityKeyPair();

    // Generate signed pre key
    const signedPreKeyId = 0;

    const signedPreKey = await KeyHelper.generateSignedPreKey(
      identityKeyPair,
      signedPreKeyId
    );

    // Generate all pre keys
    const preKeys = [];

    for (let keyId = 1; keyId <= BUNDLE_PRE_KEYS_SIZE; keyId++) {
      const preKey = await KeyHelper.generatePreKey(keyId);

      preKeys.push(
        new CorePreKeyPairType(
          keyId,

          new CoreKeyPairType(
            new Uint8Array(preKey.keyPair.pubKey),
            new Uint8Array(preKey.keyPair.privKey)
          )
        )
      );
    }

    // Create local encryption bundle
    return new LocalEncryptionBundle(
      new CoreKeyPairType(
        new Uint8Array(identityKeyPair.pubKey),
        new Uint8Array(identityKeyPair.privKey)
      ),

      new CoreSignedPreKeyPairType(
        signedPreKey.keyId,

        new CoreKeyPairType(
          new Uint8Array(signedPreKey.keyPair.pubKey),
          new Uint8Array(signedPreKey.keyPair.privKey)
        ),

        new Uint8Array(signedPreKey.signature)
      ),

      preKeys
    );
  }

  async generatePreKeysWithIds(ids: number[]): Promise<CorePreKeyPairType[]> {
    // Generate all pre keys
    const preKeys = [];

    for (const id of ids) {
      const preKey = await KeyHelper.generatePreKey(id);

      preKeys.push(
        new CorePreKeyPairType(
          id,

          new CoreKeyPairType(
            new Uint8Array(preKey.keyPair.pubKey),
            new Uint8Array(preKey.keyPair.privKey)
          )
        )
      );
    }

    return preKeys;
  }

  async processPreKeyBundle(
    repo: SignalRepo,
    userId: string,
    deviceId: number,
    bundle: PreKeyBundle
  ): Promise<void> {
    const store = new BrokerEncryptionStore(repo),
      address = new SignalProtocolAddress(userId, deviceId),
      sessionBuilder = new SessionBuilder(store, address);

    await sessionBuilder.processPreKey({
      identityKey: bundle.identityKey.buffer,

      signedPreKey: {
        keyId: bundle.signedPreKey.keyId,
        publicKey: bundle.signedPreKey.publicKey.buffer,
        signature: bundle.signedPreKey.signature.buffer
      },

      preKey: {
        keyId: bundle.preKey.keyId,
        publicKey: bundle.preKey.publicKey.buffer
      },

      registrationId: bundle.registrationId
    });
  }

  async decryptKey(
    repo: SignalRepo,
    userId: string,
    deviceId: number,
    encryptedMessage: Uint8Array,
    isPreKey: boolean
  ): Promise<Uint8Array> {
    const store = new BrokerEncryptionStore(repo),
      address = new SignalProtocolAddress(userId, deviceId),
      sessionCipher = new SessionCipher(store, address);

    // Proceed decryption of encrypted message
    let plainText: ArrayBuffer;

    if (isPreKey) {
      plainText = await sessionCipher.decryptPreKeyWhisperMessage(
        encryptedMessage,
        "binary"
      );
    } else {
      plainText = await sessionCipher.decryptWhisperMessage(
        encryptedMessage,
        "binary"
      );
    }

    return new Uint8Array(plainText);
  }

  async encryptKey(
    repo: SignalRepo,
    userId: string,
    deviceId: number,
    message: Uint8Array
  ): Promise<EncryptedMessage> {
    const store = new BrokerEncryptionStore(repo),
      address = new SignalProtocolAddress(userId, deviceId),
      sessionCipher = new SessionCipher(store, address);

    // Encrypt provided plain text message
    const cipher = await sessionCipher.encrypt(message.buffer);

    // Notice: the function 'sessionCipher.encrypt()' always returns a \
    //   MessageType object. Sometimes it is a PreKeyWhisperMessage and \
    //   sometimes it is a WhisperMessage. To distinguish, check \
    //   'ciphertext.type'. If 'ciphertext.type' is 3 then 'ciphertext.body' \
    //   contains a serialized PreKeyWhisperMessage. If 'ciphertext.type' is 1 \
    //   then 'ciphertext.body' contains a serialized WhisperMessage.
    const bytesLen = cipher.body?.length || 0,
      bytes = new Uint8Array(bytesLen);

    if (cipher.body) {
      for (let i = 0; i < bytesLen; i++) {
        bytes[i] = cipher.body?.charCodeAt(i);
      }
    }

    return new EncryptedMessage(bytes, cipher.type === 3);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEncryption;
