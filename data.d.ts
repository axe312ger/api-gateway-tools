declare module data {
  export interface List<T> {
    item: Array<T>;
  }

  export interface RestApi {
    id: string;
    name: string;
  }

  export interface Resource {
    name: string;
    id: string;
    path: string;
  }

  export interface Method {
  }

  export interface Integration {
  }

  export interface IntegrationResponse {
  }

  export interface Response {
  }
}
