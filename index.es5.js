"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

exports["default"] = getOrCreateApi;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) {
            return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) {
                resolve(value);
            });
        }
        function onfulfill(value) {
            try {
                step("next", value);
            } catch (e) {
                reject(e);
            }
        }
        function onreject(value) {
            try {
                step("throw", value);
            } catch (e) {
                reject(e);
            }
        }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};

function isVoid(val) {
    return val == null;
} // also captures undefined

function getOrCreateApi(region, name, description) {
    return __awaiter(this, void 0, Promise, regeneratorRuntime.mark(function callee$1$0() {
        var request, existingApis, existing, api, existingResources, createDeployment, getOrCreateResource;
        return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    getOrCreateResource = function getOrCreateResource(path) {
                        return __awaiter(this, void 0, Promise, regeneratorRuntime.mark(function callee$3$0() {
                            var pathParts, i, len, pathPart, subPath, parentPath, parentResource, existingResource, newResource;
                            return regeneratorRuntime.wrap(function callee$3$0$(context$4$0) {
                                while (1) switch (context$4$0.prev = context$4$0.next) {
                                    case 0:
                                        pathParts = path.split('/').slice(1);
                                        i = 0, len = pathParts.length;

                                    case 2:
                                        if (!(i < len)) {
                                            context$4$0.next = 18;
                                            break;
                                        }

                                        pathPart = pathParts[i];
                                        subPath = '/' + pathParts.slice(0, i + 1).join('/');
                                        parentPath = '/' + pathParts.slice(0, i).join('/');
                                        parentResource = existingResources.get(parentPath);
                                        existingResource = existingResources.get(subPath);

                                        if (parentResource && parentResource.id) {
                                            context$4$0.next = 10;
                                            break;
                                        }

                                        throw new Error("Parent Resource " + parentPath + " must be created before " + subPath);

                                    case 10:
                                        if (existingResource) {
                                            context$4$0.next = 15;
                                            break;
                                        }

                                        context$4$0.next = 13;
                                        return request("POST /restapis/" + api.id + "/resources/" + parentResource.id, { pathPart: pathPart });

                                    case 13:
                                        newResource = context$4$0.sent;

                                        existingResources.set(newResource.path, wrapResourceData(request, api, newResource));

                                    case 15:
                                        i++;
                                        context$4$0.next = 2;
                                        break;

                                    case 18:
                                        return context$4$0.abrupt("return", existingResources.get(path));

                                    case 19:
                                    case "end":
                                        return context$4$0.stop();
                                }
                            }, callee$3$0, this);
                        }));
                    };

                    createDeployment = function createDeployment(stageName) {
                        return __awaiter(this, void 0, Promise, regeneratorRuntime.mark(function callee$3$0() {
                            return regeneratorRuntime.wrap(function callee$3$0$(context$4$0) {
                                while (1) switch (context$4$0.prev = context$4$0.next) {
                                    case 0:
                                        return context$4$0.abrupt("return", request("POST /restapis/" + api.id + "/deployments", { stageName: stageName }));

                                    case 1:
                                    case "end":
                                        return context$4$0.stop();
                                }
                            }, callee$3$0, this);
                        }));
                    };

                    request = createClient(region);
                    context$2$0.next = 5;
                    return request('GET /restapis');

                case 5:
                    existingApis = context$2$0.sent.item;
                    existing = first(existingApis, function (api) {
                        return api.name === name;
                    });

                    if (isVoid(existing)) {
                        context$2$0.next = 11;
                        break;
                    }

                    context$2$0.t0 = existing;
                    context$2$0.next = 14;
                    break;

                case 11:
                    context$2$0.next = 13;
                    return request('POST /restapis', { name: name, description: description });

                case 13:
                    context$2$0.t0 = context$2$0.sent;

                case 14:
                    api = context$2$0.t0;
                    context$2$0.next = 17;
                    return request("GET /restapis/" + api.id + "/resources");

                case 17:
                    context$2$0.t1 = function (map, resource) {
                        return map.set(resource.path, wrapResourceData(request, api, resource));
                    };

                    context$2$0.t2 = new Map();
                    existingResources = context$2$0.sent.item.reduce(context$2$0.t1, context$2$0.t2);
                    return context$2$0.abrupt("return", {
                        id: api.id,
                        createDeployment: createDeployment,
                        getOrCreateResource: getOrCreateResource
                    });

                case 21:
                case "end":
                    return context$2$0.stop();
            }
        }, callee$1$0, this);
    }));
}

