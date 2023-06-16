var SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
var STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;

const url = "wss://arena.geoscan.aero:8443";
const firstStreamName = "rtsp://drom:DRom2022@10.10.33.19:554"
// const firstStreamName = "rtsp://drom:DRom2022@10.10.33.25:554/ISAPI/Streaming/Channels/102"
const secondStreamName = "rtsp://drom:DRom2022@10.10.33.22:554"
// const secondStreamName = "rtsp://drom:DRom2022@10.10.33.22:554/ISAPI/Streaming/Channels/102"
const thirdStreamName = "rtsp://drom:DRom2022@10.10.33.13:554"
// const thirdStreamName = "rtsp://drom:DRom2022@10.10.33.28:554/ISAPI/Streaming/Channels/102";

var volume = 0;
var session;
var resolution_for_wsplayer;

var resolution = getUrlParam("resolution");
var mediaProvider = getUrlParam("mediaProvider") || null;
var mseCutByIFrameOnly = getUrlParam("mseCutByIFrameOnly");


let video_player = document.getElementById('video_player');
let current_video = 0;
let current_stream_name = firstStreamName;
let current_stream_display = video_player;

let stream;

function init_page() {
    //init api
    try {
        Flashphoner.init({
            flashMediaProviderSwfLocation: 'dep/media-provider.swf',
            receiverLocation: 'dep/dependencies/websocket-player/WSReceiver2.js',
            decoderLocation: 'dep/dependencies/websocket-player/video-worker2.js',
            preferredMediaProvider: "WebRTC"
        });
    } catch(e) {
        $("#notifyFlash").text("Your browser doesn't support Flash or WebRTC technology needed for this example");
        return;
    }

    if (Flashphoner.getMediaProviders()[0] === "WSPlayer") {
        Flashphoner.playFirstSound();
    } else if (Browser.isSafariWebRTC() || Flashphoner.getMediaProviders()[0] === "MSE") {
        connect().catch(function () {
            console.log("Disconnected");
        });
        return;
    }
    connect();
}

function onDisconnected() {
    console.log("Disconnected");
}

function onConnected(session) {
    console.log("Connected");
}

function onStopped(session) {
    console.log("Stopped");
}


function onPlaying(stream) {
    console.log("Started");
}

function connect() {
    if (Flashphoner.getSessions().length > 0) {
        session = Flashphoner.getSessions()[0];
        if (session.getServerUrl() == url) {
            onConnected(session);
            return;
        } else {
            //remove session DISCONNECTED and FAILED callbacks
            session.on(SESSION_STATUS.DISCONNECTED, function(){});
            session.on(SESSION_STATUS.FAILED, function(){});
            session.disconnect();
        }
    }
    //create session
    console.log("Create new session with url " + url);
    session = Flashphoner.createSession({urlServer: url}).on(SESSION_STATUS.ESTABLISHED, function(session){
        //session connected, start playback
        onConnected(session);
        playStream(current_stream_name, video_player);
    }).on(SESSION_STATUS.DISCONNECTED, function(){
        onDisconnected();
    }).on(SESSION_STATUS.FAILED, function(){
        onDisconnected();
    });
}

function getStream(options) {
    var strm = session.createStream(options).on(STREAM_STATUS.PENDING, function (stream) {
        var video = document.getElementById(stream.id());
    }).on(STREAM_STATUS.PLAYING, function (stream) {
        onPlaying(stream);
    }).on(STREAM_STATUS.STOPPED, function (stream) {
        onStopped(stream);
    }).on(STREAM_STATUS.FAILED, function(stream) {
        // console.log(stream.status())
        onStopped(stream);
    }).on(STREAM_STATUS.NOT_ENOUGH_BANDWIDTH, function(stream){
        console.log("Not enough bandwidth, consider using lower video resolution or bitrate. Bandwidth " + (Math.round(stream.getNetworkBandwidth() / 1000)) + " bitrate " + (Math.round(stream.getRemoteBitrate() / 1000)));
    });
    return strm;
}

function playStream() {
    var options = {
        flashShowFullScreenButton: true
    };

    if (Flashphoner.getMediaProviders()[0] === "MSE" && mseCutByIFrameOnly) {
        options.mediaConnectionConstraints = {
            cutByIFrameOnly: mseCutByIFrameOnly
        }
    }
    if (resolution_for_wsplayer) {
        options.playWidth = resolution_for_wsplayer.playWidth;
        options.playHeight = resolution_for_wsplayer.playHeight;
    } else if (resolution) {
        options.playWidth = resolution.split("x")[0];
        options.playHeight = resolution.split("x")[1];
    }

    options.name = current_stream_name;
    options.display = current_stream_display;
    stream  = getStream(options);
    stream.unmuteRemoteAudio();
    stream.setVolume(volume);
    stream.play();
    console.log("play: " + current_stream_name);
}

function stopStream() {
    stream.stop();
    session.disconnect();
}
