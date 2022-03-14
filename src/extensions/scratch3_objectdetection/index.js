require('babel-polyfill');
/**
* @license
../../../extension-support/argument-type  ../../../extension-support/block-type  format-message  face-api.js  ../../../engine/runtime  ../../../io/video  ../../../engine/stage-layering */
'use strict';

 var ArgumentType = require("../../extension-support/argument-type.js");
 var BlockType = require("../../extension-support/block-type.js");
 var formatMessage  = require("format-message/index.js");
 var cocoSsd = require("@tensorflow-models/coco-ssd/dist/index.js");
 var Video = require("../../io/video.js");
 var StageLayering = require("../../engine/stage-layering.js");
 const Runtime = require('../../engine/runtime');
const tf = require('@tensorflow/tfjs');

 objectDetected = [];
var isStage = false;
var stageWidth = 480;
var stageHeight = 360;
var netModel;
var netModel2;
var drawOnStage = false;
var MakerAttributes = [];

for (var i = 0; i < 20; i++) {
  MakerAttributes[i] = {
    color4f: [Math.random(), Math.random(), Math.random(), 0.7],
    diameter: 3
  };
}

var minScore = 0.5;
var minNumBoxes = 50;
var baseModel = 'lite_mobilenet_v2';
var baseURL = 'static/models/objectDetection/model.json';
var blockIconURI = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZWYyNzA7fS5jbHMtMntmaWxsOiNmYmIwNDA7fS5jbHMtM3tmaWxsOiMwNDA1MDQ7fS5jbHMtNHtmaWxsOiNmZmY7fS5jbHMtNSwuY2xzLTd7ZmlsbDpub25lO3N0cm9rZTojMWExNTE3O3N0cm9rZS1taXRlcmxpbWl0OjEwO30uY2xzLTV7c3Ryb2tlLXdpZHRoOjAuNXB4O30uY2xzLTZ7ZmlsbDojMWExNTE3O30uY2xzLTd7c3Ryb2tlLXdpZHRoOjAuMjlweDt9LmNscy04e2ZpbGw6I2U4NmFhODt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPk9iamVjdCBEZXRlY3Rpb248L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTYuNzMsMTYuNzhhOC43OCw4Ljc4LDAsMCwwLTMsMi45NUE5LjM1LDkuMzUsMCwwLDAsMi41LDI1LjA3YzAuMzYsNC4yNiwzLjg5LDYuODYsNC44Niw3LjU3LDMuOCwyLjgsNy45NCwyLjY3LDEyLjc4LDIuNTNDMjYsMzUsMzEuMjgsMzQuODQsMzQuNDIsMzAuODZhMTEuMTksMTEuMTksMCwwLDAsMi4xOS03LjUxLDExLjc4LDExLjc4LDAsMCwwLTQuNjktOC4yOWMwLjg4LTQuOTMuNjItOC43Mi0uOS05LjMtMS4xNi0uNDUtMywxLTMuODgsMS43MWExMC4wNywxMC4wNywwLDAsMC0yLjczLDMuMzcsMTUuMjcsMTUuMjcsMCwwLDAtMTAuNjQuOTRBMTAsMTAsMCwwLDAsMTAuODIsOC40QzkuODgsNy43Myw4LjMzLDYuNjIsNy4yNSw3LjE2Yy0wLjkxLjQ1LTEsMS44My0xLjE3LDMuNDJBMTcuMzMsMTcuMzMsMCwwLDAsNi43MywxNi43OFoiLz48ZWxsaXBzZSBjbGFzcz0iY2xzLTIiIGN4PSIxMS44OCIgY3k9IjIzLjI2IiByeD0iMi45NSIgcnk9IjMuMzUiLz48ZWxsaXBzZSBjbGFzcz0iY2xzLTIiIGN4PSIyNy4yOCIgY3k9IjIyLjYiIHJ4PSIyLjk1IiByeT0iMy4zNSIvPjxlbGxpcHNlIGNsYXNzPSJjbHMtMyIgY3g9IjEyLjQ0IiBjeT0iMjMuMjIiIHJ4PSIyLjM4IiByeT0iMi45Ii8+PGVsbGlwc2UgY2xhc3M9ImNscy00IiBjeD0iMTEuMjciIGN5PSIyMi42IiByeD0iMC41OCIgcnk9IjAuNzMiLz48ZWxsaXBzZSBjbGFzcz0iY2xzLTMiIGN4PSIyNi42NCIgY3k9IjIyLjU2IiByeD0iMi4zOCIgcnk9IjIuOSIvPjxlbGxpcHNlIGNsYXNzPSJjbHMtNCIgY3g9IjI1LjQ2IiBjeT0iMjEuOTUiIHJ4PSIwLjU4IiByeT0iMC43MyIvPjxsaW5lIGNsYXNzPSJjbHMtNSIgeDE9IjMxLjk0IiB5MT0iMjUuNjYiIHgyPSIzNC43NCIgeTI9IjI0LjI5Ii8+PGxpbmUgY2xhc3M9ImNscy01IiB4MT0iMzIuMDciIHkxPSIyNi45IiB4Mj0iMzQuNjgiIHkyPSIyNi45Ii8+PGxpbmUgY2xhc3M9ImNscy01IiB4MT0iMzIuMTQiIHkxPSIyOC4zMyIgeDI9IjM0LjI5IiB5Mj0iMjguOTgiLz48bGluZSBjbGFzcz0iY2xzLTUiIHgxPSI4LjEiIHkxPSIyNi42OCIgeDI9IjUuMyIgeTI9IjI1LjMyIi8+PGxpbmUgY2xhc3M9ImNscy01IiB4MT0iNy45NyIgeTE9IjI3LjkyIiB4Mj0iNS4zNyIgeTI9IjI3LjkyIi8+PGxpbmUgY2xhc3M9ImNscy01IiB4MT0iNy45MSIgeTE9IjI5LjM1IiB4Mj0iNS43NiIgeTI9IjMwIi8+PHBhdGggY2xhc3M9ImNscy02IiBkPSJNMTkuMzIsMjcuNDlsMiwwYTAuMjksMC4yOSwwLDAsMSwuMi40OWwtMSwxYTAuMjksMC4yOSwwLDAsMS0uNDEsMGwtMS0xQTAuMjksMC4yOSwwLDAsMSwxOS4zMiwyNy40OVoiLz48bGluZSBjbGFzcz0iY2xzLTciIHgxPSIyMC4yOSIgeTE9IjMwLjQyIiB4Mj0iMjAuMjkiIHkyPSIyOC40NCIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTguNDIsMTZjMC4zNywwLjA4LjUyLS42NCwxLjU1LTEuMzcsMS4yNC0uODgsMi4wNi0wLjU3LDIuMzItMS4xNiwwLjMzLS43NS0wLjczLTEuODgtMS45My0zLjE2LTEtMS4wOC0xLjU2LTEuNjYtMi0xLjUxLTAuNjUuMjItLjYzLDEuODQtMC42LDMuNjlDNy43OCwxMy43OCw3LjgxLDE1Ljg0LDguNDIsMTZaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMzAuMzYsMTQuMjZjLTAuMzcuMDgtLjUyLTAuNjQtMS41NS0xLjM3LTEuMjQtLjg4LTIuMDYtMC41Ny0yLjMyLTEuMTYtMC4zMy0uNzUuNzMtMS44OCwxLjkzLTMuMTYsMS0xLjA4LDEuNTYtMS42NiwyLTEuNTEsMC42NSwwLjIyLjYzLDEuODQsMC42LDMuNjlDMzEsMTIuMDcsMzEsMTQuMTMsMzAuMzYsMTQuMjZaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjAuMzUsMTAuMjlsLTEsNC43Ny0xLjExLTQuNjNjMC4zLDAsLjYyLTAuMDgsMS0wLjFTMjAsMTAuMjksMjAuMzUsMTAuMjlaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjMuNjYsMTAuNjVMMjAuNzIsMTdsMS4xLTYuNjMsMC43OSwwLjA5QzIzLDEwLjUxLDIzLjMzLDEwLjU3LDIzLjY2LDEwLjY1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTE2Ljc0LDEwLjcxbDEuMTYsNy0zLTYuNGMwLjI4LS4xMS41OS0wLjIxLDAuOTEtMC4zMVoiLz48cGF0aCBjbGFzcz0iY2xzLTgiIGQ9Ik0xOS4yLDMxLjY2YTEuNiwxLjYsMCwwLDAsLjI1LDEsMS4yMiwxLjIyLDAsMCwwLC44MS41OSwxLjIsMS4yLDAsMCwwLDEtLjM5LDEuNDIsMS40MiwwLDAsMCwuMjgtMS4yNiwyLDIsMCwwLDEtMS4yMy0xLjE4Ii8+PHBhdGggY2xhc3M9ImNscy03IiBkPSJNMTYuNjEsMzAuNTRhMiwyLDAsMCwwLDIuMTcsMS4yLDIsMiwwLDAsMCwxLjUzLTEuMzgsMiwyLDAsMCwwLC42NiwxLDIuMDgsMi4wOCwwLDAsMCwxLjY0LjM1LDIuNDIsMi40MiwwLDAsMCwxLjQxLS44Ii8+PC9zdmc+';
var menuIconURI = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZWYyNzA7fS5jbHMtMntmaWxsOiNmYmIwNDA7fS5jbHMtM3tmaWxsOiMwNDA1MDQ7fS5jbHMtNHtmaWxsOiNmZmY7fS5jbHMtNSwuY2xzLTd7ZmlsbDpub25lO3N0cm9rZTojMWExNTE3O3N0cm9rZS1taXRlcmxpbWl0OjEwO30uY2xzLTV7c3Ryb2tlLXdpZHRoOjAuNXB4O30uY2xzLTZ7ZmlsbDojMWExNTE3O30uY2xzLTd7c3Ryb2tlLXdpZHRoOjAuMjlweDt9LmNscy04e2ZpbGw6I2U4NmFhODt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPk9iamVjdCBEZXRlY3Rpb248L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTYuNzMsMTYuNzhhOC43OCw4Ljc4LDAsMCwwLTMsMi45NUE5LjM1LDkuMzUsMCwwLDAsMi41LDI1LjA3YzAuMzYsNC4yNiwzLjg5LDYuODYsNC44Niw3LjU3LDMuOCwyLjgsNy45NCwyLjY3LDEyLjc4LDIuNTNDMjYsMzUsMzEuMjgsMzQuODQsMzQuNDIsMzAuODZhMTEuMTksMTEuMTksMCwwLDAsMi4xOS03LjUxLDExLjc4LDExLjc4LDAsMCwwLTQuNjktOC4yOWMwLjg4LTQuOTMuNjItOC43Mi0uOS05LjMtMS4xNi0uNDUtMywxLTMuODgsMS43MWExMC4wNywxMC4wNywwLDAsMC0yLjczLDMuMzcsMTUuMjcsMTUuMjcsMCwwLDAtMTAuNjQuOTRBMTAsMTAsMCwwLDAsMTAuODIsOC40QzkuODgsNy43Myw4LjMzLDYuNjIsNy4yNSw3LjE2Yy0wLjkxLjQ1LTEsMS44My0xLjE3LDMuNDJBMTcuMzMsMTcuMzMsMCwwLDAsNi43MywxNi43OFoiLz48ZWxsaXBzZSBjbGFzcz0iY2xzLTIiIGN4PSIxMS44OCIgY3k9IjIzLjI2IiByeD0iMi45NSIgcnk9IjMuMzUiLz48ZWxsaXBzZSBjbGFzcz0iY2xzLTIiIGN4PSIyNy4yOCIgY3k9IjIyLjYiIHJ4PSIyLjk1IiByeT0iMy4zNSIvPjxlbGxpcHNlIGNsYXNzPSJjbHMtMyIgY3g9IjEyLjQ0IiBjeT0iMjMuMjIiIHJ4PSIyLjM4IiByeT0iMi45Ii8+PGVsbGlwc2UgY2xhc3M9ImNscy00IiBjeD0iMTEuMjciIGN5PSIyMi42IiByeD0iMC41OCIgcnk9IjAuNzMiLz48ZWxsaXBzZSBjbGFzcz0iY2xzLTMiIGN4PSIyNi42NCIgY3k9IjIyLjU2IiByeD0iMi4zOCIgcnk9IjIuOSIvPjxlbGxpcHNlIGNsYXNzPSJjbHMtNCIgY3g9IjI1LjQ2IiBjeT0iMjEuOTUiIHJ4PSIwLjU4IiByeT0iMC43MyIvPjxsaW5lIGNsYXNzPSJjbHMtNSIgeDE9IjMxLjk0IiB5MT0iMjUuNjYiIHgyPSIzNC43NCIgeTI9IjI0LjI5Ii8+PGxpbmUgY2xhc3M9ImNscy01IiB4MT0iMzIuMDciIHkxPSIyNi45IiB4Mj0iMzQuNjgiIHkyPSIyNi45Ii8+PGxpbmUgY2xhc3M9ImNscy01IiB4MT0iMzIuMTQiIHkxPSIyOC4zMyIgeDI9IjM0LjI5IiB5Mj0iMjguOTgiLz48bGluZSBjbGFzcz0iY2xzLTUiIHgxPSI4LjEiIHkxPSIyNi42OCIgeDI9IjUuMyIgeTI9IjI1LjMyIi8+PGxpbmUgY2xhc3M9ImNscy01IiB4MT0iNy45NyIgeTE9IjI3LjkyIiB4Mj0iNS4zNyIgeTI9IjI3LjkyIi8+PGxpbmUgY2xhc3M9ImNscy01IiB4MT0iNy45MSIgeTE9IjI5LjM1IiB4Mj0iNS43NiIgeTI9IjMwIi8+PHBhdGggY2xhc3M9ImNscy02IiBkPSJNMTkuMzIsMjcuNDlsMiwwYTAuMjksMC4yOSwwLDAsMSwuMi40OWwtMSwxYTAuMjksMC4yOSwwLDAsMS0uNDEsMGwtMS0xQTAuMjksMC4yOSwwLDAsMSwxOS4zMiwyNy40OVoiLz48bGluZSBjbGFzcz0iY2xzLTciIHgxPSIyMC4yOSIgeTE9IjMwLjQyIiB4Mj0iMjAuMjkiIHkyPSIyOC40NCIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTguNDIsMTZjMC4zNywwLjA4LjUyLS42NCwxLjU1LTEuMzcsMS4yNC0uODgsMi4wNi0wLjU3LDIuMzItMS4xNiwwLjMzLS43NS0wLjczLTEuODgtMS45My0zLjE2LTEtMS4wOC0xLjU2LTEuNjYtMi0xLjUxLTAuNjUuMjItLjYzLDEuODQtMC42LDMuNjlDNy43OCwxMy43OCw3LjgxLDE1Ljg0LDguNDIsMTZaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMzAuMzYsMTQuMjZjLTAuMzcuMDgtLjUyLTAuNjQtMS41NS0xLjM3LTEuMjQtLjg4LTIuMDYtMC41Ny0yLjMyLTEuMTYtMC4zMy0uNzUuNzMtMS44OCwxLjkzLTMuMTYsMS0xLjA4LDEuNTYtMS42NiwyLTEuNTEsMC42NSwwLjIyLjYzLDEuODQsMC42LDMuNjlDMzEsMTIuMDcsMzEsMTQuMTMsMzAuMzYsMTQuMjZaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjAuMzUsMTAuMjlsLTEsNC43Ny0xLjExLTQuNjNjMC4zLDAsLjYyLTAuMDgsMS0wLjFTMjAsMTAuMjksMjAuMzUsMTAuMjlaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjMuNjYsMTAuNjVMMjAuNzIsMTdsMS4xLTYuNjMsMC43OSwwLjA5QzIzLDEwLjUxLDIzLjMzLDEwLjU3LDIzLjY2LDEwLjY1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTE2Ljc0LDEwLjcxbDEuMTYsNy0zLTYuNGMwLjI4LS4xMS41OS0wLjIxLDAuOTEtMC4zMVoiLz48cGF0aCBjbGFzcz0iY2xzLTgiIGQ9Ik0xOS4yLDMxLjY2YTEuNiwxLjYsMCwwLDAsLjI1LDEsMS4yMiwxLjIyLDAsMCwwLC44MS41OSwxLjIsMS4yLDAsMCwwLDEtLjM5LDEuNDIsMS40MiwwLDAsMCwuMjgtMS4yNiwyLDIsMCwwLDEtMS4yMy0xLjE4Ii8+PHBhdGggY2xhc3M9ImNscy03IiBkPSJNMTYuNjEsMzAuNTRhMiwyLDAsMCwwLDIuMTcsMS4yLDIsMiwwLDAsMCwxLjUzLTEuMzgsMiwyLDAsMCwwLC42NiwxLDIuMDgsMi4wOCwwLDAsMCwxLjY0LjM1LDIuNDIsMi40MiwwLDAsMCwxLjQxLS44Ii8+PC9zdmc+';

