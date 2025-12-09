const MESSAGE = cast.framework.messages.MessageType;
const ERROR = cast.framework.messages.ErrorType;
const ERROR_REASON = cast.framework.messages.ErrorReason;
const COMMAND = cast.framework.messages.Command;
const EVENT = cast.framework.events.EventType;
const CAPABILITIES = cast.framework.system.DeviceCapabilities;

const context = cast.framework.CastReceiverContext.getInstance();

const LOG_RECEIVER_TAG = 'StremioReceiver';

const playerManager = context.getPlayerManager();
// playerManager.setSupportedMediaCommands(COMMAND.LOAD | COMMAND.SEEK | COMMAND.PLAY | COMMAND.PAUSE | COMMAND.STOP | COMMAND.GET_STATUS);

const castReceiverOptions = new cast.framework.CastReceiverOptions();
castReceiverOptions.useShakaForHls = true;

const debug = (message) => castDebugLogger.debug(LOG_RECEIVER_TAG, message);

context.addEventListener(EVENT.READY, () => {
    console.log('READY');
    
    const deviceCapabilities = context.getDeviceCapabilities();
    if (deviceCapabilities && deviceCapabilities[CAPABILITIES.IS_HDR_SUPPORTED]) {
        console.log('HDR SUPPORTED');
    }

    if (deviceCapabilities && deviceCapabilities[CAPABILITIES.IS_DV_SUPPORTED]) {
        console.log('DV SUPPORTED');
    }
});

playerManager.addEventListener(EVENT.MEDIA_STATUS, (event) => {
    console.log('MEDIA_STATUS');
});

playerManager.setMessageInterceptor(MESSAGE.LOAD, (loadRequestData) => {
    console.log('LOAD');
    console.log(loadRequestData.media);

    const error = new cast.framework.messages.ErrorData(ERROR.LOAD_FAILED);
    if (!loadRequestData.media || !loadRequestData.media.contentId) {
        error.reason = ERROR_REASON.INVALID_PARAM;
        return error;
    }

    const { origin, searchParams } = new URL(loadRequestData.media.contentId);
    const mediaURL = searchParams.get('mediaURL');

    if (mediaURL) {
		fetch(`${origin}/hlsv2/probe?mediaURL=${encodeURIComponent(mediaURL)}`)
			.then((res) => res.json())
			.then((probe) => {
				console.log(probe);
			})
			.catch((e) => {
				console.error(e);
			});
    }

    return loadRequestData;

    // return fetch(loadRequestData.media.contentUrl)
    //     .then((asset) => {
    //         if (!asset) {
    //             throw ERROR_REASON.INVALID_REQUEST;
    //         }

    //         loadRequestData.media.contentUrl = asset.url;
    //         loadRequestData.media.metadata = asset.metadata;
    //         loadRequestData.media.tracks = asset.tracks;
    //         return loadRequestData;
    //     }).catch((error) => {
    //         error.reason = reason;
    //         return error;
    //     });
});

context.start(castReceiverOptions);