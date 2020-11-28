import { FrontEffect, BackgroundEffect, VideoQuality } from "./VideoEffectProvider"
import { AsciiArtWorkerManager, generateAsciiArtDefaultConfig, AsciiConfig, generateDefaultAsciiArtParams } from "@dannadori/asciiart-worker-js"
import { BodypixWorkerManager, generateBodyPixDefaultConfig, generateDefaultBodyPixParams } from "@dannadori/bodypix-worker-js"
import { BodyPixConfig } from "@dannadori/bodypix-worker-js/dist/const"
import { FacemeshWorkerManager, generateFacemeshDefaultConfig, FacemeshConfig, generateDefaultFacemeshParams } from "@dannadori/facemesh-worker-js"
import { OpenCVWorkerManager, generateOpenCVDefaultConfig, OpenCVConfig, generateDefaultOpenCVParams } from "@dannadori/opencv-worker-js"
import { VirtualBackground } from "./VirtualBackground"

export class VideoEffector {
    private backgroundVideo  = document.createElement("video")
    private backgroundCanvas = document.createElement("canvas")
    private frontVideo       = document.createElement("video")
    private frontCanvas      = document.createElement("canvas")
    private tempCanvas       = document.createElement("canvas")
  
    private _backgroundImage  = document.createElement("img")
    
    private vb = new VirtualBackground()
    
    private _frontEffect: FrontEffect = "None"
    private _backgroundEffect: BackgroundEffect = "None"
    private _quality = '360p' as VideoQuality 
    private _syncBackground = true
  
  
    // Constructor and Singleton pattern
    private static _instance:VideoEffector;
    public static getInstance():VideoEffector{
      if(!this._instance){
        this._instance= new VideoEffector()
      }
      return this._instance
    }
    constructor(){
      console.log("video effector !!!!!!")
    }
  
  
    // Set Attribute
    set frontEffect(val:FrontEffect){this._frontEffect = val} 
    get frontEffect(){return this._frontEffect}
  
    set backgroundEffect(val:BackgroundEffect){
      this.backgroundVideo.pause()
      this._backgroundEffect=val
    }
    get backgroundEffect(){return this._backgroundEffect}
  
    set quality(val:VideoQuality){this._quality = val} 
    get quality(){return this._quality}
    
  
    set backgroundImage(val:HTMLImageElement){this._backgroundImage=val}
    set syncBackground(val:boolean){this._syncBackground=val}
    get syncBackground(){return this._syncBackground}
  
  
    set frontMediaStream(stream:MediaStream|null){
      if(stream===null){
        this.frontVideo.pause()
        this.frontVideo.srcObject = null
        return
      }
      const videoWidth = stream.getVideoTracks()[0].getSettings().width
      const videoHeight = stream.getVideoTracks()[0].getSettings().height
      for(let comp of [this.frontVideo, this.frontCanvas, this.backgroundCanvas, this.tempCanvas]){
        comp.width  = videoWidth!
        comp.height = videoHeight!
      }    
  
      this.frontVideo.srcObject = stream
      this.frontVideo.play()
      console.log("video resolution",videoWidth, videoHeight)    
    }
  
    get convertedMediaStream():MediaStream{
      //@ts-ignore
      return this.tempCanvas.captureStream() as MediaStream
    }
  
    set backgroundMediaStream(stream:MediaStream|null){
      if(stream === null){
        this.backgroundVideo.pause()
        return
      }
      const videoWidth = stream.getVideoTracks()[0].getSettings().width
      const videoHeight = stream.getVideoTracks()[0].getSettings().height    
      for(let comp of [this.backgroundVideo]){
        comp.width  = videoWidth!
        comp.height = videoHeight!
      }    
  
      this.backgroundVideo.srcObject=stream
      this.backgroundVideo.play()
      console.log("set background mediastream", videoWidth, videoHeight)
    }
  