;
function wrapResourceData(request, api, resource) {
    return { id: resource.id, updateMethod: updateMethod };
    function updateMethod(httpMethod, params) {
        return __awaiter(this, void 0, Promise, regeneratorRuntime.mark(function callee$2$0() {
            var methodPath;
            return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        methodPath = "/restapis/" + api.id + "/resources/" + resource.id + "/methods/" + httpMethod;
                        context$3$0.prev = 1;
                        context$3$0.next = 4;
                        return request("DELETE " + methodPath);

                    case 4:
                        context$3$0.next = 8;
                        break;

                    case 6:
                        context$3$0.prev = 6;
                        context$3$0.t0 = context$3$0["catch"](1);

                    case 8:
                        context$3$0.t1 = request;
                        context$3$0.t2 = api;
                        context$3$0.t3 = resource;
                        context$3$0.t4 = httpMethod;
                        context$3$0.next = 14;
                        return request("PUT " + methodPath, params);

                    case 14:
                        context$3$0.t5 = context$3$0.sent;
                        return context$3$0.abrupt("return", wrapMethodData(context$3$0.t1, context$3$0.t2, context$3$0.t3, context$3$0.t4, context$3$0.t5));

                    case 16:
                    case "end":
                        return context$3$0.stop();
                }
            }, callee$2$0, this, [[1, 6]]);
        }));
    }
}
function wrapMethodData(request, api, resource, httpMethod, methodData) {
    return { arn: arn, updateResponse: updateResponse, updateIntegration: updateIntegration, updateIntegrationResponse: updateIntegrationResponse };
    function arn(region, accountId) {
        var deploymentStage = arguments.length <= 2 || arguments[2] === undefined ? '*' : arguments[2];

        var path = resource.path.replace(/\{[^\/\}]+\}/g, '*');
        return "arn:aws:execute-api:" + region + ":" + accountId + ":" + api.id + "/" + deploymentStage + "/" + httpMethod + path;
    }
    function updateResponse(statusCode, params) {
        return request("PUT /restapis/" + api.id + "/resources/" + resource.id + "/methods/" + httpMethod + "/responses/" + statusCode, params);
    }
    function updateIntegration(params) {
        return request("PUT /restapis/" + api.id + "/resources/" + resource.id + "/methods/" + httpMethod + "/integration", params);
    }
    function updateIntegrationResponse(statusCode, params) {
        return __awaiter(this, void 0, Promise, regeneratorRuntime.mark(function callee$2$0() {
            return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        return context$3$0.abrupt("return", request("PUT /restapis/" + api.id + "/resources/" + resource.id + "/methods/" + httpMethod + "/integration/responses/" + statusCode, params));

                    case 1:
                    case "end":
                        return context$3$0.stop();
                }
            }, callee$2$0, this);
        }));
    }
}
function createClient(region) {
    var Host = "apigateway." + region + ".amazonaws.com";
    return function request(methodAndPath, payload) {
        return __awaiter(this, void 0, Promise, regeneratorRuntime.mark(function callee$2$0() {
            var _methodAndPath$split, _methodAndPath$split2, method, path, headers, opts, signer, response, body, error;

            return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        _methodAndPath$split = methodAndPath.split(' ');
                        _methodAndPath$split2 = _slicedToArray(_methodAndPath$split, 2);
                        method = _methodAndPath$split2[0];
                        path = _methodAndPath$split2[1];
                        headers = { Host: Host };
                        opts = {
                            region: region,
                            method: method,
                            headers: headers,
                            body: '',
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
                            opts.headers['Content-Length'] = Buffer.byteLength(opts.body, 'utf-8').toString();
                        }
                        signer = new _awsSdk2["default"].Signers.V4(opts, 'apigateway');

                        signer.addAuthorization(new _awsSdk2["default"].Config().credentials, new Date());
                        context$3$0.next = 11;
                        return (0, _nodeFetch2["default"])('https://apigateway.eu-west-1.amazonaws.com' + path, opts);

                    case 11:
                        response = context$3$0.sent;
                        context$3$0.next = 14;
                        return response.json();

                    case 14:
                        body = context$3$0.sent;

                        if (!(response.status > 399)) {
                            context$3$0.next = 20;
                            break;
                        }

                        error = new Error(methodAndPath + ' ' + body.message);
                        throw error;

                    case 20:
                        return context$3$0.abrupt("return", body);

                    case 21:
                    case "end":
                        return context$3$0.stop();
                }
            }, callee$2$0, this);
        }));
    };
}
function first(array, pred) {
    return array.filter(pred)[0];
}
module.exports = exports["default"];

// YOLO

// this object matches the `Request` interface needed by AWS signers

