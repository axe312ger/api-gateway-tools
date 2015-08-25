'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

exports['default'] = function getOrCreateApi(region, name, description) {
  var request, existing, api, existingResources, createDeployment, getOrCreateResource;
  return regeneratorRuntime.async(function getOrCreateApi$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        getOrCreateResource = function getOrCreateResource(path) {
          var pathParts, i, len, pathPart, subPath, parentPath, parentResource, existingResource, newResource;
          return regeneratorRuntime.async(function getOrCreateResource$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                pathParts = path.split('/').slice(1);
                i = 0, len = pathParts.length;

              case 2:
                if (!(i < len)) {
                  context$2$0.next = 18;
                  break;
                }

                pathPart = pathParts[i];
                subPath = '/' + pathParts.slice(0, i + 1).join('/');
                parentPath = '/' + pathParts.slice(0, i).join('/');
                parentResource = existingResources.get(parentPath);
                existingResource = existingResources.get(subPath);

                if (parentResource && parentResource.id) {
                  context$2$0.next = 10;
                  break;
                }

                throw new Error('Parent Resource ' + parentPath + ' must be created before ' + subPath);

              case 10:
                if (existingResource) {
                  context$2$0.next = 15;
                  break;
                }

                context$2$0.next = 13;
                return regeneratorRuntime.awrap(request('POST /restapis/' + api.id + '/resources/' + parentResource.id, { pathPart: pathPart }));

              case 13:
                newResource = context$2$0.sent;

                existingResources.set(newResource.path, resourceInterface(request, api, newResource));

              case 15:
                i++;
                context$2$0.next = 2;
                break;

              case 18:
                return context$2$0.abrupt('return', existingResources.get(path));

              case 19:
              case 'end':
                return context$2$0.stop();
            }
          }, null, this);
        };

        createDeployment = function createDeployment(stageName) {
          return regeneratorRuntime.async(function createDeployment$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                return context$2$0.abrupt('return', request('POST /restapis/' + api.id + '/deployments', { stageName: stageName }));

              case 1:
              case 'end':
                return context$2$0.stop();
            }
          }, null, this);
        };

        request = createClient(region);
        context$1$0.next = 5;
        return regeneratorRuntime.awrap(request('GET /restapis'));

      case 5:
        context$1$0.t0 = function (api) {
          return api.name === name;
        };

        existing = context$1$0.sent.item.filter(context$1$0.t0)[0];
        context$1$0.t1 = existing;

        if (context$1$0.t1) {
          context$1$0.next = 12;
          break;
        }

        context$1$0.next = 11;
        return regeneratorRuntime.awrap(request('POST /restapis', { name: name, description: description }));

      case 11:
        context$1$0.t1 = context$1$0.sent;

      case 12:
        api = context$1$0.t1;
        context$1$0.next = 15;
        return regeneratorRuntime.awrap(request('GET /restapis/' + api.id + '/resources'));

      case 15:
        context$1$0.t2 = function (map, resource) {
          return map.set(resource.path, resourceInterface(request, api, resource));
        };

        context$1$0.t3 = new Map();
        existingResources = context$1$0.sent.item.reduce(context$1$0.t2, context$1$0.t3);
        return context$1$0.abrupt('return', {
          id: api.id,
          createDeployment: createDeployment,
          getOrCreateResource: getOrCreateResource
        });

      case 19:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

function resourceInterface(request, api, resource) {
  return { id: resource.id, updateMethod: updateMethod };

  function updateMethod(httpMethod, params) {
    var methodPath;
    return regeneratorRuntime.async(function updateMethod$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          methodPath = '/restapis/' + api.id + '/resources/' + resource.id + '/methods/' + httpMethod;
          context$2$0.prev = 1;
          context$2$0.next = 4;
          return regeneratorRuntime.awrap(request('DELETE ' + methodPath));

        case 4:
          context$2$0.next = 8;
          break;

        case 6:
          context$2$0.prev = 6;
          context$2$0.t0 = context$2$0['catch'](1);

        case 8:
          context$2$0.t1 = request;
          context$2$0.t2 = api;
          context$2$0.t3 = resource;
          context$2$0.t4 = httpMethod;
          context$2$0.next = 14;
          return regeneratorRuntime.awrap(request('PUT ' + methodPath, params));

        case 14:
          context$2$0.t5 = context$2$0.sent;
          return context$2$0.abrupt('return', methodInterface(context$2$0.t1, context$2$0.t2, context$2$0.t3, context$2$0.t4, context$2$0.t5));

        case 16:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this, [[1, 6]]);
  }
}

function methodInterface(request, api, resource, httpMethod, methodData) {
  return { arn: arn, updateResponse: updateResponse, updateIntegration: updateIntegration, updateIntegrationResponse: updateIntegrationResponse };

  function arn(region, accountId) {
    var deploymentStage = arguments.length <= 2 || arguments[2] === undefined ? '*' : arguments[2];

    return 'arn:aws:execute-api:' + region + ':' + accountId + ':' + api.id + '/' + deploymentStage + '/' + httpMethod + resource.path;
  }

  function updateResponse(statusCode, params) {
    return request('PUT /restapis/' + api.id + '/resources/' + resource.id + '/methods/' + httpMethod + '/responses/' + statusCode, params);
  }

  function updateIntegration(params) {
    return request('PUT /restapis/' + api.id + '/resources/' + resource.id + '/methods/' + httpMethod + '/integration', params);
  }

  function updateIntegrationResponse(statusCode, params) {
    return regeneratorRuntime.async(function updateIntegrationResponse$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          return context$2$0.abrupt('return', request('PUT /restapis/' + api.id + '/resources/' + resource.id + '/methods/' + httpMethod + '/integration/responses/' + statusCode, params));

        case 1:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  }
}

function createClient(region) {
  var Host = 'apigateway.' + region + '.amazonaws.com';

  return function request(methodAndPath, payload) {
    var _methodAndPath$split, _methodAndPath$split2, method, path, opts, signer, response, body, error;

    return regeneratorRuntime.async(function request$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          console.log(methodAndPath, payload);
          _methodAndPath$split = methodAndPath.split(' ');
          _methodAndPath$split2 = _slicedToArray(_methodAndPath$split, 2);
          method = _methodAndPath$split2[0];
          path = _methodAndPath$split2[1];
          opts = {
            region: region,
            method: method,
            headers: { Host: Host },
            pathname: function pathname() {
              return path;
            },
            search: function search() {
              return '';
            }
          };

          if (payload) {
            opts.body = JSON.stringify(payload);
            opts.headers['Content-Type'] = 'application/json';
            opts.headers['Content-Length'] = Buffer.byteLength(opts.body, 'utf-8');
          }

          signer = new _awsSdk2['default'].Signers.V4(opts, 'apigateway');

          signer.addAuthorization(new _awsSdk2['default'].Config().credentials, new Date());

          context$2$0.next = 11;
          return regeneratorRuntime.awrap((0, _nodeFetch2['default'])('https://apigateway.' + region + '.amazonaws.com' + path, opts));

        case 11:
          response = context$2$0.sent;
          context$2$0.next = 14;
          return regeneratorRuntime.awrap(response.json());

        case 14:
          body = context$2$0.sent;

          if (!(response.status > 399)) {
            context$2$0.next = 20;
            break;
          }

          error = new Error(methodAndPath + ' ' + body.message);
          throw error;

        case 20:
          return context$2$0.abrupt('return', body);

        case 21:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  };
}
module.exports = exports['default'];

// YOLO

// this object matches the `Request` interface needed by AWS signers

