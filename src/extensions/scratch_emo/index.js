const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const BASE_URL = "https://staging-platform-api.bocco.me"
// const TOKEN_FILE = f"{EMO_PLATFORM_PATH}/tokens/emo-platform-api.json"
const DEFAULT_ROOM_ID = ""
const MAX_SAVED_REQUEST_ID = 10

class Scratch3Emo {
    constructor (runtime) {
        this.runtime = runtime;
        this._result = "";
        this._url = "";
        this._result = "";
        this._refresh_key = ""
        this._access_token = ""
        this._room_id = ""
        this._sensors = ""
    }

    getInfo () {
        return {
            id: 'emo',
            name: 'emo scratch',
            blocks: [
                {
                    opcode: 'setRefreshAPIKey',
                    blockType: BlockType.REPORTER,
                    text: 'Set Refresh API Key [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        }
                    }
                },
                {
                    opcode: 'getRoomId',
                    blockType: BlockType.REPORTER,
                    text: 'Get Room Id',
                },
                {
                    opcode: 'roomId',
                    blockType: BlockType.REPORTER,
                    text: 'Room Id'
                },
                {
                    opcode: 'sendText',
                    blockType: BlockType.COMMAND,
                    text: 'Speak [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'hello'
                        }
                    }
                },
                {
                    opcode: 'getSensors',
                    blockType: BlockType.REPORTER,
                    text: 'Get Room Sensor'
                },
                {
                    opcode: 'doMotion',
                    blockType: BlockType.COMMAND,
                    text: 'Motion: [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'UUID'
                        }
                    }
                },
                {
                    opcode: 'bonboriShort',
                    blockType: BlockType.REPORTER,
                    text: 'ぼんぼりショート'
                },
                {
                    opcode: 'changeLed',
                    blockType: BlockType.COMMAND,
                    text: 'ほっぺたの色を変える R: [RED] G: [GREEN] B: [BLUE]' ,
                    arguments: {
                        RED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '255'
                        },
                        GREEN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '255'
                        },
                        BLUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '255'
                        }
                    }
                },
            ],
            menus: {

            }
        };
    }

    setRefreshAPIKey( args ){
        const refresh_key = Cast.toString(args.TEXT);
        this._refresh_key = refresh_key;
        const url = BASE_URL + '/oauth/token/refresh'
        var pr = fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({refresh_token: this._refresh_key})
        })
            .then(res => res.text() )
            .then(body => {
                const obj = JSON.parse(body)
                console.log(obj.access_token)
                this._access_token = obj.access_token
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    getRoomId(){
        const roomUrl = BASE_URL + "/v1/rooms"
        var pr = fetch(roomUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this._access_token
            }
        })
            .then(res => res.text() )
            .then(body =>{
                const obj = JSON.parse(body)
                this._room_id = obj.rooms[0].uuid
                console.log(this._room_id)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    getSensors(){
        const sensorUrl = BASE_URL + "/v1/rooms/" + this._room_id +  "/sensors"
        var pr = fetch(sensorUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this._access_token
            }
        })
            .then(res => res.text() )
            .then(body =>{
                const obj = JSON.parse(body)
                this._sensors = obj.sensors[0]
                console.log(this._sensors)
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    }
    // getMotions(){
    //     const url = BASE_URL + "/v1/motions"
    //     var pr = fetch(url, {
    //         headers: {
    //             'Accept': 'application/json',
    //             'Authorization': 'Bearer ' + this._access_token
    //         }
    //     })
    //         .then(res => res.text() )
    //         .then(body =>{
    //             const obj = JSON.parse(body)
    //             // this._room_id = obj.rooms[0].uuid
    //             console.log(obj)
    //         })
    //         .catch((error) => {
    //             console.error('Error:', error);
    //         });
    // }
    doMotion( args ){
        const text = Cast.toString(args.TEXT);
        const url = BASE_URL + "/v1/rooms/" + this._room_id + "/motions/preset" 

        var pr = fetch(url, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Authorization': 'Bearer ' + this._access_token,
                'Content-Type': 'application/json'
            },
            body:  JSON.stringify({uuid: text})
        })
            .catch((error) => {
                console.error('Error:', error);
            });

    }
    roomId(){
        return this._room_id
    }
    sendText( args ){
        const text = Cast.toString(args.TEXT);
        const url = BASE_URL + "/v1/rooms/" + this._room_id + "/messages/text" 

        var pr = fetch(url, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Authorization': 'Bearer ' + this._access_token,
                'Content-Type': 'application/json'
            },
            body:  JSON.stringify({text: text})
        })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    changeLed( args ){
        const red = Cast.toNumber(args.RED);
        const green = Cast.toNumber(args.GREEN);
        const blue = Cast.toNumber(args.BLUE);
        const url = BASE_URL + "/v1/rooms/" + this._room_id + "/motions/led_color" 
        console.log(typeof red)
        console.log(typeof blue)

        var pr = fetch(url, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Authorization': 'Bearer ' + this._access_token,
                'Content-Type': 'application/json'
            },
            body:  JSON.stringify({red: red, green: green, blue: blue})
        })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    bonboriShort(){
        return 'fa0beb73-ce8f-4786-9c0b-05ea5da9f125'
    }

}

module.exports = Scratch3Emo;