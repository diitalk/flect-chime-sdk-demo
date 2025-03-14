import { useEffect, useMemo } from "react"
import { useAppState } from "../../../../providers/AppStateProvider";
import { VideoTileState } from "amazon-chime-sdk-js";
import { RendererForRecorder } from "../../../023_meetingRoom/components/ScreenView/helper/RendererForRecorder";

export type FocustTarget = "SharedContent" | "Speaker"

type Props = {
    width: number
    height: number
    setActiveRecorderCanvas: (c:HTMLCanvasElement)=>void
    setAllRecorderCanvas: (c:HTMLCanvasElement)=>void
};

export const RecorderView = ({ width, height, setActiveRecorderCanvas, setAllRecorderCanvas }: Props) => {

    const { videoTileStates, activeSpeakerId, meetingSession, getUserNameByAttendeeIdFromList } = useAppState()

    const activeRenderer = useMemo(()=>{return new RendererForRecorder(meetingSession!)},[]) // eslint-disable-line
    const allRenderer    = useMemo(()=>{return new RendererForRecorder(meetingSession!)},[]) // eslint-disable-line
    
    /// Active Tiles
    const contentsTiles = Object.values(videoTileStates).filter(tile=>{return tile.isContent})
    const activeSpekerTile = activeSpeakerId && videoTileStates[activeSpeakerId] ? videoTileStates[activeSpeakerId] : null

    const activeTiles = (contentsTiles.length > 0 ? contentsTiles : [activeSpekerTile]).filter(tile=>{return tile!==null}) as VideoTileState[]
    const activeTilesId = activeTiles.reduce<string>((sum,cur)=>{return `${sum}-${cur.boundAttendeeId}`},"")
    
    /// All Tiles
    const allTiles = Object.values(videoTileStates).filter(x=>{return x.localTile===false})
    // const allTiles = Object.values(videoTileStates).filter(x=>{x.boundAttendeeId !== attendeeId})
    const allTilesId = allTiles.reduce<string>((sum,cur)=>{return `${sum}-${cur.boundAttendeeId}`},"")


    //// (1) Setup Renderer, notify canvas to parent
    //// (1-1) setup for ActiveRenderer
    useEffect(() => {
        const activeDstCanvas = document.getElementById("ActiveRecorderCanvas") as HTMLCanvasElement
        activeRenderer.init(activeDstCanvas)
        activeRenderer.start() 
        setActiveRecorderCanvas(activeDstCanvas)
        return () => {
            console.log("destroy renderer", activeRenderer)
            activeRenderer.destroy()
        }
    }, []) // eslint-disable-line

    //// (1-2) setup for AllRenderer
    useEffect(() => {
        const allDstCanvas = document.getElementById("AllRecorderCanvas") as HTMLCanvasElement
        allRenderer.init(allDstCanvas)
        allRenderer.start()
        setAllRecorderCanvas(allDstCanvas)
        return () => {
            console.log("destroy renderer", activeRenderer)
            activeRenderer.destroy()
        }
    }, []) // eslint-disable-line


    //// (2) Set srouce video
    //// (a) bind,  (b) input into renderer
    //// (2-1) for Active Renderer
    useEffect(()=>{
        console.log("Active CHANGE!", activeTilesId)
        const videoElems = [...Array(activeTiles.length)].map((v,i)=>{return document.getElementById(`activeVideo${i}`) as HTMLVideoElement})
        const titles:string[] = []
        // console.log(videoElems)
        activeTiles.forEach((tile,index)=>{
            if(tile.tileId){
                meetingSession?.audioVideo.bindVideoElement(tile.tileId, videoElems[index])
                const name = getUserNameByAttendeeIdFromList(tile.boundAttendeeId!)
                titles.push(name)
            }
        })
        activeRenderer.setSrcVideoElements(videoElems)
        activeRenderer.setTitles(titles)


    },[activeTilesId]) // eslint-disable-line

    //// (2-2) for All Renderer
    useEffect(()=>{
        const videoElems = [...Array(allTiles.length)].map((v,i)=>{return document.getElementById(`video${i}`) as HTMLVideoElement})
        // console.log(videoElems)
        const titles:string[] = []
        allTiles.forEach((tile,index)=>{
            if(tile.tileId){
                meetingSession?.audioVideo.bindVideoElement(tile.tileId, videoElems[index])
                const name = getUserNameByAttendeeIdFromList(tile.boundAttendeeId!)
                titles.push(name)
            }
        })
        allRenderer.setSrcVideoElements(videoElems)
        allRenderer.setTitles(titles)
    },[allTilesId]) // eslint-disable-line

    return (
        <div style={{ width: width, height: height, position:"relative" }}>

            <div style={{ width: "100%", position:"relative"}}>
                {/* <canvas width="1920" height="1080" id="ActiveRecorderCanvas" style={{ width: "40%", border: "medium solid #ffaaaa"}} />
                <canvas width="1920" height="1080" id="AllRecorderCanvas"    style={{ width: "40%", border: "medium solid #ffaaaa"}} /> */}
                <canvas width="800" height="600" id="ActiveRecorderCanvas" style={{ width: "40%", border: "medium solid #ffaaaa"}} />
                <canvas width="800" height="600" id="AllRecorderCanvas"    style={{ width: "40%", border: "medium solid #ffaaaa"}} />
            </div>

            <div style={{ width: "100%", display:"flex", flexWrap:"wrap" }}>
                <video id="activeVideo0" style={{ width: "10%", height:"10%"}}/>
                <video id="activeVideo1" style={{ width: "10%", height:"10%"}} />
                <video id="activeVideo2" style={{ width: "10%", height:"10%"}} />

                <video id="video0" style={{ width: "10%", height:"10%"}} />
                <video id="video1" style={{ width: "10%", height:"10%"}} />
                <video id="video2" style={{ width: "10%", height:"10%"}} />
                <video id="video3" style={{ width: "10%", height:"10%"}} />
                <video id="video4" style={{ width: "10%", height:"10%"}} />
                <video id="video5" style={{ width: "10%", height:"10%"}} />
                <video id="video6" style={{ width: "10%", height:"10%"}} />
                <video id="video7" style={{ width: "10%", height:"10%"}} />
                <video id="video8" style={{ width: "10%", height:"10%"}} />
                <video id="video9" style={{ width: "10%", height:"10%"}} />
                <video id="video10" style={{ width: "10%", height:"10%"}} />
                <video id="video11" style={{ width: "10%", height:"10%"}} />
                <video id="video12" style={{ width: "10%", height:"10%"}} />
                <video id="video13" style={{ width: "10%", height:"10%"}} />
                <video id="video14" style={{ width: "10%", height:"10%"}} />
                <video id="video15" style={{ width: "10%", height:"10%"}} />
                <video id="video16" style={{ width: "10%", height:"10%"}} />
                <video id="video17" style={{ width: "10%", height:"10%"}} />
                <video id="video18" style={{ width: "10%", height:"10%"}} />
            </div>
        </div>
    )
}


