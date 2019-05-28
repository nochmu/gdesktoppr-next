#!/usr/bin/env node

const request = require('request');
const fs = require('fs');
const url = require('url');
const path = require("path");
const expandHomeDir = require('expand-home-dir');

let cfg = require('home-config').load('.gdesktoppr-next', {
    apiKey : null,
    storage: '~/Pictures/Wallpapers',
    width: 1920,
    height: 1080
});

const apiCall="https://api.desktoppr.co/1/wallpapers/random?auth_token="+cfg.apiKey;

// It seems that the Desktoppr API has no parameter for the image resolution.
// So fetch images until a suitable image is found or the limit is reached
const DIMENSION_CHECK_LIMIT = 10;


/** Executes the given command
 * @param cmd Command to execute
 */
function execCmd(cmd)
{
    console.log(cmd);
    let exec = require('child_process').exec;
    exec(cmd, function(error, stdout, stderr) {
        if(error) throw error;
        if(stdout) console.log(stdout);
        if(stderr) console.error(stderr);
    });
}

/** Changes the picture of the background
 * @param filePath path to the picture.
 */
function setBackground(filePath)
{
    let cmd = 'gsettings set org.gnome.desktop.background picture-uri file://'+filePath;
    execCmd(cmd);
}

/** Changes the picture of the lock screen
 * @param filePath path to the picture
 */
function setScreensaver(filePath)
{
    let cmd = 'gsettings set org.gnome.desktop.screensaver picture-uri file://'+filePath;
    execCmd(cmd);
}



/* @returns true if the given resolution is better or equal to the configuration.
 */
function checkDimension(height, width)
{
    let req = Math.round(cfg.width/cfg.height);
    let pic = Math.round(width/height);
    return req == pic && width >= cfg.width;
}


function fetchPicture(callback, recCount=0)
{
    request(apiCall, function (error, response, body) {
        if(error) throw error;
        body = JSON.parse(body);


        if(checkDimension(body.response.height, body.response.width))
        {
            let imgUrl = body.response.image.url;
            let filename = path.basename(url.parse(imgUrl).pathname);
            let localFile = path.join(expandHomeDir(cfg.storage),filename);
            request(imgUrl).pipe(fs.createWriteStream(localFile)).on('close', function(){
                callback(localFile);
            });
        }else {
            if(recCount < DIMENSION_CHECK_LIMIT)
                fetchPicture(callback,recCount+1);
            else
                throw "no picture found!";
        }
    });
}

// MAIN - Do it!

fetchPicture(function(filePath){
    setBackground(filePath);
    setScreensaver(filePath);
});
