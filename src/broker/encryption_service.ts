/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

import {
  Direction,
  KeyHelper,
  KeyPairType,
  SessionBuilder,
  SessionCipher,
  SignalProtocolAddress,
  StorageType
} from "@privacyresearch/libsignal-protocol-typescript";

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

class EncryptionService implements ProseEncryptionService {
  async generateLocalEncryptionBundle(): Promise<LocalEncryptionBundle> {
    const identityKeyPair = await KeyHelper.generateIdentityKeyPair();

    const signedPreKeyId = 0;
    const signedPreKey = await KeyHelper.generateSignedPreKey(
      identityKeyPair,
      signedPreKeyId
    );

    const preKeys = [];
    for (let keyId = 1; keyId <= 100; keyId++) {
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
    user_id: string,
    device_id: number,
    bundle: PreKeyBundle
  ): Promise<void> {
    const store = new EncryptionStore(repo);
    const address = new SignalProtocolAddress(user_id, device_id);
    const sessionBuilder = new SessionBuilder(store, address);

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
    user_id: string,
    device_id: number,
    encryptedMessage: Uint8Array,
    isPreKey: boolean
  ): Promise<Uint8Array> {
    const store = new EncryptionStore(repo);
    const address = new SignalProtocolAddress(user_id, device_id);
    const sessionCipher = new SessionCipher(store, address);

    let plaintext: ArrayBuffer;

    if (isPreKey) {
      plaintext = await sessionCipher.decryptPreKeyWhisperMessage(
        encryptedMessage,
        "binary"
      );
    } else {
      plaintext = await sessionCipher.decryptWhisperMessage(
        encryptedMessage,
        "binary"
      );
    }

    return new Uint8Array(plaintext);
  }

  async encryptKey(
    repo: SignalRepo,
    user_id: string,
    device_id: number,
    message: Uint8Array
  ): Promise<EncryptedMessage> {
    const store = new EncryptionStore(repo);
    const address = new SignalProtocolAddress(user_id, device_id);
    const sessionCipher = new SessionCipher(store, address);

    const cipher = await sessionCipher.encrypt(message.buffer);

    // The function sessionCipher.encrypt() always returns a MessageType object.
    // Sometimes it is a PreKeyWhisperMessage and sometimes it is a WhisperMessage.
    // To distinguish, check ciphertext.type. If ciphertext.type === 3
    // then ciphertext.body contains a serialized PreKeyWhisperMessage.
    // If ciphertext.type === 1 then ciphertext.body contains a serialized WhisperMessage.*
    const bytesLen = cipher.body?.length || 0;
    const bytes = new Uint8Array(bytesLen);

    if (cipher.body) {
      for (let i = 0; i < bytesLen; i++) {
        bytes[i] = cipher.body?.charCodeAt(i);
      }
    }

    return new EncryptedMessage(bytes, cipher.type == 3);
  }
}

class EncryptionStore implements StorageType {
  private repo: SignalRepo;

  constructor(repo: SignalRepo) {
    this.repo = repo;
  }

  async getIdentityKeyPair(): Promise<KeyPairType<ArrayBuffer> | undefined> {
    const identity_pair = await this.repo.getIdentityKeyPair();
    if (!identity_pair) {
      return undefined;
    }
    return {
      pubKey: identity_pair.publicKey.buffer,
      privKey: identity_pair.privateKey.buffer
    };
  }

  async getLocalRegistrationId(): Promise<number | undefined> {
    return await this.repo.getLocalRegistrationId();
  }

  async isTrustedIdentity(
    identifier: string,
    identityKey: ArrayBuffer,
    direction: Direction
  ): Promise<boolean> {
    let coreDirection: CoreDirection;

    switch (direction) {
      case Direction.SENDING:
        coreDirection = CoreDirection.Sending;
        break;

      case Direction.RECEIVING:
        coreDirection = CoreDirection.Receiving;
        break;
    }

    return await this.repo.isTrustedIdentity(
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
    return await this.repo.saveIdentity(
      encodedAddress,
      new Uint8Array(publicKey),
      nonblockingApproval
    );
  }

  async loadPreKey(
    encodedAddress: string | number
  ): Promise<KeyPairType<ArrayBuffer> | undefined> {
    const preKey = await this.repo.loadPreKey(encodedAddress);
    if (!preKey) {
      return undefined;
    }
    return {
      pubKey: preKey.publicKey.buffer,
      privKey: preKey.privateKey.buffer
    };
  }

  async storePreKey(
    keyId: string | number,
    keyPair: KeyPairType<ArrayBuffer>
  ): Promise<void> {
    await this.repo.storePreKey(
      keyId,
      new CoreKeyPairType(
        new Uint8Array(keyPair.pubKey),
        new Uint8Array(keyPair.privKey)
      )
    );
  }

  async removePreKey(keyId: string | number): Promise<void> {
    await this.repo.removePreKey(keyId);
  }

  async storeSession(encodedAddress: string, record: string): Promise<void> {
    await this.repo.storeSession(encodedAddress, record);
  }

  async loadSession(encodedAddress: string): Promise<string | undefined> {
    return await this.repo.loadSession(encodedAddress);
  }

  async loadSignedPreKey(
    keyId: string | number
  ): Promise<KeyPairType<ArrayBuffer> | undefined> {
    const preKey = await this.repo.loadSignedPreKey(keyId);
    if (!preKey) {
      return undefined;
    }
    return {
      pubKey: preKey.publicKey.buffer,
      privKey: preKey.privateKey.buffer
    };
  }

  async storeSignedPreKey(
    keyId: string | number,
    keyPair: KeyPairType<ArrayBuffer>
  ): Promise<void> {
    if (typeof keyId != "number") {
      throw new Error(`Unexpected keyId '${keyId}'`);
    }

    const signedKeyPair = await KeyHelper.generateSignedPreKey(keyPair, keyId);

    await this.repo.storeSignedPreKey(
      new CoreSignedPreKeyPairType(
        keyId,
        new CoreKeyPairType(
          new Uint8Array(signedKeyPair.keyPair.pubKey),
          new Uint8Array(signedKeyPair.keyPair.privKey)
        ),
        new Uint8Array(signedKeyPair.signature)
      ),
      new Date().getTime() / 1000
    );
  }

  async removeSignedPreKey(keyId: string | number): Promise<void> {
    await this.repo.removeSignedPreKey(keyId);
  }
}

export default EncryptionService;
