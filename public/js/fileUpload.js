const rootStyles = window.getComputedStyle(document.documentElement)
const getPropertyValue = rootStyles.getPropertyValue('--game-cover-width-large');

if (getPropertyValue != null && getPropertyValue != '') {
    ready();
} else {
    document.getElementById('main-css').addEventListener('load', ready)
}

function ready() {
    console.log('ready fileupload');
    const coverWidth = parseFloat(getPropertyValue)
    const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--game-cover-aspect-ratio'))
    const coverHeight = coverWidth / coverAspectRatio

    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode,
    )
    
    FilePond.setOptions({
        stylePanelAspectRatio: 1 / coverAspectRatio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight
    })
    
    FilePond.parse(document.body);
}