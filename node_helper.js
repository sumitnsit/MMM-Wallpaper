const NodeHelper = require("node_helper")
const Log = require("logger");
const FileSystem = require('fs');
const express = require('express');

module.exports = NodeHelper.create({

  config: {
    stopSlideShow : false,
    autoResumeTime : 30,
    alreadyRunning : false
  },

  start: function() {
    Log.log("MMM_Wallpaper module started");
    
    this.expressApp.use("/myimages",express.static("modules/MMM-Wallpaper/images", {maxAge: 3600000}))


    this.expressApp.get("/next", (req, res) => {
			Log.info("Got new message?", req.query)
      this.config.stopSlideShow=true
      this.config.autoResumeTime=0
			const index = this.getNextIndex()
      const fileName = this.config.photos[index]
      Log.info("Filename: ", fileName)
      this.sendSocketNotification("NEW_IMAGE", { "filename": fileName, "transition": ""})
			res.status(200).send({status: 200})
		})

    this.expressApp.get("/last", (req, res) => {
			Log.info("Got new message?", req.query)
      this.config.stopSlideShow=true
      this.config.autoResumeTime=0
			const index = this.getPreviousIndex()
      const fileName = this.config.photos[index]
      Log.info("Filename: ", fileName)
      this.sendSocketNotification("NEW_IMAGE", { "filename": fileName, "transition": ""})
			res.status(200).send({status: 200})
		})

    this.expressApp.get("/resume", (req, res) => {
			Log.info("Got new message?", req.query)
      this.config.stopSlideShow=false
      this.config.autoResumeTime=30
			res.status(200).send({status: 200})
		})

    this.expressApp.get("/reloadImages", (req, res) => {
			Log.info("Reload images!", req.query)
      this.config.photos  = FileSystem.readdirSync("modules/MMM-Wallpaper/images");
      this.config.index = 0;
      res.status(200).send({status: 200})
		})
  },
  
  async socketNotificationReceived(notification, payload) {
    Log.info(notification, payload)
    if(notification == "BOOT" && this.config.alreadyRunning == false) {
      this.config.alreadyRunning = true
      this.config.photos  = FileSystem.readdirSync("modules/MMM-Wallpaper/images");
      this.config.index = 0;
      Log.info("Starting slide show", this.config.alreadyRunning)
      this.startSlideShow()
      this.autoResume()
    }
  },

  getNextIndex(){
    var index = this.config.index
    index++
    if(index == this.config.photos.length){
      index = 0
    }
    this.config.index = index
    return index
  },

  getPreviousIndex(){
    var index = this.config.index
    index--
    if(index == -1){
      index = this.config.photos.length-1
    }
    this.config.index = index
    return index
  },

  autoResume(){
    if(this.config.autoResumeTime < 30){
      this.config.autoResumeTime++
    } else if(this.config.stopSlideShow) {
      Log.info("Resuming slideshow")
      this.config.stopSlideShow=false
    }
    setTimeout(() => {
      this.autoResume()
    }, 1000)
  },

  startSlideShow: function(){
    if(!this.config.stopSlideShow){
      const index = this.getNextIndex()
      if(index == 0){
        // reload photos before starting from 0 index
        this.config.photos  = FileSystem.readdirSync("modules/MMM-Wallpaper/images");
      }
      const fileName = this.config.photos[index]
      this.sendSocketNotification("NEW_IMAGE", { "filename": fileName, "transition": "background-image 2s ease-out"})
    }
    setTimeout(() => {
      this.startSlideShow()
    }, 15000)
  }
})
