import React, { useEffect, useMemo, useState } from "react"
import clsx from 'clsx';
import { CssBaseline, AppBar, Drawer, Toolbar } from '@material-ui/core'
import { createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import { DrawerOpener } from "./components/appbars/DrawerOpener";
import { Title } from "./components/appbars/Title";
import { useAppState } from "../../providers/AppStateProvider";
import { bufferHeight, useStyles } from "./css";
import { DeviceEnabler } from "./components/appbars/DeviceEnabler";
import { DialogOpener } from "./components/appbars/DialogOpener";
import { FeatureEnabler } from "./components/appbars/FeatureEnabler";
import { ScreenType, SwitchButtons } from "./components/appbars/SwitchButtons";
import { SettingDialog } from "./components/dialog/SettingDialog";
import { LeaveMeetingDialog } from "./components/dialog/LeaveMeetingDialog";
import { CustomAccordion } from "./components/sidebars/CustomAccordion";
import { AttendeesTable } from "./components/sidebars/AttendeesTable";
import { ChatArea } from "./components/sidebars/ChatArea";
import { WhiteboardPanel } from "./components/sidebars/WhiteboardPanel";
import { CreditPanel } from "./components/sidebars/CreditPanel";
import { FullScreenView } from "./components/ScreenView/FullScreenView";
import { FeatureView } from "./components/ScreenView/FeatureView";
import { GridView } from "./components/ScreenView/GridView";
import { OnetimeCodePanel } from "./components/sidebars/OnetimeCodePanel";
import { ManagerControllerPanel } from "./components/sidebars/ManagerControllerPanel";

const toolbarHeight = 20
const drawerWidth = 240;

const theme = createMuiTheme({
    mixins: {
        toolbar: {
            minHeight: toolbarHeight,
        }
    },
});


export const MeetingRoom = () => {
    const classes = useStyles()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const { screenHeight, screenWidth, meetingName,
            audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, isShareContent,
            startShareScreen, stopShareScreen,} = useAppState()

    const [guiCounter, setGuiCounter] = useState(0)

    const [settingDialogOpen, setSettingDialogOpen] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [screenType, setScreenType] = useState<ScreenType>("FeatureView");

    const setAudioInputEnable = async() =>{
        await audioInputDeviceSetting!.setAudioInputEnable(!audioInputDeviceSetting!.audioInputEnable)
        setGuiCounter(guiCounter+1)
    }
    const setVideoInputEnable = async() =>{
        const enable = !videoInputDeviceSetting!.videoInputEnable
        await videoInputDeviceSetting!.setVideoInputEnable(enable)
        if(enable){
            videoInputDeviceSetting!.startLocalVideoTile()
        }else{
            videoInputDeviceSetting!.stopLocalVideoTile()
        }
        setGuiCounter(guiCounter+1)
    }
    const setAudioOutputEnable = async() =>{
        await audioOutputDeviceSetting!.setAudioOutputEnable(!audioOutputDeviceSetting!.audioOutputEnable)
        setGuiCounter(guiCounter+1)
    }

    const enableShareScreen = (val:boolean) =>{
        if(val){
            startShareScreen()
        }else{
            stopShareScreen()
        }
    }

    const mainView = useMemo(()=>{
        switch(screenType){
            case "FullView":
                return <FullScreenView height={screenHeight-toolbarHeight-bufferHeight} width={drawerOpen?screenWidth-drawerWidth:screenWidth} pictureInPicture={"None"} focusTarget={"SharedContent"}/>
            case "FeatureView":
                return <FeatureView height={screenHeight-toolbarHeight-bufferHeight} width={drawerOpen?screenWidth-drawerWidth:screenWidth} pictureInPicture={"None"} focusTarget={"SharedContent"}/>
            case "GridView":
                return <GridView  height={screenHeight-toolbarHeight-bufferHeight} width={drawerOpen?screenWidth-drawerWidth:screenWidth} excludeSharedContent={false}/>
            default:
                return (<>Not found screen type:{screenType}</>)
        }
    },[screenType, screenHeight, screenWidth]) // eslint-disable-line



    useEffect(()=>{
        const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement
        audioElement.autoplay=false
        audioOutputDeviceSetting!.setOutputAudioElement(audioElement)
    },[]) // eslint-disable-line


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className={classes.root}>


                <AppBar position="absolute" className={clsx(classes.appBar)}>
                    <Toolbar className={classes.toolbar}>
                        <div className={classes.toolbarInnnerBox}>
                            <DrawerOpener open={drawerOpen} setOpen={setDrawerOpen} />
                        </div>
                        <div className={classes.toolbarInnnerBox}>
                            <Title title={meetingName||""} />
                        </div>
                        <div className={classes.toolbarInnnerBox}>
                            <div className={classes.toolbarInnnerBox}>
                                <DeviceEnabler type="Mic" enable={audioInputDeviceSetting!.audioInputEnable} setEnable={setAudioInputEnable}/>
                                <DeviceEnabler type="Camera" enable={videoInputDeviceSetting!.videoInputEnable} setEnable={setVideoInputEnable}/>
                                <DeviceEnabler type="Speaker" enable={audioOutputDeviceSetting!.audioOutputEnable} setEnable={setAudioOutputEnable}/>
                                <DialogOpener type="Setting" onClick={()=>setSettingDialogOpen(true)}/>
                                <span className={clsx(classes.menuSpacer)}>  </span>
                                <FeatureEnabler type="ShareScreen" enable={isShareContent} setEnable={(val:boolean)=>{enableShareScreen(val)}}/>
                                <span className={clsx(classes.menuSpacer)}>  </span>
                                <span className={clsx(classes.menuSpacer)}>  </span>
                                <SwitchButtons type="ScreenView" selected={screenType} onClick={(val)=>{setScreenType(val as ScreenType)}}/>
                                <span className={clsx(classes.menuSpacer)}>  </span>
                                <span className={clsx(classes.menuSpacer)}>  </span>
                                <DialogOpener type="LeaveMeeting" onClick={()=>setLeaveDialogOpen(true)}/>

                            </div>
                            <div className={classes.toolbarInnnerBox}>
                            </div>
                        </div>
                    </Toolbar>
                </AppBar>
                <SettingDialog      open={settingDialogOpen} onClose={()=>setSettingDialogOpen(false)} />
                <LeaveMeetingDialog open={leaveDialogOpen} onClose={()=>setLeaveDialogOpen(false)} />


                <div style={{marginTop:toolbarHeight, position:"absolute", display:"flex"}}>
                    <Drawer
                        variant="permanent"
                        classes={{
                            paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
                        }}
                        open={drawerOpen}
                    >
                        <CustomAccordion title="Member">
                            <AttendeesTable />
                        </CustomAccordion>

                        <CustomAccordion title="Chat">
                            <ChatArea/>
                        </CustomAccordion>

                        <CustomAccordion title="Whiteboard">
                            <WhiteboardPanel/>
                        </CustomAccordion>

                        {/* <CustomAccordion title="RecordMeeting (exp.)">
                            <RecorderPanel />
                        </CustomAccordion> */}
                        
                        {/* <CustomAccordion title="BGM/SE">
                            <BGMPanel />
                        </CustomAccordion> */}
                        
                        <CustomAccordion title="About">
                            <CreditPanel />
                        </CustomAccordion>

                        <CustomAccordion title="OnetimeCode">
                            <OnetimeCodePanel />
                        </CustomAccordion>

                        <CustomAccordion title="StartManagerPanel">
                            <ManagerControllerPanel />
                        </CustomAccordion>
                                                

                    </Drawer>

                    <main style={{height:`${screenHeight - toolbarHeight - bufferHeight}px`}}>
                        {mainView}
                    </main>
                </div>
            </div>

            {/* ************************************** */}
            {/* *****   Hidden Elements          ***** */}
            {/* ************************************** */}
            <div>
                <audio id="for-speaker" style={{display:"none"}}/>

            </div>

        </ThemeProvider>
    )
}
