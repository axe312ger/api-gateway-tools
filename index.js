/* @flow */
import fetch from 'node-fetch'
import AWS from 'aws-sdk'

export default async function getOrCreateApi (region: string, name: string, description: string) {
  const request = createClient(region)
  const existing = (await request('GET /restapis')).item.filter(api => api.name === name)[0]
  const api = existing || (await request('POST /restapis', { name, description }))

  const existingResources = (await request(`GET /restapis/${api.id}/resources`)).item.reduce(
    (map, resource) => map.set(resource.path, resourceInterface(request, api, resource)),
    new Map()
  )

  return {
    id: api.id,
    createDeployment,
    getOrCreateResource
  }

  async function createDeployment (stageName) {
    return request(`POST /restapis/${api.id}/deployments`, {stageName})
  }

  async function getOrCreateResource (path) {
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
        let newResource = await request(`POST /restapis/${api.id}/resources/${parentResource.id}`, { pathPart })
        existingResources.set(newResource.path, resourceInterface(request, api, newResource))
      }
    }

    return existingResources.get(path)
  }
}

function resourceInterface (request, api, resource) {
  return { id: resource.id, updateMethod }

  async function updateMethod (httpMethod, params) {
    const methodPath = `/restapis/${api.id}/resources/${resource.id}/methods/${httpMethod}`
    try {
      // YOLO
      await request(`DELETE ${methodPath}`)
    } catch (_) {
    }
    return methodInterface(request, api, resource, httpMethod, await request(`PUT ${methodPath}`, params))
  }
}

function methodInterface (request, api, resource, httpMethod, methodData) {
  return {arn, updateResponse, updateIntegration, updateIntegrationResponse}

  function arn (region, accountId, deploymentStage = '*') {
    return `arn:aws:execute-api:${region}:${accountId}:${api.id}/${deploymentStage}/${httpMethod}${resource.path}`
  }

  function updateResponse(statusCode, params) {
    return request(
      `PUT /restapis/${api.id}/resources/${resource.id}/methods/${httpMethod}/responses/${statusCode}`,
      params
    )
  }

  function updateIntegration (params) {
    return request(`PUT /restapis/${api.id}/resources/${resource.id}/methods/${httpMethod}/integration`, params)
  }

  async function updateIntegrationResponse (statusCode, params) {
    return request(`PUT /restapis/${api.id}/resources/${resource.id}/methods/${httpMethod}/integration/responses/${statusCode}`, params)
  }
}

function createClient (region) {
  const Host = `apigateway.${region}.amazonaws.com`

  return async function request (methodAndPath, payload) {
    console.log(methodAndPath, payload)
    const [method, path] = methodAndPath.split(' ')
    // this object matches the `Request` interface needed by AWS signers
    const opts = {
      region,
      method, 
      headers: { Host },
      pathname () { return path },
      search () { return '' },
    }

    if (payload) {
      opts.body = JSON.stringify(payload)
      opts.headers['Content-Type'] = 'application/json'
      opts.headers['Content-Length'] = Buffer.byteLength(opts.body, 'utf-8')
    }

    var signer = new AWS.Signers.V4(opts, 'apigateway')
    signer.addAuthorization(new AWS.Config().credentials, new Date())

    const response = await fetch('https://apigateway.eu-west-1.amazonaws.com' + path, opts)
    const body = await response.json()

    if (response.status > 399) {
      const error = new Error(methodAndPath + ' ' + body.message)
      throw error
    } else {
      return body
    }
  }
}
