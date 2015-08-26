/// <reference path="whatwg-fetch/whatwg-fetch.d.ts" />
/// <reference path="node/node.d.ts" />

declare module "node-fetch" {
  export default window.fetch;
}

declare module "aws-sdk" {
  export class Credentials { }

  export class Config {
    credentials: Credentials;
  }

  export class Request {[key: string]: any}

  export module Signers {
    export class V4 {
      constructor(request: Request, service: string)
      addAuthorization(creds: Credentials, now: Date): void
    }
  }

  export default { Config, Signers }
}
