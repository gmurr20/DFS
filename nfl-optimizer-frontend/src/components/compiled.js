/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.OptimizerRequest = (function() {

    /**
     * Properties of an OptimizerRequest.
     * @exports IOptimizerRequest
     * @interface IOptimizerRequest
     * @property {Array.<string>|null} [playerIdLocks] OptimizerRequest playerIdLocks
     * @property {Array.<string>|null} [playerIdExcludes] OptimizerRequest playerIdExcludes
     * @property {number|null} [randomness] OptimizerRequest randomness
     * @property {number|null} [numLineups] OptimizerRequest numLineups
     * @property {boolean|null} [stack] OptimizerRequest stack
     * @property {boolean|null} [noOpposingDefense] OptimizerRequest noOpposingDefense
     * @property {boolean|null} [runBack] OptimizerRequest runBack
     */

    /**
     * Constructs a new OptimizerRequest.
     * @exports OptimizerRequest
     * @classdesc Represents an OptimizerRequest.
     * @implements IOptimizerRequest
     * @constructor
     * @param {IOptimizerRequest=} [properties] Properties to set
     */
    function OptimizerRequest(properties) {
        this.playerIdLocks = [];
        this.playerIdExcludes = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * OptimizerRequest playerIdLocks.
     * @member {Array.<string>} playerIdLocks
     * @memberof OptimizerRequest
     * @instance
     */
    OptimizerRequest.prototype.playerIdLocks = $util.emptyArray;

    /**
     * OptimizerRequest playerIdExcludes.
     * @member {Array.<string>} playerIdExcludes
     * @memberof OptimizerRequest
     * @instance
     */
    OptimizerRequest.prototype.playerIdExcludes = $util.emptyArray;

    /**
     * OptimizerRequest randomness.
     * @member {number} randomness
     * @memberof OptimizerRequest
     * @instance
     */
    OptimizerRequest.prototype.randomness = 0;

    /**
     * OptimizerRequest numLineups.
     * @member {number} numLineups
     * @memberof OptimizerRequest
     * @instance
     */
    OptimizerRequest.prototype.numLineups = 0;

    /**
     * OptimizerRequest stack.
     * @member {boolean} stack
     * @memberof OptimizerRequest
     * @instance
     */
    OptimizerRequest.prototype.stack = false;

    /**
     * OptimizerRequest noOpposingDefense.
     * @member {boolean} noOpposingDefense
     * @memberof OptimizerRequest
     * @instance
     */
    OptimizerRequest.prototype.noOpposingDefense = false;

    /**
     * OptimizerRequest runBack.
     * @member {boolean} runBack
     * @memberof OptimizerRequest
     * @instance
     */
    OptimizerRequest.prototype.runBack = false;

    /**
     * Creates a new OptimizerRequest instance using the specified properties.
     * @function create
     * @memberof OptimizerRequest
     * @static
     * @param {IOptimizerRequest=} [properties] Properties to set
     * @returns {OptimizerRequest} OptimizerRequest instance
     */
    OptimizerRequest.create = function create(properties) {
        return new OptimizerRequest(properties);
    };

    /**
     * Encodes the specified OptimizerRequest message. Does not implicitly {@link OptimizerRequest.verify|verify} messages.
     * @function encode
     * @memberof OptimizerRequest
     * @static
     * @param {IOptimizerRequest} message OptimizerRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    OptimizerRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.playerIdLocks != null && message.playerIdLocks.length)
            for (var i = 0; i < message.playerIdLocks.length; ++i)
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.playerIdLocks[i]);
        if (message.playerIdExcludes != null && message.playerIdExcludes.length)
            for (var i = 0; i < message.playerIdExcludes.length; ++i)
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.playerIdExcludes[i]);
        if (message.randomness != null && Object.hasOwnProperty.call(message, "randomness"))
            writer.uint32(/* id 3, wireType 5 =*/29).float(message.randomness);
        if (message.numLineups != null && Object.hasOwnProperty.call(message, "numLineups"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.numLineups);
        if (message.stack != null && Object.hasOwnProperty.call(message, "stack"))
            writer.uint32(/* id 5, wireType 0 =*/40).bool(message.stack);
        if (message.noOpposingDefense != null && Object.hasOwnProperty.call(message, "noOpposingDefense"))
            writer.uint32(/* id 6, wireType 0 =*/48).bool(message.noOpposingDefense);
        if (message.runBack != null && Object.hasOwnProperty.call(message, "runBack"))
            writer.uint32(/* id 7, wireType 0 =*/56).bool(message.runBack);
        return writer;
    };

    /**
     * Encodes the specified OptimizerRequest message, length delimited. Does not implicitly {@link OptimizerRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof OptimizerRequest
     * @static
     * @param {IOptimizerRequest} message OptimizerRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    OptimizerRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an OptimizerRequest message from the specified reader or buffer.
     * @function decode
     * @memberof OptimizerRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {OptimizerRequest} OptimizerRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    OptimizerRequest.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.OptimizerRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.playerIdLocks && message.playerIdLocks.length))
                        message.playerIdLocks = [];
                    message.playerIdLocks.push(reader.string());
                    break;
                }
            case 2: {
                    if (!(message.playerIdExcludes && message.playerIdExcludes.length))
                        message.playerIdExcludes = [];
                    message.playerIdExcludes.push(reader.string());
                    break;
                }
            case 3: {
                    message.randomness = reader.float();
                    break;
                }
            case 4: {
                    message.numLineups = reader.int32();
                    break;
                }
            case 5: {
                    message.stack = reader.bool();
                    break;
                }
            case 6: {
                    message.noOpposingDefense = reader.bool();
                    break;
                }
            case 7: {
                    message.runBack = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an OptimizerRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof OptimizerRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {OptimizerRequest} OptimizerRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    OptimizerRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an OptimizerRequest message.
     * @function verify
     * @memberof OptimizerRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    OptimizerRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.playerIdLocks != null && message.hasOwnProperty("playerIdLocks")) {
            if (!Array.isArray(message.playerIdLocks))
                return "playerIdLocks: array expected";
            for (var i = 0; i < message.playerIdLocks.length; ++i)
                if (!$util.isString(message.playerIdLocks[i]))
                    return "playerIdLocks: string[] expected";
        }
        if (message.playerIdExcludes != null && message.hasOwnProperty("playerIdExcludes")) {
            if (!Array.isArray(message.playerIdExcludes))
                return "playerIdExcludes: array expected";
            for (var i = 0; i < message.playerIdExcludes.length; ++i)
                if (!$util.isString(message.playerIdExcludes[i]))
                    return "playerIdExcludes: string[] expected";
        }
        if (message.randomness != null && message.hasOwnProperty("randomness"))
            if (typeof message.randomness !== "number")
                return "randomness: number expected";
        if (message.numLineups != null && message.hasOwnProperty("numLineups"))
            if (!$util.isInteger(message.numLineups))
                return "numLineups: integer expected";
        if (message.stack != null && message.hasOwnProperty("stack"))
            if (typeof message.stack !== "boolean")
                return "stack: boolean expected";
        if (message.noOpposingDefense != null && message.hasOwnProperty("noOpposingDefense"))
            if (typeof message.noOpposingDefense !== "boolean")
                return "noOpposingDefense: boolean expected";
        if (message.runBack != null && message.hasOwnProperty("runBack"))
            if (typeof message.runBack !== "boolean")
                return "runBack: boolean expected";
        return null;
    };

    /**
     * Creates an OptimizerRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof OptimizerRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {OptimizerRequest} OptimizerRequest
     */
    OptimizerRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.OptimizerRequest)
            return object;
        var message = new $root.OptimizerRequest();
        if (object.playerIdLocks) {
            if (!Array.isArray(object.playerIdLocks))
                throw TypeError(".OptimizerRequest.playerIdLocks: array expected");
            message.playerIdLocks = [];
            for (var i = 0; i < object.playerIdLocks.length; ++i)
                message.playerIdLocks[i] = String(object.playerIdLocks[i]);
        }
        if (object.playerIdExcludes) {
            if (!Array.isArray(object.playerIdExcludes))
                throw TypeError(".OptimizerRequest.playerIdExcludes: array expected");
            message.playerIdExcludes = [];
            for (var i = 0; i < object.playerIdExcludes.length; ++i)
                message.playerIdExcludes[i] = String(object.playerIdExcludes[i]);
        }
        if (object.randomness != null)
            message.randomness = Number(object.randomness);
        if (object.numLineups != null)
            message.numLineups = object.numLineups | 0;
        if (object.stack != null)
            message.stack = Boolean(object.stack);
        if (object.noOpposingDefense != null)
            message.noOpposingDefense = Boolean(object.noOpposingDefense);
        if (object.runBack != null)
            message.runBack = Boolean(object.runBack);
        return message;
    };

    /**
     * Creates a plain object from an OptimizerRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof OptimizerRequest
     * @static
     * @param {OptimizerRequest} message OptimizerRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    OptimizerRequest.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.playerIdLocks = [];
            object.playerIdExcludes = [];
        }
        if (options.defaults) {
            object.randomness = 0;
            object.numLineups = 0;
            object.stack = false;
            object.noOpposingDefense = false;
            object.runBack = false;
        }
        if (message.playerIdLocks && message.playerIdLocks.length) {
            object.playerIdLocks = [];
            for (var j = 0; j < message.playerIdLocks.length; ++j)
                object.playerIdLocks[j] = message.playerIdLocks[j];
        }
        if (message.playerIdExcludes && message.playerIdExcludes.length) {
            object.playerIdExcludes = [];
            for (var j = 0; j < message.playerIdExcludes.length; ++j)
                object.playerIdExcludes[j] = message.playerIdExcludes[j];
        }
        if (message.randomness != null && message.hasOwnProperty("randomness"))
            object.randomness = options.json && !isFinite(message.randomness) ? String(message.randomness) : message.randomness;
        if (message.numLineups != null && message.hasOwnProperty("numLineups"))
            object.numLineups = message.numLineups;
        if (message.stack != null && message.hasOwnProperty("stack"))
            object.stack = message.stack;
        if (message.noOpposingDefense != null && message.hasOwnProperty("noOpposingDefense"))
            object.noOpposingDefense = message.noOpposingDefense;
        if (message.runBack != null && message.hasOwnProperty("runBack"))
            object.runBack = message.runBack;
        return object;
    };

    /**
     * Converts this OptimizerRequest to JSON.
     * @function toJSON
     * @memberof OptimizerRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    OptimizerRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for OptimizerRequest
     * @function getTypeUrl
     * @memberof OptimizerRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    OptimizerRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/OptimizerRequest";
    };

    return OptimizerRequest;
})();

$root.OptimizerResponse = (function() {

    /**
     * Properties of an OptimizerResponse.
     * @exports IOptimizerResponse
     * @interface IOptimizerResponse
     * @property {Array.<ILineup>|null} [lineups] OptimizerResponse lineups
     */

    /**
     * Constructs a new OptimizerResponse.
     * @exports OptimizerResponse
     * @classdesc Represents an OptimizerResponse.
     * @implements IOptimizerResponse
     * @constructor
     * @param {IOptimizerResponse=} [properties] Properties to set
     */
    function OptimizerResponse(properties) {
        this.lineups = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * OptimizerResponse lineups.
     * @member {Array.<ILineup>} lineups
     * @memberof OptimizerResponse
     * @instance
     */
    OptimizerResponse.prototype.lineups = $util.emptyArray;

    /**
     * Creates a new OptimizerResponse instance using the specified properties.
     * @function create
     * @memberof OptimizerResponse
     * @static
     * @param {IOptimizerResponse=} [properties] Properties to set
     * @returns {OptimizerResponse} OptimizerResponse instance
     */
    OptimizerResponse.create = function create(properties) {
        return new OptimizerResponse(properties);
    };

    /**
     * Encodes the specified OptimizerResponse message. Does not implicitly {@link OptimizerResponse.verify|verify} messages.
     * @function encode
     * @memberof OptimizerResponse
     * @static
     * @param {IOptimizerResponse} message OptimizerResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    OptimizerResponse.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.lineups != null && message.lineups.length)
            for (var i = 0; i < message.lineups.length; ++i)
                $root.Lineup.encode(message.lineups[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified OptimizerResponse message, length delimited. Does not implicitly {@link OptimizerResponse.verify|verify} messages.
     * @function encodeDelimited
     * @memberof OptimizerResponse
     * @static
     * @param {IOptimizerResponse} message OptimizerResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    OptimizerResponse.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an OptimizerResponse message from the specified reader or buffer.
     * @function decode
     * @memberof OptimizerResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {OptimizerResponse} OptimizerResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    OptimizerResponse.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.OptimizerResponse();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.lineups && message.lineups.length))
                        message.lineups = [];
                    message.lineups.push($root.Lineup.decode(reader, reader.uint32()));
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an OptimizerResponse message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof OptimizerResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {OptimizerResponse} OptimizerResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    OptimizerResponse.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an OptimizerResponse message.
     * @function verify
     * @memberof OptimizerResponse
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    OptimizerResponse.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.lineups != null && message.hasOwnProperty("lineups")) {
            if (!Array.isArray(message.lineups))
                return "lineups: array expected";
            for (var i = 0; i < message.lineups.length; ++i) {
                var error = $root.Lineup.verify(message.lineups[i]);
                if (error)
                    return "lineups." + error;
            }
        }
        return null;
    };

    /**
     * Creates an OptimizerResponse message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof OptimizerResponse
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {OptimizerResponse} OptimizerResponse
     */
    OptimizerResponse.fromObject = function fromObject(object) {
        if (object instanceof $root.OptimizerResponse)
            return object;
        var message = new $root.OptimizerResponse();
        if (object.lineups) {
            if (!Array.isArray(object.lineups))
                throw TypeError(".OptimizerResponse.lineups: array expected");
            message.lineups = [];
            for (var i = 0; i < object.lineups.length; ++i) {
                if (typeof object.lineups[i] !== "object")
                    throw TypeError(".OptimizerResponse.lineups: object expected");
                message.lineups[i] = $root.Lineup.fromObject(object.lineups[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from an OptimizerResponse message. Also converts values to other types if specified.
     * @function toObject
     * @memberof OptimizerResponse
     * @static
     * @param {OptimizerResponse} message OptimizerResponse
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    OptimizerResponse.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.lineups = [];
        if (message.lineups && message.lineups.length) {
            object.lineups = [];
            for (var j = 0; j < message.lineups.length; ++j)
                object.lineups[j] = $root.Lineup.toObject(message.lineups[j], options);
        }
        return object;
    };

    /**
     * Converts this OptimizerResponse to JSON.
     * @function toJSON
     * @memberof OptimizerResponse
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    OptimizerResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for OptimizerResponse
     * @function getTypeUrl
     * @memberof OptimizerResponse
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    OptimizerResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/OptimizerResponse";
    };

    return OptimizerResponse;
})();

$root.GetPlayersRequest = (function() {

    /**
     * Properties of a GetPlayersRequest.
     * @exports IGetPlayersRequest
     * @interface IGetPlayersRequest
     */

    /**
     * Constructs a new GetPlayersRequest.
     * @exports GetPlayersRequest
     * @classdesc Represents a GetPlayersRequest.
     * @implements IGetPlayersRequest
     * @constructor
     * @param {IGetPlayersRequest=} [properties] Properties to set
     */
    function GetPlayersRequest(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new GetPlayersRequest instance using the specified properties.
     * @function create
     * @memberof GetPlayersRequest
     * @static
     * @param {IGetPlayersRequest=} [properties] Properties to set
     * @returns {GetPlayersRequest} GetPlayersRequest instance
     */
    GetPlayersRequest.create = function create(properties) {
        return new GetPlayersRequest(properties);
    };

    /**
     * Encodes the specified GetPlayersRequest message. Does not implicitly {@link GetPlayersRequest.verify|verify} messages.
     * @function encode
     * @memberof GetPlayersRequest
     * @static
     * @param {IGetPlayersRequest} message GetPlayersRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GetPlayersRequest.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified GetPlayersRequest message, length delimited. Does not implicitly {@link GetPlayersRequest.verify|verify} messages.
     * @function encodeDelimited
     * @memberof GetPlayersRequest
     * @static
     * @param {IGetPlayersRequest} message GetPlayersRequest message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GetPlayersRequest.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a GetPlayersRequest message from the specified reader or buffer.
     * @function decode
     * @memberof GetPlayersRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {GetPlayersRequest} GetPlayersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GetPlayersRequest.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GetPlayersRequest();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a GetPlayersRequest message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof GetPlayersRequest
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {GetPlayersRequest} GetPlayersRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GetPlayersRequest.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a GetPlayersRequest message.
     * @function verify
     * @memberof GetPlayersRequest
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    GetPlayersRequest.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a GetPlayersRequest message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof GetPlayersRequest
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {GetPlayersRequest} GetPlayersRequest
     */
    GetPlayersRequest.fromObject = function fromObject(object) {
        if (object instanceof $root.GetPlayersRequest)
            return object;
        return new $root.GetPlayersRequest();
    };

    /**
     * Creates a plain object from a GetPlayersRequest message. Also converts values to other types if specified.
     * @function toObject
     * @memberof GetPlayersRequest
     * @static
     * @param {GetPlayersRequest} message GetPlayersRequest
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    GetPlayersRequest.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this GetPlayersRequest to JSON.
     * @function toJSON
     * @memberof GetPlayersRequest
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    GetPlayersRequest.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for GetPlayersRequest
     * @function getTypeUrl
     * @memberof GetPlayersRequest
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    GetPlayersRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/GetPlayersRequest";
    };

    return GetPlayersRequest;
})();

$root.GetPlayersResponse = (function() {

    /**
     * Properties of a GetPlayersResponse.
     * @exports IGetPlayersResponse
     * @interface IGetPlayersResponse
     * @property {IPlayers|null} [players] GetPlayersResponse players
     * @property {string|null} [week] GetPlayersResponse week
     */

    /**
     * Constructs a new GetPlayersResponse.
     * @exports GetPlayersResponse
     * @classdesc Represents a GetPlayersResponse.
     * @implements IGetPlayersResponse
     * @constructor
     * @param {IGetPlayersResponse=} [properties] Properties to set
     */
    function GetPlayersResponse(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * GetPlayersResponse players.
     * @member {IPlayers|null|undefined} players
     * @memberof GetPlayersResponse
     * @instance
     */
    GetPlayersResponse.prototype.players = null;

    /**
     * GetPlayersResponse week.
     * @member {string} week
     * @memberof GetPlayersResponse
     * @instance
     */
    GetPlayersResponse.prototype.week = "";

    /**
     * Creates a new GetPlayersResponse instance using the specified properties.
     * @function create
     * @memberof GetPlayersResponse
     * @static
     * @param {IGetPlayersResponse=} [properties] Properties to set
     * @returns {GetPlayersResponse} GetPlayersResponse instance
     */
    GetPlayersResponse.create = function create(properties) {
        return new GetPlayersResponse(properties);
    };

    /**
     * Encodes the specified GetPlayersResponse message. Does not implicitly {@link GetPlayersResponse.verify|verify} messages.
     * @function encode
     * @memberof GetPlayersResponse
     * @static
     * @param {IGetPlayersResponse} message GetPlayersResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GetPlayersResponse.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.players != null && Object.hasOwnProperty.call(message, "players"))
            $root.Players.encode(message.players, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.week != null && Object.hasOwnProperty.call(message, "week"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.week);
        return writer;
    };

    /**
     * Encodes the specified GetPlayersResponse message, length delimited. Does not implicitly {@link GetPlayersResponse.verify|verify} messages.
     * @function encodeDelimited
     * @memberof GetPlayersResponse
     * @static
     * @param {IGetPlayersResponse} message GetPlayersResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GetPlayersResponse.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a GetPlayersResponse message from the specified reader or buffer.
     * @function decode
     * @memberof GetPlayersResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {GetPlayersResponse} GetPlayersResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GetPlayersResponse.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GetPlayersResponse();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.players = $root.Players.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.week = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a GetPlayersResponse message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof GetPlayersResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {GetPlayersResponse} GetPlayersResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GetPlayersResponse.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a GetPlayersResponse message.
     * @function verify
     * @memberof GetPlayersResponse
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    GetPlayersResponse.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.players != null && message.hasOwnProperty("players")) {
            var error = $root.Players.verify(message.players);
            if (error)
                return "players." + error;
        }
        if (message.week != null && message.hasOwnProperty("week"))
            if (!$util.isString(message.week))
                return "week: string expected";
        return null;
    };

    /**
     * Creates a GetPlayersResponse message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof GetPlayersResponse
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {GetPlayersResponse} GetPlayersResponse
     */
    GetPlayersResponse.fromObject = function fromObject(object) {
        if (object instanceof $root.GetPlayersResponse)
            return object;
        var message = new $root.GetPlayersResponse();
        if (object.players != null) {
            if (typeof object.players !== "object")
                throw TypeError(".GetPlayersResponse.players: object expected");
            message.players = $root.Players.fromObject(object.players);
        }
        if (object.week != null)
            message.week = String(object.week);
        return message;
    };

    /**
     * Creates a plain object from a GetPlayersResponse message. Also converts values to other types if specified.
     * @function toObject
     * @memberof GetPlayersResponse
     * @static
     * @param {GetPlayersResponse} message GetPlayersResponse
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    GetPlayersResponse.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.players = null;
            object.week = "";
        }
        if (message.players != null && message.hasOwnProperty("players"))
            object.players = $root.Players.toObject(message.players, options);
        if (message.week != null && message.hasOwnProperty("week"))
            object.week = message.week;
        return object;
    };

    /**
     * Converts this GetPlayersResponse to JSON.
     * @function toJSON
     * @memberof GetPlayersResponse
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    GetPlayersResponse.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for GetPlayersResponse
     * @function getTypeUrl
     * @memberof GetPlayersResponse
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    GetPlayersResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/GetPlayersResponse";
    };

    return GetPlayersResponse;
})();

$root.Player = (function() {

    /**
     * Properties of a Player.
     * @exports IPlayer
     * @interface IPlayer
     * @property {string|null} [id] Player id
     * @property {string|null} [name] Player name
     * @property {string|null} [team] Player team
     * @property {string|null} [position] Player position
     * @property {number|null} [salary] Player salary
     * @property {number|null} [points] Player points
     * @property {string|null} [opposingTeam] Player opposingTeam
     * @property {number|null} [simPoints] Player simPoints
     */

    /**
     * Constructs a new Player.
     * @exports Player
     * @classdesc Represents a Player.
     * @implements IPlayer
     * @constructor
     * @param {IPlayer=} [properties] Properties to set
     */
    function Player(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Player id.
     * @member {string} id
     * @memberof Player
     * @instance
     */
    Player.prototype.id = "";

    /**
     * Player name.
     * @member {string} name
     * @memberof Player
     * @instance
     */
    Player.prototype.name = "";

    /**
     * Player team.
     * @member {string} team
     * @memberof Player
     * @instance
     */
    Player.prototype.team = "";

    /**
     * Player position.
     * @member {string} position
     * @memberof Player
     * @instance
     */
    Player.prototype.position = "";

    /**
     * Player salary.
     * @member {number} salary
     * @memberof Player
     * @instance
     */
    Player.prototype.salary = 0;

    /**
     * Player points.
     * @member {number} points
     * @memberof Player
     * @instance
     */
    Player.prototype.points = 0;

    /**
     * Player opposingTeam.
     * @member {string} opposingTeam
     * @memberof Player
     * @instance
     */
    Player.prototype.opposingTeam = "";

    /**
     * Player simPoints.
     * @member {number} simPoints
     * @memberof Player
     * @instance
     */
    Player.prototype.simPoints = 0;

    /**
     * Creates a new Player instance using the specified properties.
     * @function create
     * @memberof Player
     * @static
     * @param {IPlayer=} [properties] Properties to set
     * @returns {Player} Player instance
     */
    Player.create = function create(properties) {
        return new Player(properties);
    };

    /**
     * Encodes the specified Player message. Does not implicitly {@link Player.verify|verify} messages.
     * @function encode
     * @memberof Player
     * @static
     * @param {IPlayer} message Player message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Player.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
        if (message.team != null && Object.hasOwnProperty.call(message, "team"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.team);
        if (message.position != null && Object.hasOwnProperty.call(message, "position"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.position);
        if (message.salary != null && Object.hasOwnProperty.call(message, "salary"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.salary);
        if (message.points != null && Object.hasOwnProperty.call(message, "points"))
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.points);
        if (message.opposingTeam != null && Object.hasOwnProperty.call(message, "opposingTeam"))
            writer.uint32(/* id 7, wireType 2 =*/58).string(message.opposingTeam);
        if (message.simPoints != null && Object.hasOwnProperty.call(message, "simPoints"))
            writer.uint32(/* id 8, wireType 5 =*/69).float(message.simPoints);
        return writer;
    };

    /**
     * Encodes the specified Player message, length delimited. Does not implicitly {@link Player.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Player
     * @static
     * @param {IPlayer} message Player message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Player.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Player message from the specified reader or buffer.
     * @function decode
     * @memberof Player
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Player} Player
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Player.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Player();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    message.id = reader.string();
                    break;
                }
            case 2: {
                    message.name = reader.string();
                    break;
                }
            case 3: {
                    message.team = reader.string();
                    break;
                }
            case 4: {
                    message.position = reader.string();
                    break;
                }
            case 5: {
                    message.salary = reader.int32();
                    break;
                }
            case 6: {
                    message.points = reader.float();
                    break;
                }
            case 7: {
                    message.opposingTeam = reader.string();
                    break;
                }
            case 8: {
                    message.simPoints = reader.float();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Player message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Player
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Player} Player
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Player.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Player message.
     * @function verify
     * @memberof Player
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Player.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.team != null && message.hasOwnProperty("team"))
            if (!$util.isString(message.team))
                return "team: string expected";
        if (message.position != null && message.hasOwnProperty("position"))
            if (!$util.isString(message.position))
                return "position: string expected";
        if (message.salary != null && message.hasOwnProperty("salary"))
            if (!$util.isInteger(message.salary))
                return "salary: integer expected";
        if (message.points != null && message.hasOwnProperty("points"))
            if (typeof message.points !== "number")
                return "points: number expected";
        if (message.opposingTeam != null && message.hasOwnProperty("opposingTeam"))
            if (!$util.isString(message.opposingTeam))
                return "opposingTeam: string expected";
        if (message.simPoints != null && message.hasOwnProperty("simPoints"))
            if (typeof message.simPoints !== "number")
                return "simPoints: number expected";
        return null;
    };

    /**
     * Creates a Player message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Player
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Player} Player
     */
    Player.fromObject = function fromObject(object) {
        if (object instanceof $root.Player)
            return object;
        var message = new $root.Player();
        if (object.id != null)
            message.id = String(object.id);
        if (object.name != null)
            message.name = String(object.name);
        if (object.team != null)
            message.team = String(object.team);
        if (object.position != null)
            message.position = String(object.position);
        if (object.salary != null)
            message.salary = object.salary | 0;
        if (object.points != null)
            message.points = Number(object.points);
        if (object.opposingTeam != null)
            message.opposingTeam = String(object.opposingTeam);
        if (object.simPoints != null)
            message.simPoints = Number(object.simPoints);
        return message;
    };

    /**
     * Creates a plain object from a Player message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Player
     * @static
     * @param {Player} message Player
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Player.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.id = "";
            object.name = "";
            object.team = "";
            object.position = "";
            object.salary = 0;
            object.points = 0;
            object.opposingTeam = "";
            object.simPoints = 0;
        }
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.team != null && message.hasOwnProperty("team"))
            object.team = message.team;
        if (message.position != null && message.hasOwnProperty("position"))
            object.position = message.position;
        if (message.salary != null && message.hasOwnProperty("salary"))
            object.salary = message.salary;
        if (message.points != null && message.hasOwnProperty("points"))
            object.points = options.json && !isFinite(message.points) ? String(message.points) : message.points;
        if (message.opposingTeam != null && message.hasOwnProperty("opposingTeam"))
            object.opposingTeam = message.opposingTeam;
        if (message.simPoints != null && message.hasOwnProperty("simPoints"))
            object.simPoints = options.json && !isFinite(message.simPoints) ? String(message.simPoints) : message.simPoints;
        return object;
    };

    /**
     * Converts this Player to JSON.
     * @function toJSON
     * @memberof Player
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Player.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Player
     * @function getTypeUrl
     * @memberof Player
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Player.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Player";
    };

    return Player;
})();

$root.Players = (function() {

    /**
     * Properties of a Players.
     * @exports IPlayers
     * @interface IPlayers
     * @property {Array.<IPlayer>|null} [players] Players players
     */

    /**
     * Constructs a new Players.
     * @exports Players
     * @classdesc Represents a Players.
     * @implements IPlayers
     * @constructor
     * @param {IPlayers=} [properties] Properties to set
     */
    function Players(properties) {
        this.players = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Players players.
     * @member {Array.<IPlayer>} players
     * @memberof Players
     * @instance
     */
    Players.prototype.players = $util.emptyArray;

    /**
     * Creates a new Players instance using the specified properties.
     * @function create
     * @memberof Players
     * @static
     * @param {IPlayers=} [properties] Properties to set
     * @returns {Players} Players instance
     */
    Players.create = function create(properties) {
        return new Players(properties);
    };

    /**
     * Encodes the specified Players message. Does not implicitly {@link Players.verify|verify} messages.
     * @function encode
     * @memberof Players
     * @static
     * @param {IPlayers} message Players message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Players.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.players != null && message.players.length)
            for (var i = 0; i < message.players.length; ++i)
                $root.Player.encode(message.players[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Players message, length delimited. Does not implicitly {@link Players.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Players
     * @static
     * @param {IPlayers} message Players message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Players.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Players message from the specified reader or buffer.
     * @function decode
     * @memberof Players
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Players} Players
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Players.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Players();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.players && message.players.length))
                        message.players = [];
                    message.players.push($root.Player.decode(reader, reader.uint32()));
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Players message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Players
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Players} Players
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Players.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Players message.
     * @function verify
     * @memberof Players
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Players.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.players != null && message.hasOwnProperty("players")) {
            if (!Array.isArray(message.players))
                return "players: array expected";
            for (var i = 0; i < message.players.length; ++i) {
                var error = $root.Player.verify(message.players[i]);
                if (error)
                    return "players." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Players message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Players
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Players} Players
     */
    Players.fromObject = function fromObject(object) {
        if (object instanceof $root.Players)
            return object;
        var message = new $root.Players();
        if (object.players) {
            if (!Array.isArray(object.players))
                throw TypeError(".Players.players: array expected");
            message.players = [];
            for (var i = 0; i < object.players.length; ++i) {
                if (typeof object.players[i] !== "object")
                    throw TypeError(".Players.players: object expected");
                message.players[i] = $root.Player.fromObject(object.players[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Players message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Players
     * @static
     * @param {Players} message Players
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Players.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.players = [];
        if (message.players && message.players.length) {
            object.players = [];
            for (var j = 0; j < message.players.length; ++j)
                object.players[j] = $root.Player.toObject(message.players[j], options);
        }
        return object;
    };

    /**
     * Converts this Players to JSON.
     * @function toJSON
     * @memberof Players
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Players.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Players
     * @function getTypeUrl
     * @memberof Players
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Players.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Players";
    };

    return Players;
})();

$root.Lineup = (function() {

    /**
     * Properties of a Lineup.
     * @exports ILineup
     * @interface ILineup
     * @property {Array.<IPlayer>|null} [players] Lineup players
     */

    /**
     * Constructs a new Lineup.
     * @exports Lineup
     * @classdesc Represents a Lineup.
     * @implements ILineup
     * @constructor
     * @param {ILineup=} [properties] Properties to set
     */
    function Lineup(properties) {
        this.players = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Lineup players.
     * @member {Array.<IPlayer>} players
     * @memberof Lineup
     * @instance
     */
    Lineup.prototype.players = $util.emptyArray;

    /**
     * Creates a new Lineup instance using the specified properties.
     * @function create
     * @memberof Lineup
     * @static
     * @param {ILineup=} [properties] Properties to set
     * @returns {Lineup} Lineup instance
     */
    Lineup.create = function create(properties) {
        return new Lineup(properties);
    };

    /**
     * Encodes the specified Lineup message. Does not implicitly {@link Lineup.verify|verify} messages.
     * @function encode
     * @memberof Lineup
     * @static
     * @param {ILineup} message Lineup message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Lineup.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.players != null && message.players.length)
            for (var i = 0; i < message.players.length; ++i)
                $root.Player.encode(message.players[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Lineup message, length delimited. Does not implicitly {@link Lineup.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Lineup
     * @static
     * @param {ILineup} message Lineup message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Lineup.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Lineup message from the specified reader or buffer.
     * @function decode
     * @memberof Lineup
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Lineup} Lineup
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Lineup.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Lineup();
        while (reader.pos < end) {
            var tag = reader.uint32();
            if (tag === error)
                break;
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.players && message.players.length))
                        message.players = [];
                    message.players.push($root.Player.decode(reader, reader.uint32()));
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Lineup message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Lineup
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Lineup} Lineup
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Lineup.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Lineup message.
     * @function verify
     * @memberof Lineup
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Lineup.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.players != null && message.hasOwnProperty("players")) {
            if (!Array.isArray(message.players))
                return "players: array expected";
            for (var i = 0; i < message.players.length; ++i) {
                var error = $root.Player.verify(message.players[i]);
                if (error)
                    return "players." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Lineup message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Lineup
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Lineup} Lineup
     */
    Lineup.fromObject = function fromObject(object) {
        if (object instanceof $root.Lineup)
            return object;
        var message = new $root.Lineup();
        if (object.players) {
            if (!Array.isArray(object.players))
                throw TypeError(".Lineup.players: array expected");
            message.players = [];
            for (var i = 0; i < object.players.length; ++i) {
                if (typeof object.players[i] !== "object")
                    throw TypeError(".Lineup.players: object expected");
                message.players[i] = $root.Player.fromObject(object.players[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Lineup message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Lineup
     * @static
     * @param {Lineup} message Lineup
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Lineup.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.players = [];
        if (message.players && message.players.length) {
            object.players = [];
            for (var j = 0; j < message.players.length; ++j)
                object.players[j] = $root.Player.toObject(message.players[j], options);
        }
        return object;
    };

    /**
     * Converts this Lineup to JSON.
     * @function toJSON
     * @memberof Lineup
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Lineup.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Lineup
     * @function getTypeUrl
     * @memberof Lineup
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Lineup.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Lineup";
    };

    return Lineup;
})();

module.exports = $root;
