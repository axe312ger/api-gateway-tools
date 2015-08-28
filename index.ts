/// <reference path="typings/tsd.d.ts" />
/// <reference path="data.d.ts" />
import fetch from 'node-fetch'
import AWS from 'aws-sdk'

interface Payload {
  [key: string]: any
}

interface SendRequest {
  <T>(methodAndPath: string, payload?: Payload): Promise<T>;
}

export interface Resource {
  id: string;
  updateMethod (httpMethod: string, params: Payload): Promise<Method>;
}

export interface Method {
  arn (region: string, accountId: string, deploymentStage?: string): string;
  updateIntegration (params: Payload): Promise<Payload>;
  updateIntegrationResponse (statusCode: number, params: Payload): Promise<Payload>;
  updateResponse (statusCode: number, params: Payload): Promise<Payload>;
}

function isVoid(val: any): val is void { return val == null; } // also captures undefined

export default async function getOrCreateApi (region: string, name: string, description: string) {
  const request: SendRequest = createClient(region)
  const existingApis = (await request<data.List<data.RestApi>>('GET /restapis')).item
  const existing = first(existingApis, api => api.name === name)
  const api = !isVoid(existing) ? existing : (await request<data.RestApi>('POST /restapis', { name, description }))

  const existingResources = (
    await request<data.List<data.Resource>>(`GET /restapis/${api.id}/resources`)
  ).item.reduce(
    (map, resource) => map.set(resource.path, wrapResourceData(request, api, resource)),
    new Map()
  )

  return {
    id: api.id,
    createDeployment,
    getOrCreateResource
  }

  async function createDeployment(stageName: string) {
    return request(`POST /restapis/${api.id}/deployments`, {stageName})
  }

  async function getOrCreateResource (path: string) {
    const pathParts = path.split('/').slice(1)

    for (let i = 0, len = pathParts.length; i < len; i++) {
      let pathPart = pathParts[i]
      let subPath = '/' + pathParts.slice(0, i + 1).join('/')
      let parentPath = '/' + pathParts.slice(0, i).join('/')

      let parentResource = existingResources.get(parentPath)
      let existingResource = existingResources.get(subPath)

      if (!(parentResource && parentResource.id)) {
        throw new Error(`Parent Resource ${parentPath} must be created before ${subPath}`)
      }

      if (!existingResource) {
        let newResource = await request<data.Resource>(`POST /restapis/${api.id}/resources/${parentResource.id}`, { pathPart })
        existingResources.set(newResource.path, wrapResourceData(request, api, newResource))
      }
    }

    return existingResources.get(path)
  }
}

function wrapResourceData (request: SendRequest, api: data.RestApi, resource: data.Resource): Resource {
  return { id: resource.id, updateMethod }

  async function updateMethod (httpMethod: string, params: Payload) {
    const methodPath = `/restapis/${api.id}/resources/${resource.id}/methods/${httpMethod}`
    try {
      // YOLO
      await request(`DELETE ${methodPath}`)
    } catch (_) {
    }
    return wrapMethodData(request, api, resource, httpMethod, await request(`PUT ${methodPath}`, params))
  }
}

function wrapMethodData (request: SendRequest, api: data.RestApi, resource: data.Resource, httpMethod: string, methodData: data.Method): Method {
  return {arn, updateResponse, updateIntegration, updateIntegrationResponse}

  function arn (region: string, accountId: string, deploymentStage = '*') {
    const path = resource.path.replace(/\{[^\/\}]+\}/g, '*')
    return `arn:aws:execute-api:${region}:${accountId}:${api.id}/${deploymentStage}/${httpMethod}${path}`
  }

  function updateResponse(statusCode: number, params: Payload) {
    return request<Payload>(
      `PUT /restapis/${api.id}/resources/${resource.id}/methods/${httpMethod}/responses/${statusCode}`,
      params
    )
  }

  function updateIntegration (params: Payload) {
    return request<Payload>(`PUT /restapis/${api.id}/resources/${resource.id}/methods/${httpMethod}/integration`, params)
  }

  async function updateIntegrationResponse (statusCode: number, params: Payload) {
    return request<Payload>(`PUT /restapis/${api.id}/resources/${resource.id}/methods/${httpMethod}/integration/responses/${statusCode}`, params)
  }
}

function createClient (region: string) {
  const Host = `apigateway.${region}.amazonaws.com`

  return async function request<T>(methodAndPath: string, payload?: Object): Promise<T> {
    const [method, path] = methodAndPath.split(' ')
    // this object matches the `Request` interface needed by AWS signers
    const headers : {[index:string]: string} = { Host };
    const opts = {
      region,
      method, 
      headers,
      body: '',
      pathname () { return path },
      search () { return '' },
    }

    if (payload) {
      opts.body = JSON.stringify(payload)
      opts.headers['Content-Type'] = 'application/json'
      opts.headers['Content-Length'] = Buffer.byteLength(opts.body, 'utf-8').toString()
    }

    var signer = new AWS.Signers.V4(opts, 'apigateway')
    signer.addAuthorization(new AWS.Config().credentials, new Date())

    const response = await fetch('https://apigateway.eu-west-1.amazonaws.com' + path, opts)
    const body = await response.json()

    if (response.status > 399) {
      const error = new Error(methodAndPath + ' ' + (<{message: string}> body).message)
      throw error
    } else {
      return <T> body
    }
  }
}

function first <T>(array: T[], pred: (item: T) => boolean): T|void {
  return array.filter(pred)[0]
}
