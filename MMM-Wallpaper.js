Module.register("MMM-Wallpaper", {

  defaults: {
    imageName: "buddha.jpg"
  },

  /**
   * Apply the default styles.
   */
  getStyles() {
    return ["wallpaper.css"]
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start() {
    this.imageName = this.config.imageName
    this.sendSocketNotification("BOOT", {})
  },

  /**
   * Handle notifications received by the node helper.
   * So we can communicate between the node helper and the module.
   *
   * @param {string} notification - The notification identifier.
   * @param {any} payload - The payload data`returned by the node helper.
   */
  socketNotificationReceived: function(notification, payload) {
    console.log("SocketNotification received: ",notification, payload)

    if (notification === "NEW_IMAGE") {
      this.imageName = `${payload.filename}`
      document.getElementById("mybg").style.transition = payload.transition
      document.getElementById("mybg").style.backgroundImage = "url('myimages/" + this.imageName + "')"
    }
  },

  /**
   * Render the page we're on.
   */
  getDom() {
    const wrapper = document.createElement("div")
    wrapper.className = 'bgimage'
    wrapper.id = "mybg"
    wrapper.style.backgroundImage = `url(\'myimages/${this.imageName}\')`
    const gradient = document.createElement("div")
    gradient.className = 'bgGradient'
    wrapper.appendChild(gradient)
    return wrapper
  },

  /**
   * This is the place to receive notifications from other modules or the system.
   *
   * @param {string} notification The notification ID, it is preferred that it prefixes your module name
   * @param {number} payload the payload type.
   */
  notificationReceived(notification, payload) {

  }
})