/**
 * Class for the motion-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */


class objectDetection{
    constructor(runtime){

        var _this = this;
        console.log('Using TensorFlow backend: ', tf.getBackend());
        this.runtime = runtime;
    console.log('MODEL_LOADING');
    this.modelLoaded = false;
    var self = this;
    netModel = new Promise(function (resolve) {

      cocoSsd.load({
        base: 'lite_mobilenet_v2',
        modelUrl: 'static/models/objectDetection/model.json'
      }).catch(function (err) {
      })
      .then(function (net) {
        

        netModel2 = net;

        self.runtime.renderer.requestSnapshot(function (data) {
          var image = document.createElement('img');
          console.log("testing ss"+image);
          image.onload = function () {
            netModel2.detect(image, minNumBoxes, minScore).then(function (prediction) {
              isStage = true;
              stageWidth = image.width;
              stageHeight = image.height;
              objectDetected = prediction;
              // runtime.emit('MODEL_LOADING_FINISHED', true);
              console.log('Model_Loading_Finished');
              self.modelLoaded = true;
              resolve('Done');
              return "Done";
            });
          };

          image.setAttribute("src", data);
        })
      }).catch(function (err) {
        console.log('mylog'+err) ;
        // _this.runtime.emit('MODEL_LOADING_FINISHED', false);
      });
    });
    this.globalVideoState = 'off';
    this.runtime.ioDevices.video.disableVideo();
    this.extensionName = 'Object Detection';
    this._canvas = document.querySelector('canvas');
    this._penSkinId = this.runtime.renderer.createPenSkin();
    var penDrawableId = this.runtime.renderer.createDrawable(StageLayering.IMAGE_LAYER);
    this.runtime.renderer.updateDrawableProperties(penDrawableId, {
      skinId: this._penSkinId
    });
  

    }