    //// workers
    // Ascii Art
    asciiArtWorkerManagerForF = (()=>{
      const w = new AsciiArtWorkerManager()
      w.init(generateAsciiArtDefaultConfig())
      return w
    })()
    asciiArtWorkerManagerForB = (()=>{
      const w = new AsciiArtWorkerManager()
      w.init(generateAsciiArtDefaultConfig())
      return w
    })()
    _asciiArtConfig = generateAsciiArtDefaultConfig()
    set asciiArtConfig(val:AsciiConfig) {
      this.asciiArtWorkerManagerForF.init(val)
      this.asciiArtWorkerManagerForB.init(val)
      this._asciiArtConfig = val
    }
    asciiArtParams = generateDefaultAsciiArtParams()
    // BodyPix
    bodyPixWorkerManager = (()=>{
      const w = new BodypixWorkerManager()    
      w.init(generateBodyPixDefaultConfig())
      return w
    })()
    _bodyPixConfig = generateBodyPixDefaultConfig()
    set bodyPixConfig(val:BodyPixConfig) {
      this.bodyPixWorkerManager.init(val)
      this._bodyPixConfig = val
    }
    bodyPixParams = generateDefaultBodyPixParams()
    // Facemesh
    facemeshWorkerManager = (()=>{
      const w = new FacemeshWorkerManager()
      w.init(generateFacemeshDefaultConfig())
      return w
    })()
    _facemeshConfig = generateFacemeshDefaultConfig()
    set facemeshConfig(val:FacemeshConfig){
      this.facemeshWorkerManager.init(val)
      this._facemeshConfig=val
    }
    facemeshParams = generateDefaultFacemeshParams()
    // OpenCV
    opencvManagerForF = (()=>{
      const w = new OpenCVWorkerManager()
      w.init(generateOpenCVDefaultConfig())
      return w
    })()
    opencvManagerForB = (()=>{
      const w = new OpenCVWorkerManager()
      w.init(generateOpenCVDefaultConfig())
      return w
    })()
    _opencvConfig = generateOpenCVDefaultConfig()
    set opencvConfig(val:OpenCVConfig){
      this.opencvManagerForF.init(val)
      this.opencvManagerForB.init(val)
      this._opencvConfig=val
    }
    opencvParams = generateDefaultOpenCVParams()
    
  
    // Operation
    copyFrame = () =>{
      // If virtual background is disabled, return here
      if(this.frontEffect === "None" && this._backgroundEffect === "None"){
        this.tempCanvas.getContext("2d")!.drawImage(this.frontVideo, 0, 0, this.tempCanvas.width, this.tempCanvas.height)
        requestAnimationFrame(this.copyFrame)
        return
      }
  
      // from here, for virtual background is enabled.    
      this.frontCanvas.getContext("2d")!.drawImage(this.frontVideo, 0, 0, this.frontCanvas.width, this.frontCanvas.height)
      // Copy background. if effects of background and front are same, this is skipped.
      if(this._backgroundEffect !== this._frontEffect){
        // console.log("background copied")
        switch(this._backgroundEffect){
          case "Image":
            this.backgroundCanvas.getContext("2d")!.drawImage(this._backgroundImage, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
            break
          case "Window":
            this.backgroundCanvas.getContext("2d")!.drawImage(this.backgroundVideo, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
            break
          case "Black":
            this.backgroundCanvas.getContext("2d")!.fillStyle="black"
            this.backgroundCanvas.getContext("2d")!.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
            break
          default:
            this.backgroundCanvas.getContext("2d")!.drawImage(this.frontVideo, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
            break
        }
      }
  
      const promises = []
      // edit background. if effects of background and front are same, this is set null(not promise).
      if(this._backgroundEffect !== this._frontEffect){
        switch(this._backgroundEffect){
          case "Ascii":
            promises.push(this.asciiArtWorkerManagerForB.predict(this.backgroundCanvas, this.asciiArtParams))
            break
          case "Canny":
            promises.push(this.opencvManagerForB.predict(this.backgroundCanvas, this.opencvParams))
            break
          default:
            promises.push(null)
        }
      }else{
        promises.push(null)
      }
  
      // edit front
      switch(this.frontEffect){
        case "Ascii":
          promises.push(this.asciiArtWorkerManagerForF.predict(this.frontCanvas, this.asciiArtParams))
          break
        case "Canny":
          promises.push(this.opencvManagerForF.predict(this.frontCanvas, this.opencvParams))
          break
        default:
          promises.push(null)
      }
  
      // segment body.  if effects of background and front are same, this is set null(not promise).
      if(this._backgroundEffect !== this._frontEffect){
        promises.push(this.bodyPixWorkerManager.predict(this.frontCanvas, this.bodyPixParams))
      }else{
        promises.push(null)
      }
      
      Promise.all(promises).then(([back, front, segment])=>{
        //console.log(back, front, segment)
        if(!front){
          if(this.frontEffect === "Black"){
            this.frontCanvas.getContext("2d")!.fillStyle="black"
            this.frontCanvas.getContext("2d")!.fillRect(0, 0, this.frontCanvas.width, this.frontCanvas.height)
          }
          front = this.frontCanvas
        }
        if(!back){
          back = this.backgroundCanvas
        }
        if(segment){
          const f = this.vb.convert(front, back, segment)
          // console.log("virtual:::",front.width, back.width, this.backgroundCanvas.width, f.width)
          this.tempCanvas.getContext("2d")!.drawImage(f, 0, 0, this.tempCanvas.width, this.tempCanvas.height)
          requestAnimationFrame(this.copyFrame)
        }else{
          this.tempCanvas.getContext("2d")!.drawImage(front, 0, 0, this.tempCanvas.width, this.tempCanvas.height)
          requestAnimationFrame(this.copyFrame)
        }
      })
    }
  }
  