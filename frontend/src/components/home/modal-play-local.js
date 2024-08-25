import Component from "../../library/component.js";
import store from "../../store/index.js";
import { navigateTo } from "../../utils/router.js";
import { home } from "/src/utils/langPack.js";

export default class ModalPlayLocal extends Component {
    constructor() {
        super({ element: document.getElementById("modalPlayLocal") });
        this.currentLang = store.state.language;
        store.events.subscribe("stateChange", () => this.onStateChange());
        this.render();
    }
