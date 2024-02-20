import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";
import { initializeApp } from "./bridge/bridgeLib";

// Init VK Mini App
initializeApp().then(() => {
    ReactDOM.render(<App />, document.getElementById("root"));
})
.catch((error) => {
    console.log(error)
    ReactDOM.render(<App />, document.getElementById("root"));
})