    getInfo() {
        return {
          id: 'objectDetection',
          name: 'Object Detection',
          blockIconURI: blockIconURI,
          menuIconURI: menuIconURI,
          colour: '#c64342',
          colourSecondary: '#b63535',
          colourTertiary: '#a42b2b',
          blocks: [{
            message: formatMessage({
              id: 'objectDetection.blockSeparatorMessage1',
              default: 'Settings',
              description: 'Settings'
            })
        }, {
            opcode: 'toggleStageVideoFeed',
            text: formatMessage({
              id: 'objectDetection.toggleStageVideoFeed',
              default: 'turn [VIDEO_STATE] video on stage with [TRANSPARENCY] % transparency',
              description: 'toggle video feed on stage'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
              VIDEO_STATE: {
                type: ArgumentType.STRING,
                menu: 'videoState',
                defaultValue: 'on'
              },
              TRANSPARENCY: {
                type: ArgumentType.MATHSLIDER100,
                defaultValue: '0'
              }
            }
          }, {
            opcode: 'drawBoundingBox',
            text: formatMessage({
              id: 'objectDetection.drawBoundingBox',
              default: '[OPTION] bounding box',
              description: 'Draw bounding box'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
              OPTION: {
                type: ArgumentType.NUMBER,
                menu: 'drawBox',
                defaultValue: '1'
              }
            }
          }, {
            opcode: 'setThreshold',
            text: formatMessage({
              id: 'customObjectDetection.setThreshold',
              default: 'set detection threshold to [THRESHOLD]',
              description: 'set threshold'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
              THRESHOLD: {
                type: ArgumentType.NUMBER,
                menu: 'threshold',
                defaultValue: '0.5'
              }
            }
          }, {
            message: formatMessage({
              id: 'objectDetection.blockSeparatorMessage2',
              default: 'Analyse Image',
              description: 'Analyse Feed'
            })
          }, {
            opcode: 'analyseImage',
            text: formatMessage({
              id: 'objectDetection.analyseImage',
              default: 'analyse image from [FEED]',
              description: 'Analyse Image'
            }),
            blockType: BlockType.COMMAND,
            arguments: {
              FEED: {
                type: ArgumentType.NUMBER,
                menu: 'feed',
                defaultValue: '1'
              }
            }
          }, "---", {
            opcode: 'getObjectCount',
            text: formatMessage({
              id: 'objectDetection.getObjectCount',
              default: 'get # of objects',
              description: 'Get # of people'
            }),
            blockType: BlockType.REPORTER
          }, {
            opcode: 'getDetails',
            text: formatMessage({
              id: 'objectDetection.getDetails',
              default: '[OPTION] of object [OBJECT]',
              description: 'X Position of Parts'
            }),
            blockType: BlockType.REPORTER,
            arguments: {
              OBJECT: {
                type: ArgumentType.NUMBER,
                menu: 'personNumbers',
                defaultValue: '1'
              },
              OPTION: {
                type: ArgumentType.NUMBER,
                menu: 'objectOption',
                defaultValue: '0'
              }
            }
          }, {
            opcode: 'isDetected',
            text: formatMessage({
              id: 'objectDetection.isDetected',
              default: 'is [OBJECT] detected?',
              description: 'is object detected'
            }),
            blockType: BlockType.BOOLEAN,
            arguments: {
              OBJECT: {
                type: ArgumentType.STRING,
                menu: 'objects',
                defaultValue: 'person'
              }
            }
          }, {
            opcode: 'getNoDetected',
            text: formatMessage({
              id: 'objectDetection.getNoDetected',
              default: 'get number of [OBJECT] detected?',
              description: 'is object detected'
            }),
            blockType: BlockType.REPORTER,
            arguments: {
              OBJECT: {
                type: ArgumentType.STRING,
                menu: 'objects',
                defaultValue: 'person'
              }
            }
          }],
          menus: {
            videoState: [{
              text: 'off',
              value: 'off'
            }, {
              text: 'on',
              value: 'on'
            }, {
              text: 'on flipped',
              value: 'onFlipped'
            }],
            personNumbers: {
              acceptReporters: true,
              items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
            },
            objectOption: [{
              text: 'class',
              value: '0'
            }, {
              text: 'x position',
              value: '1'
            }, {
              text: 'y position',
              value: '2'
            }, {
              text: 'width',
              value: '3'
            }, {
              text: 'height',
              value: '4'
            }, {
              text: 'confidence',
              value: '5'
            }],
            feed: {
              items: [{
                text: 'camera',
                value: '1'
              }, {
                text: 'stage',
                value: '2'
              }]
            },
            drawBox: [{
              text: 'show',
              value: '1'
            }, {
              text: 'hide',
              value: '2'
            }],
            threshold: {
              acceptReporters: true,
              items: ['0.95', '0.9', '0.85', '0.8', '0.75', '0.7', '0.6', '0.5', '0.4', '0.3']
            },
            objects: [{
              text: 'person',
              value: "person"
            }, {
              text: 'bicycle',
              value: "bicycle"
            }, {
              text: 'car',
              value: "car"
            }, {
              text: 'motorcycle',
              value: "motorcycle"
            }, {
              text: 'airplane',
              value: "airplane"
            }, {
              text: 'bus',
              value: "bus"
            }, {
              text: 'train',
              value: "train"
            }, {
              text: 'truck',
              value: "truck"
            }, {
              text: 'boat',
              value: "boat"
            }, {
              text: 'traffic light',
              value: "traffic light"
            }, {
              text: 'fire hydrant',
              value: "fire hydrant"
            }, {
              text: 'stop sign',
              value: "stop sign"
            }, {
              text: 'parking meter',
              value: "parking meter"
            }, {
              text: 'bench',
              value: "bench"
            }, {
              text: 'bird',
              value: "bird"
            }, {
              text: 'cat',
              value: "cat"
            }, {
              text: 'dog',
              value: "dog"
            }, {
              text: 'horse',
              value: "horse"
            }, {
              text: 'sheep',
              value: "sheep"
            }, {
              text: 'cow',
              value: "cow"
            }, {
              text: 'elephant',
              value: "elephant"
            }, {
              text: 'bear',
              value: "bear"
            }, {
              text: 'zebra',
              value: "zebra"
            }, {
              text: 'giraffe',
              value: "giraffe"
            }, {
              text: 'backpack',
              value: "backpack"
            }, {
              text: 'umbrella',
              value: "umbrella"
            }, {
              text: 'handbag',
              value: "handbag"
            }, {
              text: 'tie',
              value: "tie"
            }, {
              text: 'suitcase',
              value: "suitcase"
            }, {
              text: 'frisbee',
              value: "frisbee"
            }, {
              text: 'skis',
              value: "skis"
            }, {
              text: 'snowboard',
              value: "snowboard"
            }, {
              text: 'sports ball',
              value: "sports ball"
            }, {
              text: 'kite',
              value: "kite"
            }, {
              text: 'baseball bat',
              value: "baseball bat"
            }, {
              text: 'baseball glove',
              value: "baseball glove"
            }, {
              text: 'skateboard',
              value: "skateboard"
            }, {
              text: 'surfboard',
              value: "surfboard"
            }, {
              text: 'tennis racket',
              value: "tennis racket"
            }, {
              text: 'bottle',
              value: "bottle"
            }, {
              text: 'wine glass',
              value: "wine glass"
            }, {
              text: 'cup',
              value: "cup"
            }, {
              text: 'fork',
              value: "fork"
            }, {
              text: 'knife',
              value: "knife"
            }, {
              text: 'spoon',
              value: "spoon"
            }, {
              text: 'bowl',
              value: "bowl"
            }, {
              text: 'banana',
              value: "banana"
            }, {
              text: 'apple',
              value: "apple"
            }, {
              text: 'sandwich',
              value: "sandwich"
            }, {
              text: 'orange',
              value: "orange"
            }, {
              text: 'broccoli',
              value: "broccoli"
            }, {
              text: 'carrot',
              value: "carrot"
            }, {
              text: 'hot dog',
              value: "hot dog"
            }, {
              text: 'pizza',
              value: "pizza"
            }, {
              text: 'donut',
              value: "donut"
            }, {
              text: 'cake',
              value: "cake"
            }, {
              text: 'chair',
              value: "chair"
            }, {
              text: 'couch',
              value: "couch"
            }, {
              text: 'potted plant',
              value: "potted plant"
            }, {
              text: 'bed',
              value: "bed"
            }, {
              text: 'dining table',
              value: "dining table"
            }, {
              text: 'toilet',
              value: "toilet"
            }, {
              text: 'tv',
              value: "tv"
            }, {
              text: 'laptop',
              value: "laptop"
            }, {
              text: 'mouse',
              value: "mouse"
            }, {
              text: 'remote',
              value: "remote"
            }, {
              text: 'keyboard',
              value: "keyboard"
            }, {
              text: 'cell phone',
              value: "cell phone"
            }, {
              text: 'microwave',
              value: "microwave"
            }, {
              text: 'oven',
              value: "oven"
            }, {
              text: 'toaster',
              value: "toaster"
            }, {
              text: 'sink',
              value: "sink"
            }, {
              text: 'refrigerator',
              value: "refrigerator"
            }, {
              text: 'book',
              value: "book"
            }, {
              text: 'clock',
              value: "clock"
            }, {
              text: 'vase',
              value: "vase"
            }, {
              text: 'scissors',
              value: "scissors"
            }, {
              text: 'teddy bear',
              value: "teddy bear"
            }, {
              text: 'hair drier',
              value: "hair drier"
            }, {
              text: 'toothbrush',
              value: "toothbrush"
            }]
          }
        };
      }

      toggleStageVideoFeed(args, util) {
        //if (!this.runtime.checkSessionExists(this.extensionName)) return;
        var state = args.VIDEO_STATE;
        this.globalVideoState = args.VIDEO_STATE;
        this.runtime.ioDevices.video.setPreviewGhost(args.TRANSPARENCY);
  
        if (state === 'off') {
          this.runtime.ioDevices.video.disableVideo();
        } else {
          this.runtime.ioDevices.video.enableVideo(); // Mirror if state is ON. Do not mirror if state is ON_FLIPPED.
  
          this.runtime.ioDevices.video.mirror = state === 'on';
        }
      }
      
      analyseImage(args, util) {
        var _this2 = this;
  
        var self2 = this;
        //if (!this.runtime.checkSessionExists(this.extensionName)) return;
        
        if (this.modelLoaded) {
        
          if (args.FEED === '1') {
            var translatePromise = new Promise(function (resolve) {
              var frame = _this2.runtime.ioDevices.video.getFrame({
                format: Video.FORMAT_IMAGE_DATA,
                dimensions: objectDetection.DIMENSIONS
              });
  
              netModel2.detect(frame, minNumBoxes, minScore).then(function (prediction) {
                isStage = false;
                objectDetected = prediction;
  
                if (drawOnStage) {
                  self2._clearMark();
  
                  for (var _i = 0; _i < objectDetected.length; _i++) {
                    self2._drawMark(objectDetected[_i].bbox[0], objectDetected[_i].bbox[1], objectDetected[_i].bbox[2], objectDetected[_i].bbox[3], objectDetection.DIMENSIONS[0], objectDetection.DIMENSIONS[1], _i);
                  }
                }
  
                resolve('Done');
                return 'Done';
              }).catch(function (err) {
                objectDetected = [];
                resolve('Camera not ready!');
                return 'Camera not ready!';
              });
            });
            return translatePromise;
          } else if (args.FEED === '2') {
            return new Promise(function (resolve) {
              _this2.runtime.renderer.requestSnapshot(function (data) {
                var image = document.createElement('img');
  
                image.onload = function () {
                  netModel2.detect(image, minNumBoxes, minScore).then(function (prediction) {
                    isStage = true;
                    stageWidth = image.width;
                    stageHeight = image.height;
                    objectDetected = prediction;
  
                    if (drawOnStage) {
                      self2._clearMark();
  
                      for (var _i2 = 0; _i2 < objectDetected.length; _i2++) {
                        self2._drawMark(objectDetected[_i2].bbox[0], objectDetected[_i2].bbox[1], objectDetected[_i2].bbox[2], objectDetected[_i2].bbox[3], stageWidth, stageHeight, _i2);
                      }
                    }
  
                    resolve('Done');
                    return 'Done';
                  });
                };
  
                image.setAttribute("src", data);
              });
            });
          }
        } else {
          this.runtime.emit('MODEL_LOADING');
          var self = this;
          return new Promise(function (resolve) {
            cocoSsd.load().then(function (net) {
              netModel2 = net;
              self.runtime.emit('MODEL_LOADING_FINISHED', true);
              self.modelLoaded = true;
  
              if (args.FEED === '1') {
                var frame = this.runtime.ioDevices.video.getFrame({
                  format: Video.FORMAT_IMAGE_DATA,
                  dimensions: objectDetection.DIMENSIONS
                });
                netModel2.detect(frame, minNumBoxes, minScore).then(function (prediction) {
                  isStage = false;
                  objectDetected = prediction;
  
                  if (drawOnStage) {
                    self2._clearMark();
  
                    for (var _i3 = 0; _i3 < objectDetected.length; _i3++) {
                      self2._drawMark(objectDetected[_i3].bbox[0], objectDetected[_i3].bbox[1], objectDetected[_i3].bbox[2], objectDetected[_i3].bbox[3], objectDetection.DIMENSIONS[0], objectDetection.DIMENSIONS[1], _i3);
                    }
                  }
  
                  resolve('Done');
                  return 'Done';
                }).catch(function (err) {
                  objectDetected = [];
                  resolve('Camera not ready!');
                  return 'Camera not ready!';
                });
              } else if (args.FEED === '2') {
                self.runtime.renderer.requestSnapshot(function (data) {
                  var image = document.createElement('img');
  
                  image.onload = function () {
                    netModel2.detect(image, minNumBoxes, minScore).then(function (prediction) {
                      isStage = true;
                      stageWidth = image.width;
                      stageHeight = image.height;
                      objectDetected = prediction;
  
                      if (drawOnStage) {
                        self2._clearMark();
  
                        for (var _i4 = 0; _i4 < objectDetected.length; _i4++) {
                          self2._drawMark(objectDetected[_i4].bbox[0], objectDetected[_i4].bbox[1], objectDetected[_i4].bbox[2], objectDetected[_i4].bbox[3], stageWidth, stageHeight, _i4);
                        }
                      }
  
                      resolve('Done');
                      return 'Done';
                    });
                  };
  
                  image.setAttribute("src", data);
                });
              }
            }).catch(function (err) {
              _this2.runtime.emit('MODEL_LOADING_FINISHED', false);
  
              resolve('');
            });
          });
        }
      }
      _drawMark(x1, y1, w, h, width, height, num) {
        var widthScale = 480 / width;
        var heightScale = 360 / height;
        x1 = x1 * widthScale - width / 2 * widthScale;
        var x2 = x1 + w * widthScale;
        var x3 = x2;
        var x4 = x1;
        y1 = height / 2 * heightScale - y1 * heightScale;
        var y2 = y1;
        var y3 = y1 - h * heightScale;
        var y4 = y3;
        this.runtime.renderer.penLine(this._penSkinId, MakerAttributes[num], x1, y1, x2, y2);
        this.runtime.renderer.penLine(this._penSkinId, MakerAttributes[num], x2, y2, x3, y3);
        this.runtime.renderer.penLine(this._penSkinId, MakerAttributes[num], x4, y4, x3, y3);
        this.runtime.renderer.penLine(this._penSkinId, MakerAttributes[num], x4, y4, x1, y1);
      }
      _clearMark() {
        this.runtime.renderer.penClear(this._penSkinId);
      }

      getObjectCount(args, util) {
        return objectDetected.length;
      }

      getDetails(args, util) {
        //if (!this.runtime.checkSessionExists(this.extensionName)) return;
  
        if (objectDetected[parseInt(args.OBJECT, 10) - 1] && objectDetected[parseInt(args.OBJECT, 10) - 1].score > 0.3) {
          if (args.OPTION === "0") {
            return objectDetected[parseInt(args.OBJECT, 10) - 1].class;
          } else if (args.OPTION === "1") {
            if (!isStage) {
              var XPos = objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[0] + objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[2] / 2;
              XPos = XPos - 240;
              return XPos.toFixed(1);
            } else {
              var _XPos = 480 * (objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[0] + objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[2] / 2) / stageWidth;
  
              _XPos = _XPos - 240;
              return _XPos.toFixed(1);
            }
          } else if (args.OPTION === "2") {
            if (!isStage) {
              var YPos = objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[1] + objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[3] / 2;
              YPos = 180 - YPos;
              return YPos.toFixed(1);
            } else {
              var _YPos = 360 * (objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[1] + objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[3] / 2) / stageHeight;
  
              _YPos = 180 - _YPos;
              return _YPos.toFixed(1);
            }
          } else if (args.OPTION === "3") {
            if (!isStage) {
              var Width = objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[2];
              return Width.toFixed(1);
            } else {
              var _Width = 480 * objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[2] / stageWidth;
  
              return _Width.toFixed(1);
            }
          } else if (args.OPTION === "4") {
            if (!isStage) {
              var Height = objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[3];
              return Height.toFixed(1);
            } else {
              var _Height = 360 * objectDetected[parseInt(args.OBJECT, 10) - 1].bbox[3] / stageHeight;
  
              return _Height.toFixed(1);
            }
          } else if (args.OPTION === "5") {
            var Confidence = objectDetected[parseInt(args.OBJECT, 10) - 1].score;
            return Confidence.toFixed(2);
          }
        } else {
          return "NULL";
        }
      }
      drawBoundingBox(args, util) {
        var self2 = this;
  
        if (args.OPTION === "1") {
          drawOnStage = true;
  
          self2._clearMark();
  
          for (var _i5 = 0; _i5 < objectDetected.length; _i5++) {
            self2._drawMark(objectDetected[_i5].bbox[0], objectDetected[_i5].bbox[1], objectDetected[_i5].bbox[2], objectDetected[_i5].bbox[3], objectDetection.DIMENSIONS[0], objectDetection.DIMENSIONS[1], _i5);
          }
        } else {
          drawOnStage = false;
  
          this._clearMark();
        }
      }

      setThreshold(args, util) {
        minScore = parseFloat(args.THRESHOLD);
      }
      isDetected(args, util) {
        var isObjectDetected = false;
  
        for (var _i6 = 0; _i6 < objectDetected.length; _i6++) {
          if (objectDetected[_i6].class === args.OBJECT) {
            isObjectDetected = true;
          }
        }
  
        return isObjectDetected;
      }
      getNoDetected(args, util) {
        var objectCount = 0;
  
        for (var _i7 = 0; _i7 < objectDetected.length; _i7++) {
          if (objectDetected[_i7].class === args.OBJECT) {
            objectCount = objectCount + 1;
          }
        }
  
        return objectCount;
      }

      static get DIMENSIONS() {
        return [480, 360];  
      }


}
module.exports = objectDetection;