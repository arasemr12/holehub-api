const { default: axios } = require("axios");

const checkVideo = async(id) => {
    let res = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?id=${id}&key=${process.env.YOUTUBE_API_KEY}`,{
        headers:{
            "Content-Type":'application/json'
        }
    });

    let data = res.data;

    if(!data.pageInfo || !data.pageInfo.totalResults || data.pageInfo.totalResults < 1) return false;
    return true;
};

const getVideoThumbnail = async(id) => {
    let res = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?id=${id}&part=snippet&key=${process.env.YOUTUBE_API_KEY}`,{
        headers:{
            "Content-Type":'application/json'
        }
    });

    let data = res.data;

    if(!data.pageInfo || !data.pageInfo.totalResults || data.pageInfo.totalResults < 1) return false;

    return data.items[0].snippet.thumbnails.standard.url;
};

module.exports = {checkVideo,getVideoThumbnail};
